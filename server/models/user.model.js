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
    // store only the hash
    passwordHash: {
      type: String,
      select: false, // must opt-in when querying for login
      required: true,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetToken: { type: String, default: null },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  },
  { timestamps: true }
);

// Accept a virtual plain-text password setter
userSchema
  .virtual("password")
  .set(function (plain) {
    this._plainPassword = plain;
  })
  .get(function () {
    return undefined;
  });

// Hash on create/save if a plain password was provided or hash changed
userSchema.pre("save", async function (next) {
  try {
    if (this._plainPassword) {
      if (this._plainPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      this.passwordHash = await bcrypt.hash(this._plainPassword, 10);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Handle updates that pass { password: "plain" } or {$set:{password:"plain"}}
async function hashPasswordInUpdate(query) {
  const update = query.getUpdate() || {};
  const $set = update.$set || update;

  const plain = $set.password;
  if (!plain) return;

  if (plain.length < 8)
    throw new Error("Password must be at least 8 characters");
  const hash = await bcrypt.hash(plain, 10);

  // write hash to passwordHash and remove plain password
  ($set.$set || $set).passwordHash = hash;
  delete $set.password;
  if (update.$set) update.$set = $set;
  query.setUpdate(update);
}

userSchema.pre("findOneAndUpdate", async function (next) {
  try {
    await hashPasswordInUpdate(this);
    next();
  } catch (e) {
    next(e);
  }
});

userSchema.pre("updateOne", async function (next) {
  try {
    await hashPasswordInUpdate(this);
    next();
  } catch (e) {
    next(e);
  }
});

// Compare candidate password to hash
userSchema.methods.isCorrectPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = model("User", userSchema);
