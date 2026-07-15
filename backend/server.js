const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const userRoutes = require("./src/routes/userRoutes");

dotenv.config();

console.log(process.env.MONGO_URI);

connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // This is the middleware that converts json data from postman and converts it into the javascript object. 
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MarketEase API Running"
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});