const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    skipsAllowed: { type: Number, default: 6 },
    mealsIncluded: [{ type: String, enum: ["BREAKFAST", "LUNCH", "DINNER"] }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
