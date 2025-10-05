const mongoose = require("mongoose");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

module.exports = {
  async getUser(req, res) {
    const { userId } = req.params;

    //Validate id
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // Fetch + populate orders for profile page
    const user = await User.findById(userId)
      .select("-__v")
      .populate({
        path: "orders",
        select: "referenceCode status items amounts.total createdAt",
        options: { sort: { createdAt: -1 } },
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "No user with that ID found" });
    }

    return res.status(200).json(user);
  },

  async createUser(req, res) {
    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.create({ email, passwordHash: password });
    console.log(user);

    // strip sensitive fields
    const publicUser = user.toObject();
    delete publicUser.password;
    delete publicUser.passwordHashed;
    delete publicUser.__v;

    const token = signToken({
      email: publicUser.email,
      id: publicUser._id,
      role: publicUser.role,
    });

    return res.status(201).json({ user: publicUser, token });
  },

  async login(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });
    // explicitly select passwordHash since selection is false
    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    }).select("+passwordHash");

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    //create token for response
    const token = signToken({
      email: user.email,
      id: user._id,
      role: user.role,
    });
    //strip sensitive fields
    const publicUser = user.toObject();
    delete publicUser.password;
    delete publicUser.passwordHashed;
    delete publicUser.__v;

    return res.json({ user: publicUser, token });
  },
};
