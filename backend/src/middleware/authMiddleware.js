const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect Middleware
 * Verifies JWT token from Authorization header (Bearer <token>).
 * Attaches the authenticated user (without password) to req.user.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if authorization header exists and starts with 'Bearer'
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Extract token after 'Bearer '
    const token = authHeader.split(" ")[1];

    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB excluding the password field
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      });
    }

    // Attach user to request object for downstream middleware/controllers
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

protect.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role: ${req.user ? req.user.role : "unknown"}`,
      });
    }
    next();
  };
};

module.exports = protect;