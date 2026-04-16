const express = require("express");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const Subscription = require("../models/Subscription");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/plans", async (req, res) => {
  const query = {};
  if (req.query.vendorId) query.vendorId = req.query.vendorId;
  const plans = await SubscriptionPlan.find(query).populate("vendorId");
  return res.json(plans);
});

router.post("/", requireAuth, requireRole("student"), async (req, res) => {
  const { planId } = req.body;
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) return res.status(404).json({ message: "Plan not found" });
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);
  const sub = await Subscription.create({
    studentId: req.user.id,
    vendorId: plan.vendorId,
    planId: plan._id,
    startDate: now,
    endDate: end,
    skipsAllowed: plan.skipsAllowed,
    amountPaid: plan.price
  });
  return res.status(201).json(sub);
});

router.get("/my", requireAuth, requireRole("student"), async (req, res) => {
  const data = await Subscription.find({ studentId: req.user.id, status: "ACTIVE" }).populate("planId vendorId");
  return res.json(data);
});

module.exports = router;
