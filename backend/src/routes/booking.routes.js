const express = require("express");
const Booking = require("../models/Booking");
const Meal = require("../models/Meal");
const { requireAuth, requireRole } = require("../middleware/auth");
const { generateBookingCode } = require("../utils/codeGenerator");
const { BOOKING_STATUS } = require("../config/constants");

const router = express.Router();

router.get("/my", requireAuth, requireRole("student"), async (req, res) => {
  const bookings = await Booking.find({ studentId: req.user.id })
    .populate("vendorId", "messName city")
    .populate("mealId", "name price mealType")
    .sort({ createdAt: -1 });
  return res.json(bookings);
});

router.get("/pending", requireAuth, requireRole("vendor"), async (req, res) => {
  const query = { status: BOOKING_STATUS.PENDING };
  if (req.user.vendorId) query.vendorId = req.user.vendorId;
  const bookings = await Booking.find(query)
    .populate("studentId", "name")
    .populate("mealId", "name price mealType")
    .sort({ createdAt: -1 })
    .limit(20);
  return res.json(bookings);
});

router.post("/", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const { mealId, date } = req.body;
    const meal = await Meal.findById(mealId);
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    const booking = await Booking.create({
      studentId: req.user.id,
      vendorId: meal.vendorId,
      mealId: meal._id,
      date,
      mealType: meal.mealType,
      bookingCode: generateBookingCode(),
      amount: meal.price
    });
    return res.status(201).json(booking);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/:id/verify", requireAuth, requireRole("vendor"), async (req, res) => {
  const { code } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (req.user.vendorId && String(booking.vendorId) !== req.user.vendorId) {
    return res.status(403).json({ message: "Cannot verify other vendor bookings" });
  }
  if (booking.bookingCode !== code) return res.status(400).json({ message: "Invalid booking code" });
  if (booking.status !== BOOKING_STATUS.PENDING) return res.status(409).json({ message: "Booking already processed" });
  booking.status = BOOKING_STATUS.VERIFIED;
  booking.verifiedAt = new Date();
  await booking.save();
  return res.json(booking);
});

router.post("/:id/skip", requireAuth, requireRole("student"), async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (String(booking.studentId) !== req.user.id) return res.status(403).json({ message: "Not your booking" });
  if (booking.status !== BOOKING_STATUS.PENDING) return res.status(409).json({ message: "Cannot skip now" });
  booking.status = BOOKING_STATUS.SKIPPED;
  await booking.save();
  return res.json(booking);
});

module.exports = router;
