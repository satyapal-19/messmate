const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    messName: { type: String, required: true },
    ownerName: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    type: { type: String, enum: ["veg", "nonveg", "both"], default: "both" },
    hygieneScore: { type: Number, default: 4.2 },
    rating: { type: Number, default: 4.0 },
    ratingCount: { type: Number, default: 0 },
    imageUrl: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
