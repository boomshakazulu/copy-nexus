const { Schema, model } = require("mongoose");

const rentalItemSchema = new Schema(
  {
    orderItemIndex: { type: Number, required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    name: { type: String, required: true },
    model: { type: String, default: "" },
    qty: { type: Number, default: 1 },
    monthlyPrice: { type: Number, default: 0 },
    rentCostPerPrint: { type: Number, default: 0 },
    rentCostPerScan: { type: Number, default: 0 },
  },
  { _id: false }
);

const rentalSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    items: { type: [rentalItemSchema], default: [] },
    status: { type: String, enum: ["active", "ended"], default: "active" },
    startDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    customer: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      idType: { type: String, default: "" },
      idNumber: { type: String, default: "" },
      preferredContactMethod: { type: String, default: "" },
    },
    shippingAddress: {
      streetAddress: { type: String, default: "" },
      neighborhood: { type: String, default: "" },
      city: { type: String, default: "" },
      department: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

rentalSchema.index({ status: 1, dueDate: 1 });

module.exports = model("Rental", rentalSchema);
