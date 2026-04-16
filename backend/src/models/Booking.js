const mongoose = require("mongoose");
const { BOOKING_STATUS } = require("../config/constants");

const bookingSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    mealId: { type: mongoose.Schema.Types.ObjectId, ref: "Meal", required: true },
    date: { type: String, required: true },
    mealType: { type: String, required: true },
    bookingCode: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.PENDING },
    paymentMode: { type: String, default: "CASH" },
    verifiedAt: { type: Date }
  },
  { timestamps: true }
);

bookingSchema.index({ studentId: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model("Booking", bookingSchema);
