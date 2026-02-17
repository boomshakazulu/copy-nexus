const mongoose = require("mongoose");
const { User, PendingUser, Order } = require("../models");
const { signToken } = require("../utils/auth");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendMail } = require("../utils/mailer");
const {
  badRequest,
  notFound,
  unprocessable,
  unauthorized,
} = require("../utils/httpError");

const isEmail = (q = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q);
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

module.exports = {
  async getUser(req, res) {
    const { id, email } = req.query || {};
    const requester = req.user || {};
    const isAdmin = requester.role === "admin";

    if (!id && !email) {
      throw badRequest("id or email is required");
    }

    let user = null;

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw badRequest("Invalid user id");
      }
      if (!isAdmin && requester.id !== id) {
        throw unauthorized("Unauthorized");
      }
      user = await User.findById(id).lean();
    } else if (email) {
      const normalized = String(email).trim().toLowerCase();
      if (!isEmail(normalized)) {
        throw badRequest("Invalid email");
      }
      if (!isAdmin && normalized !== String(requester.email || "").toLowerCase()) {
        throw unauthorized("Unauthorized");
      }
      user = await User.findOne({ email: normalized }).lean();
    } else if (requester.email) {
      user = await User.findOne({
        email: String(requester.email).trim().toLowerCase(),
      }).lean();
    }

    if (!user) {
      throw notFound("User not found");
    }

    const orders = await Order.find({
      "customer.email": user.email,
    })
      .sort({ createdAt: -1 })
      .lean();

    delete user.password;
    delete user.passwordHash;
    delete user.__v;

    return res.json({ user, orders });
  },

  async createUser(req, res) {
    // Backwards-compatible: route to verification flow
    return module.exports.requestSignup(req, res);
  },

  async requestSignup(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      throw badRequest("Email and password are required");
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isEmail(normalizedEmail)) {
      throw unprocessable("Invalid email");
    }

    if (typeof password !== "string" || password.length < 8) {
      throw unprocessable("Password must be at least 8 characters");
    }

    const existingUser = await User.findOne({ email: normalizedEmail })
      .select("_id")
      .lean();
    if (existingUser) {
      throw unprocessable("Email already registered");
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const verificationCode = generateCode();
    const hashedToken = hashToken(rawToken);
    const hashedCode = hashToken(verificationCode);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const passwordHash = await bcrypt.hash(password, 10);

    await PendingUser.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        passwordHash,
        tokenHash: hashedToken,
        tokenExpiresAt: expiresAt,
        codeHash: hashedCode,
        codeExpiresAt: expiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const baseUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";
    const link = `${baseUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(
      normalizedEmail
    )}`;

    const subject = "Verify your Copy Nexus email";
    const text = `Welcome to Copy Nexus!\n\nPlease verify your email to finish creating your account:\n${link}\n\nOr enter this verification code:\n${verificationCode}\n\nThis link/code expires in 1 hour. If you didn't request it, you can ignore this email.`;
    const html = `
      <p>Welcome to Copy Nexus!</p>
      <p>Please verify your email to finish creating your account:</p>
      <p><a href="${link}">Verify email address</a></p>
      <p>Or enter this verification code:</p>
      <p><strong>${verificationCode}</strong></p>
      <p>This link expires in 1 hour. If you didn't request it, you can ignore this email.</p>
    `;

    await sendMail({ to: normalizedEmail, subject, text, html });
    return res.status(201).json({ ok: true });
  },

  async login(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password) {
      throw badRequest("Email and password are required");
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isEmail(normalizedEmail)) {
      throw unprocessable("Invalid email");
    }

    if (typeof password !== "string") {
      throw unprocessable("Invalid password");
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+passwordHash");

    if (!user) {
      throw unauthorized("Invalid credentials");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw unauthorized("Invalid credentials");
    }

    const token = signToken({
      email: user.email,
      id: user._id,
      role: user.role,
    });

    const publicUser = user.toObject();
    delete publicUser.password;
    delete publicUser.passwordHash;
    delete publicUser.__v;

    return res.json({ user: publicUser, token });
  },

  async verifyEmail(req, res) {
    const { email, token, code } = req.body || {};
    if (!email || (!token && !code)) {
      throw badRequest("Email and token or code are required");
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isEmail(normalizedEmail)) {
      throw unprocessable("Invalid email");
    }

    const now = new Date();
    let pending = null;
    if (token) {
      pending = await PendingUser.findOne({
        email: normalizedEmail,
        tokenHash: hashToken(token),
        tokenExpiresAt: { $gt: now },
      }).lean();
    } else if (code) {
      pending = await PendingUser.findOne({
        email: normalizedEmail,
        codeHash: hashToken(String(code).trim()),
        codeExpiresAt: { $gt: now },
      }).lean();
    }

    if (!pending) {
      throw unauthorized("Invalid or expired verification token");
    }

    const existingUser = await User.findOne({ email: normalizedEmail })
      .select("_id")
      .lean();
    if (existingUser) {
      await PendingUser.deleteOne({ email: normalizedEmail });
      throw unprocessable("Email already registered");
    }

    const user = await User.create({
      email: normalizedEmail,
      passwordHash: pending.passwordHash,
    });

    await PendingUser.deleteOne({ email: normalizedEmail });

    const publicUser = user.toObject();
    delete publicUser.password;
    delete publicUser.passwordHash;
    delete publicUser.__v;

    const authToken = signToken({
      email: publicUser.email,
      id: publicUser._id,
      role: publicUser.role,
    });

    return res.json({ user: publicUser, token: authToken });
  },

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      throw badRequest("Current and new password are required");
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      throw unprocessable("Password must be at least 8 characters");
    }

    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw unauthorized("Invalid user");
    }

    const user = await User.findById(userId).select("+passwordHash");
    if (!user) {
      throw notFound("User not found");
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      throw unauthorized("Invalid credentials");
    }

    user.password = newPassword;
    await user.save();

    return res.json({ ok: true });
  },

  async forgotPassword(req, res) {
    const { email } = req.body || {};
    if (!email) {
      throw badRequest("Email is required");
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isEmail(normalizedEmail)) {
      throw unprocessable("Invalid email");
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Don't reveal existence
      return res.json({ ok: true });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    user.resetToken = hashed;
    user.resetTokenExpiresAt = expiresAt;
    await user.save();

    const baseUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";
    const link = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(
      user.email
    )}`;

    const subject = "Reset your Copy Nexus password";
    const text = `We received a password reset request. Use this link to reset your password:\n\n${link}\n\nThis link expires in 1 hour. If you didn't request it, you can ignore this email.`;
    const html = `
      <p>We received a password reset request.</p>
      <p><a href="${link}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request it, you can ignore this email.</p>
    `;

    await sendMail({ to: user.email, subject, text, html });
    return res.json({ ok: true });
  },

  async resetPassword(req, res) {
    const { email, token, password } = req.body || {};
    if (!email || !token || !password) {
      throw badRequest("Email, token, and password are required");
    }
    if (typeof password !== "string" || password.length < 8) {
      throw unprocessable("Password must be at least 8 characters");
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isEmail(normalizedEmail)) {
      throw unprocessable("Invalid email");
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email: normalizedEmail,
      resetToken: hashed,
      resetTokenExpiresAt: { $gt: new Date() },
    }).select("+passwordHash");

    if (!user) {
      throw unauthorized("Invalid or expired reset token");
    }

    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiresAt = null;
    await user.save();

    return res.json({ ok: true });
  },
};
