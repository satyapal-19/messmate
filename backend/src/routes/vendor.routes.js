const express = require("express");
const Vendor = require("../models/Vendor");
const Meal = require("../models/Meal");

const router = express.Router();

router.get("/", async (req, res) => {
  const query = {};
  if (req.query.city) query.city = req.query.city;
  const vendors = await Vendor.find(query).sort({ rating: -1 });
  return res.json(vendors);
});

router.get("/:id/menu", async (req, res) => {
  const date = req.query.date;
  const meals = await Meal.find({ vendorId: req.params.id, date }).sort({ mealType: 1, price: 1 });
  return res.json(meals);
});

module.exports = router;
