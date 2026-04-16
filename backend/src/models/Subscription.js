const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["ACTIVE", "EXPIRED", "CANCELLED"], default: "ACTIVE" },
    skipsAllowed: { type: Number, default: 6 },
    skipsUsed: { type: Number, default: 0 },
    amountPaid: { type: Number, required: true },
    paymentMode: { type: String, default: "CASH" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
