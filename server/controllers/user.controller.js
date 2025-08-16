const mongoose = require("mongoose");
const { User } = require("../models");

module.exports = {
  async getUser(req, res) {
    try {
      const { userId } = req.params;

      //Validate id
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId" });
      }

      // Fetch + populate
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

      return res.json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
};
