const mongoose = require("mongoose");
const { User, Order } = require("../models");
const { signToken } = require("../utils/auth");
const bcrypt = require("bcrypt");
const {
  badRequest,
  notFound,
  unprocessable,
  unauthorized,
} = require("../utils/httpError");

const isEmail = (q = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q);

module.exports = {
  async getUser(req, res) {
    const { id, email } = req.query || {};

    if (!id && !email) {
      throw badRequest("id or email is required");
    }

    let user = null;

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw badRequest("Invalid user id");
      }
      user = await User.findById(id).lean();
    } else if (email) {
      const normalized = String(email).trim().toLowerCase();
      if (!isEmail(normalized)) {
        throw badRequest("Invalid email");
      }
      user = await User.findOne({ email: normalized }).lean();
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

    try {
      // Triggers pre('validate') to set passwordHash
      const user = await User.create({ email: normalizedEmail, password });

      const publicUser = user.toObject();
      delete publicUser.password;
      delete publicUser.passwordHash;
      delete publicUser.__v;

      const token = signToken({
        email: publicUser.email,
        id: publicUser._id,
        role: publicUser.role,
      });

      return res.status(201).json({ user: publicUser, token });
    } catch (err) {
      throw err;
    }
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
};
