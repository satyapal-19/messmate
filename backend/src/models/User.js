const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["student", "vendor"], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    college: { type: String },
    preference: { type: String, enum: ["veg", "nonveg", "both"], default: "both" },
    city: { type: String },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
