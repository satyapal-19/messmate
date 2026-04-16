const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Vendor = require("../models/Vendor");

const router = express.Router();

router.post("/register/student", async (req, res) => {
  try {
    const { name, email, password, phone, college, preference, city } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      role: "student",
      name,
      email,
      phone,
      passwordHash,
      college,
      preference,
      city
    });
    return res.status(201).json({ id: user._id, email: user.email });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/register/vendor", async (req, res) => {
  try {
    const { name, email, password, phone, city, vendorId } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      role: "vendor",
      name,
      email,
      phone,
      passwordHash,
      city,
      vendorId: vendor._id
    });
    return res.status(201).json({ id: user._id, email: user.email, vendorId: String(vendor._id) });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign(
    { id: String(user._id), role: user.role, vendorId: user.vendorId ? String(user.vendorId) : null },
    process.env.JWT_SECRET || "messmate-dev-secret",
    { expiresIn: "7d" }
  );
  return res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
});

module.exports = router;
