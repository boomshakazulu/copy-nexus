const { Schema, model } = require("mongoose");

const money = { type: Number, min: 0, default: 0 };

const addressSchema = new Schema(
  {
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: String,
    postalCode: String,
    country: { type: String, default: "CO" },
  },
  { _id: false }
);

const lineItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    // snapshot fields
    name: { type: String, required: true },
    model: String,
    qty: { type: Number, min: 1, required: true },
    unitAmount: { type: Number, min: 0, required: true },
  },
  { _id: false }
);

const paymentAttemptSchema = new Schema(
  {
    provider: { type: String, default: "PayU" },
    referenceCode: { type: String, required: true }, // unique per attempt
    amount: money,
    currency: { type: String, default: "COP" },
    method: { type: String }, // e.g. VISA, MASTERCARD, PSE, NEQUI
    installmentsNumber: { type: Number, min: 1 },

    // PayU echoes/ids
    payUOrderId: String,
    payUTransactionId: String,
    state: String,
    responseCode: String,
    authorizationCode: String,
    pendingReason: String,
    operationDate: Date,

    // webhook/confirmation handling
    signatureVerified: Boolean,
    rawWebhook: Schema.Types.Mixed, // store raw payload for audits
  },
  { _id: false, timestamps: true }
);

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true }, // E.164 like +57...
    },
    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema },

    // items & totals
    items: { type: [lineItemSchema], validate: (v) => v.length > 0 },
    amounts: {
      currency: { type: String, default: "COP" },
      subtotal: money,
      tax: money,
      shipping: money,
      discount: money,
      total: money,
    },

    // order lifecycle
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "canceled", "refunded", "shipped"],
      default: "pending",
    },

    // payments (one order can have multiple attempts)
    payments: { type: [paymentAttemptSchema], default: [] },
  },
  { timestamps: true }
);

// Keep totals in sync
orderSchema.pre("save", function (next) {
  const subtotal = this.items.reduce((s, i) => s + i.unitAmount * i.qty, 0);
  this.amounts.subtotal = subtotal;
  this.amounts.total =
    subtotal + this.amounts.tax + this.amounts.shipping - this.amounts.discount;
  next();
});

//indexes
orderSchema.index({ "customer.email": 1, createdAt: -1 });
orderSchema.index({ "payments.payUTransactionId": 1 }, { sparse: true });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = model("Order", orderSchema);
