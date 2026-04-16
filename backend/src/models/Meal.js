const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    date: { type: String, required: true },
    mealType: { type: String, enum: ["BREAKFAST", "LUNCH", "DINNER"], required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    isVeg: { type: Boolean, default: true },
    imageUrl: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meal", mealSchema);
