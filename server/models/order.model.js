const { Schema, model } = require("mongoose");
const crypto = require("crypto");

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
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true, trim: true }, // snapshot
    model: { type: String, trim: true },
    qty: { type: Number, min: 1, required: true },
    unitAmount: { type: Number, min: 0, required: true }, // integer COP
    IsRented: { type: Boolean, default: false },
    isCustom: { type: Boolean, default: false },
  },
  { _id: false },
);

const deriveKey = () => {
  const raw =
    process.env.DATA_ENCRYPTION_KEY ||
    process.env.SECRET_JWT ||
    "development-fallback-key";
  return crypto.createHash("sha256").update(String(raw)).digest();
};

const encryptValue = (value) => {
  const key = deriveKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
};

const decryptValue = (value) => {
  if (!value) return "";
  const data = Buffer.from(String(value), "base64");
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const key = deriveKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
};

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },

    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
      idType: { type: String, required: true, trim: true },
      idNumber: { type: String, required: true, trim: true },
      idNumberEncrypted: { type: String, select: false },
      idNumberLast4: { type: String, default: "" },
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
      enum: [
        "pending",
        "paid",
        "failed",
        "canceled",
        "refunded",
        "shipped",
        "completed",
      ],
      default: "pending",
    },
    trackingNumber: { type: String, trim: true, default: "" },
    completedAt: { type: Date, default: null },
    consent: { type: Boolean, default: false },
    consentMeta: {
      acceptedAt: { type: Date, default: null },
      policyVersion: { type: String, default: "" },
      ip: { type: String, default: "" },
      userAgent: { type: String, default: "" },
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

  const idNumber = this.customer?.idNumber;
  if (idNumber && !this.customer.idNumberEncrypted) {
    const last4 = String(idNumber).replace(/\D/g, "").slice(-4);
    this.customer.idNumberEncrypted = encryptValue(idNumber);
    this.customer.idNumberLast4 = last4;
    this.customer.idNumber = last4 ? `***${last4}` : "***";
  }

  next();
});

orderSchema.index({ "customer.email": 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.statics.decryptIdNumber = function (value) {
  try {
    return decryptValue(value);
  } catch (_err) {
    return "";
  }
};

module.exports = model("Order", orderSchema);
