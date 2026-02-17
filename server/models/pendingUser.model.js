const { Schema, model } = require("mongoose");

const pendingUserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    tokenHash: { type: String, required: true },
    tokenExpiresAt: { type: Date, required: true },
    codeHash: { type: String, required: true },
    codeExpiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

pendingUserSchema.index({ tokenExpiresAt: 1 });

module.exports = model("PendingUser", pendingUserSchema);
