require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { connectDb } = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const vendorRoutes = require("./routes/vendor.routes");
const bookingRoutes = require("./routes/booking.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const ratingRoutes = require("./routes/rating.routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true, service: "messmate-backend" }));
app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/ratings", ratingRoutes);

const port = process.env.PORT || 5000;

connectDb(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`MessMate backend running on ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect DB:", error.message);
    process.exit(1);
  });
