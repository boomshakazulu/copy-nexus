const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/],
    },
    passwordHash: {
      type: String,
      select: false,
      required: true, // OK to keep required now that we set it before validate
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetToken: { type: String, default: null },
    resetTokenExpiresAt: { type: Date, default: null },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  },
  { timestamps: true }
);

// Virtual for plain password
userSchema.virtual("password")
  .set(function (plain) { this._plainPassword = plain; })
  .get(function () { return undefined; });

/**
 * IMPORTANT: pre('validate') so passwordHash is set BEFORE validation
 */
userSchema.pre("validate", async function (next) {
  try {
    if (this._plainPassword != null) {
      if (this._plainPassword.length < 8) {
        this.invalidate("password", "Password must be at least 8 characters");
        return next();
      }
      this.passwordHash = await bcrypt.hash(this._plainPassword, 10);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Query updates: hash if { password: 'plain' } is provided
async function hashPasswordInUpdate(query) {
  const update = query.getUpdate() || {};
  const set = update.$set ?? update;

  const plain = set.password;
  if (!plain) return;

  if (plain.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const hash = await bcrypt.hash(plain, 10);
  set.passwordHash = hash;
  delete set.password;

  if (update.$set) update.$set = set;
  query.setUpdate(update);
}

userSchema.pre("findOneAndUpdate", async function (next) {
  try { await hashPasswordInUpdate(this); next(); } catch (e) { next(e); }
});

userSchema.pre("updateOne", async function (next) {
  try { await hashPasswordInUpdate(this); next(); } catch (e) { next(e); }
});

userSchema.methods.isCorrectPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = model("User", userSchema);
