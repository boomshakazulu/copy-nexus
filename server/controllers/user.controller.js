const mongoose = require("mongoose");
const { User } = require("../models");
const { signToken } = require("../utils/auth");
const bcrypt = require("bcrypt");

module.exports = {
  async createUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    try {
      // Triggers pre('validate') to set passwordHash
      const user = await User.create({ email, password });

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
      if (err?.code === 11000) {
        return res.status(409).json({ error: "email already registered" });
      }
      if (err?.errors?.password?.message) {
        return res.status(400).json({ error: err.errors.password.message });
      }
      return res.status(500).json({ error: "Could not create user" });
    }
  },

  async login(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    }).select("+passwordHash");

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

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
