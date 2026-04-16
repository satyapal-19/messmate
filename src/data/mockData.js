export const mockStudents = [
  { id: "stu-001", name: "Satyapal Gaikwad", college: "Walchand College of Engineering, Sangli", preference: "both" },
  { id: "stu-002", name: "Rohit Patil", college: "Walchand College of Engineering, Sangli", preference: "veg" },
  { id: "stu-003", name: "Sneha Jadhav", college: "Walchand College of Engineering, Sangli", preference: "both" }
];

export const mockVendors = [
  {
    id: "ven-001",
    name: "Shree Datta Mess",
    city: "Sangli",
    hygieneScore: 4.6,
    rating: 4.5,
    menu: {
      BREAKFAST: [
        { name: "Poha", price: 25 },
        { name: "Tea", price: 20 }
      ],
      LUNCH: [
        { name: "Pithla Bhakri", price: 80 },
        { name: "Varan Bhaat", price: 70 }
      ],
      DINNER: [
        { name: "Zunka Bhakri", price: 75 },
        { name: "Egg Curry", price: 95 }
      ]
    }
  },
  {
    id: "ven-002",
    name: "Kolhapuri Tadka Mess",
    city: "Kolhapur",
    hygieneScore: 4.4,
    rating: 4.7,
    menu: {
      BREAKFAST: [
        { name: "Misal Pav", price: 35 },
        { name: "Upma", price: 30 }
      ],
      LUNCH: [
        { name: "Chicken Kolhapuri", price: 120 },
        { name: "Chapati Bhaji", price: 85 }
      ],
      DINNER: [
        { name: "Aloo Sabzi", price: 80 },
        { name: "Egg Curry", price: 100 }
      ]
    }
  },
  {
    id: "ven-003",
    name: "Aai's Kitchen",
    city: "Pune",
    hygieneScore: 4.8,
    rating: 4.6,
    menu: {
      BREAKFAST: [
        { name: "Upma", price: 30 },
        { name: "Tea", price: 20 }
      ],
      LUNCH: [
        { name: "Bhindi Sabzi", price: 85 },
        { name: "Varan Bhaat", price: 75 }
      ],
      DINNER: [
        { name: "Chapati Bhaji", price: 80 },
        { name: "Pithla Bhakri", price: 85 }
      ]
    }
  }
];
