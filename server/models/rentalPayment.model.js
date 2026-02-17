const { Schema, model } = require("mongoose");

const rentalPaymentSchema = new Schema(
  {
    rental: { type: Schema.Types.ObjectId, ref: "Rental", required: true },
    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    items: {
      type: [
        {
          orderItemIndex: { type: Number, required: true },
          name: { type: String, default: "" },
          model: { type: String, default: "" },
          monthlyPrice: { type: Number, default: 0 },
          qty: { type: Number, default: 1 },
          ratePerPrint: { type: Number, default: 0 },
          ratePerScan: { type: Number, default: 0 },
          copies: { type: Number, default: 0 },
          scans: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    monthlyBase: { type: Number, default: 0 },
    paidAt: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

rentalPaymentSchema.index({ rental: 1, paidAt: -1 });

module.exports = model("RentalPayment", rentalPaymentSchema);
