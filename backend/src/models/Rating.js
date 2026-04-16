const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    mealId: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    score: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    hygieneScore: { type: Number, min: 1, max: 5 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rating", ratingSchema);
