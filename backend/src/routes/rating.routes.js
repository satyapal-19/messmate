const express = require("express");
const mongoose = require("mongoose");
const Rating = require("../models/Rating");
const Vendor = require("../models/Vendor");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, requireRole("student"), async (req, res) => {
  const { vendorId, bookingId, mealId, score, comment, hygieneScore } = req.body;
  const rating = await Rating.create({
    studentId: req.user.id,
    vendorId,
    bookingId,
    mealId,
    score,
    comment,
    hygieneScore
  });
  const agg = await Rating.aggregate([
    { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
    { $group: { _id: "$vendorId", avg: { $avg: "$score" }, count: { $sum: 1 } } }
  ]);
  if (agg[0]) {
    await Vendor.findByIdAndUpdate(vendorId, { rating: Number(agg[0].avg.toFixed(2)), ratingCount: agg[0].count });
  }
  return res.status(201).json(rating);
});

module.exports = router;
