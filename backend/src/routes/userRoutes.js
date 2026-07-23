const express = require("express");
const { registerUser, loginUser ,getProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

console.log("registerUser:", typeof registerUser);
console.log("loginUser:", typeof loginUser);
console.log("protect:", typeof protect);

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/test", protect, (req, res) => {
    res.json({
        success: true,
        message: "Protected Route Accessed Successfully",
    });
});
router.get("/profile", protect, getProfile);
module.exports = router;