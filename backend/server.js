const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const userRoutes = require("./src/routes/userRoutes");
const purchaseRequestRoutes = require("./src/routes/purchaseRequestRoutes");
const quotationRoutes = require("./src/routes/quotationRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const shopRoutes = require("./src/routes/shopRoutes");
const productRoutes = require("./src/routes/productRoutes");
const compareRoutes = require("./src/routes/compareRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const errorHandler = require("./src/middleware/errorHandler");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // Converts json data from postman/client to javascript object
app.use("/api/users", userRoutes);
app.use("/api/purchase-requests", purchaseRequestRoutes);
app.use("/api/requirements", purchaseRequestRoutes); // Compatibility bridge for requirement endpoints
app.use("/api/quotations", quotationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);
app.use("/api/compare", compareRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "VyaparSetu API Running",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});