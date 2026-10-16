const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "No token provided",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "default_jwt_secret_vyaparsetu"
        );

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token",
        });
    }
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !Array.isArray(req.user.roles)) {
            return res.status(403).json({
                success: false,
                message: "Access Denied",
            });
        }

        const hasRole = req.user.roles.some((role) =>
            allowedRoles.includes(role)
        );

        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: "Access Denied",
            });
        }

        next();
    };
};

module.exports = {
    protect,
    authorize,
};