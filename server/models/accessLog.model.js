const { Schema, model } = require("mongoose");

const accessLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    actorEmail: { type: String, default: "" },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

accessLogSchema.index({ actorId: 1, createdAt: -1 });
accessLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = model("AccessLog", accessLogSchema);
