const { Schema, model } = require("mongoose");

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    model: {
      type: String,
      required: true,
    },
    model_norm: {
      type: String,
      index: true,
    },
    compatibleCopiers: {
      type: [String],
      default: [],
      index: true,
    },
    compatibleCopiers_norm: {
      type: [String],
      default: [],
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["copier", "part", "toner"],
    },
    stockQty: {
      type: Number,
      min: 0,
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      required: true,
      default: "archived",
      enum: ["active", "archived"],
    },
    purchasePrice: {
      type: Number,
      min: 0,
    },
    rentable: {
      type: Boolean,
      default: false,
    },
    rentPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (v) {
          return !this.rentable || v != null;
        },
        message: "rentPrice is required when rentable is true",
      },
    },
    rentCostPerScan: {
      type: Number,
      min: 0,
      validate: {
        validator: function (v) {
          return !this.rentable || v != null;
        },
        message: "rentCostPerScan is required when rentable is true",
      },
    },
    rentCostPerPrint: {
      type: Number,
      min: 0,
      validate: {
        validator: function (v) {
          return !this.rentable || v != null;
        },
        message: "rentCostPerPrint is required when rentable is true",
      },
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((u) => /^https?:\/\//.test(u)),
        message: "Images must be valid URLs",
      },
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// normalize helpers
const normOne = (s) => (s || "").toLowerCase().replace(/[\s-_.]/g, "");
const normMany = (v) =>
  (Array.isArray(v) ? v : [v]).filter(Boolean).map(normOne);

// keep normalized in sync
productSchema.pre("save", function (next) {
  this.model_norm = normOne(this.model);
  this.compatibleCopiers_norm = normMany(this.compatibleCopiers);
  next();
});

productSchema.pre("findOneAndUpdate", function (next) {
  const u = this.getUpdate() || {};
  const $set = u.$set || u;

  if ($set.model != null) {
    $set.model_norm = normOne($set.model);
  }

  if ($set.compatibleCopiers != null) {
    $set.compatibleCopiers_norm = normMany($set.compatibleCopiers);
  }

  if (u.$set) u.$set = $set;
  else Object.assign(u, $set);

  this.setUpdate(u);
  next();
});

productSchema.index({
  name: 1,
  category: 1,
  visibility: 1,
  model_norm: 1,
  compatibleCopiers_norm: 1,
});

module.exports = model("Product", productSchema);
