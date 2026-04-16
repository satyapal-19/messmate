require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDb } = require("../config/db");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const Meal = require("../models/Meal");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const Rating = require("../models/Rating");

async function run() {
  await connectDb(process.env.MONGO_URI);

  await Promise.all([
    User.deleteMany({}),
    Vendor.deleteMany({}),
    Meal.deleteMany({}),
    SubscriptionPlan.deleteMany({}),
    Rating.deleteMany({})
  ]);

  const vendors = await Vendor.insertMany([
    {
      messName: "Shree Datta Mess",
      ownerName: "Mahesh Kamble",
      city: "Sangli",
      area: "Vishrambag",
      type: "both",
      hygieneScore: 4.6,
      rating: 4.5,
      ratingCount: 112,
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
    },
    {
      messName: "Kolhapuri Tadka Mess",
      ownerName: "Amit Patil",
      city: "Kolhapur",
      area: "Shahupuri",
      type: "both",
      hygieneScore: 4.4,
      rating: 4.7,
      ratingCount: 142,
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
    },
    {
      messName: "Aai's Kitchen",
      ownerName: "Sonal Jadhav",
      city: "Pune",
      area: "Kothrud",
      type: "veg",
      hygieneScore: 4.8,
      rating: 4.6,
      ratingCount: 96,
      imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c"
    },
    {
      messName: "Shivneri Mess",
      ownerName: "Nilesh Mane",
      city: "Sangli",
      area: "Kupwad",
      type: "nonveg",
      hygieneScore: 4.2,
      rating: 4.1,
      ratingCount: 73,
      imageUrl: "https://images.unsplash.com/photo-1604908176997-4317dcc1d5b8"
    }
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const mealRows = [
    ["BREAKFAST", "Poha", 25, true, "misal pav maharashtra street food"],
    ["BREAKFAST", "Upma", 30, true, "upma breakfast india"],
    ["BREAKFAST", "Misal Pav", 35, true, "misal pav maharashtra street food"],
    ["LUNCH", "Pithla Bhakri", 80, true, "pithla bhakri traditional food"],
    ["LUNCH", "Varan Bhaat", 70, true, "varan bhaat maharashtra"],
    ["LUNCH", "Chicken Kolhapuri", 120, false, "kolhapuri chicken curry"],
    ["DINNER", "Zunka Bhakri", 75, true, "zunka bhakri"],
    ["DINNER", "Egg Curry", 95, false, "egg curry india"]
  ];

  const meals = [];
  vendors.forEach((vendor) => {
    mealRows.forEach((row) => {
      meals.push({
        vendorId: vendor._id,
        date: today,
        mealType: row[0],
        name: row[1],
        price: row[2],
        isVeg: row[3],
        imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(row[4])}`
      });
    });
  });
  await Meal.insertMany(meals);

  const studentPasswordHash = await bcrypt.hash("student123", 10);
  const vendorPasswordHash = await bcrypt.hash("vendor123", 10);
  await User.insertMany([
    {
      role: "student",
      name: "Satyapal Gaikwad",
      email: "satyapal.gaikwad@walchand.edu.in",
      phone: "+91 9876543210",
      passwordHash: studentPasswordHash,
      college: "Walchand College of Engineering, Sangli",
      preference: "both",
      city: "Sangli"
    },
    {
      role: "student",
      name: "Rohit Patil",
      email: "rohit.patil@walchand.edu.in",
      phone: "+91 9876500001",
      passwordHash: studentPasswordHash,
      college: "Walchand College of Engineering, Sangli",
      preference: "veg",
      city: "Sangli"
    },
    {
      role: "student",
      name: "Sneha Jadhav",
      email: "sneha.jadhav@walchand.edu.in",
      phone: "+91 9876500002",
      passwordHash: studentPasswordHash,
      college: "Walchand College of Engineering, Sangli",
      preference: "both",
      city: "Kolhapur"
    },
    {
      role: "vendor",
      name: "Mahesh Kamble",
      email: "vendor.datta@messmate.in",
      phone: "+91 9423456789",
      passwordHash: vendorPasswordHash,
      city: "Sangli",
      vendorId: vendors[0]._id
    },
    {
      role: "vendor",
      name: "Amit Patil",
      email: "vendor.kolhapuri@messmate.in",
      phone: "+91 9423400001",
      passwordHash: vendorPasswordHash,
      city: "Kolhapur",
      vendorId: vendors[1]._id
    }
  ]);

  await SubscriptionPlan.insertMany([
    { vendorId: vendors[0]._id, name: "Monthly Basic", price: 2500, skipsAllowed: 4, mealsIncluded: ["LUNCH", "DINNER"] },
    { vendorId: vendors[1]._id, name: "Monthly Standard", price: 3200, skipsAllowed: 6, mealsIncluded: ["BREAKFAST", "LUNCH", "DINNER"] },
    { vendorId: vendors[2]._id, name: "Monthly Premium", price: 4000, skipsAllowed: 8, mealsIncluded: ["BREAKFAST", "LUNCH", "DINNER"] }
  ]);

  console.log("Seed complete");
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
