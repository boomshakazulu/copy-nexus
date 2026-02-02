const { Schema, model } = require("mongoose");

const money = { type: Number, min: 0, default: 0 }; // integer COP

const addressSchema = new Schema(
  {
    streetAddress: { type: String, required: true, trim: true },
    neighborhood: { type: String, trim: true },
    city: { type: String, required: true, default: "Bogotá D.C.", trim: true },
    department: { type: String, required: true, trim: true },
    postalCode: { type: String, trim: true }, // keep just postalCode
  },
  { _id: false },
);

const lineItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true, trim: true }, // snapshot
    model: { type: String, trim: true },
    qty: { type: Number, min: 1, required: true },
    unitAmount: { type: Number, min: 0, required: true }, // integer COP
    IsRented: { type: Boolean, default: false },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },

    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
      idType: { type: String, required: true, trim: true },
      idNumber: { type: String, required: true, trim: true },
      preferredContactMethod: { type: String, trim: true, default: "" },
    },

    shippingAddress: { type: addressSchema, required: true },

    notes: { type: String, trim: true, default: "" },

    items: {
      type: [lineItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Order must have at least one line item.",
      },
    },

    amounts: {
      currency: { type: String, enum: ["COP"], default: "COP" },
      subtotal: money,
      tax: money,
      shipping: money,
      discount: money,
      total: money,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "canceled", "refunded", "shipped"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Keep totals in sync
orderSchema.pre("save", function (next) {
  const items = Array.isArray(this.items) ? this.items : [];
  const subtotal = items.reduce(
    (s, i) => s + (i.unitAmount || 0) * (i.qty || 0),
    0,
  );

  this.amounts = this.amounts || {};
  const tax = this.amounts.tax ?? 0;
  const shipping = this.amounts.shipping ?? 0;
  const discount = this.amounts.discount ?? 0;

  this.amounts.subtotal = Math.round(subtotal);
  this.amounts.total = Math.max(
    0,
    Math.round(subtotal + tax + shipping - discount),
  );

  next();
});

orderSchema.index({ "customer.email": 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = model("Order", orderSchema);
