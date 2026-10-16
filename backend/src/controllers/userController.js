const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, roles, role, businessCategories, city } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        if (!city || !city.trim()) {
            return res.status(400).json({
                success: false,
                message: "City is required",
            });
        }

        let userRoles = roles;
        if (!userRoles && role) {
            userRoles = [role];
        }
        if (!userRoles || userRoles.length === 0) {
            userRoles = ["customer"];
        }

        const validRoles = ["customer", "shopkeeper"];
        const isValid = userRoles.every((r) => validRoles.includes(r));
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid roles",
            });
        }

        let categories = businessCategories || [];
        if (userRoles.includes("shopkeeper") && categories.length === 0) {
            categories = ["Others"];
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            roles: userRoles,
            businessCategories: categories,
            city: city.trim().toLowerCase(),
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                businessCategories: user.businessCategories,
                city: user.city,
            },
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "default_jwt_secret_vyaparsetu",
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                businessCategories: user.businessCategories,
                city: user.city,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
};

const getProfile = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                roles: req.user.roles,
                businessCategories: req.user.businessCategories,
                city: req.user.city,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, city, businessCategories } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (name) user.name = name.trim();
        if (email) user.email = email.trim().toLowerCase();
        if (city) user.city = city.trim().toLowerCase();
        if (Array.isArray(businessCategories)) {
            user.businessCategories = businessCategories;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                businessCategories: user.businessCategories,
                city: user.city,
            },
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
};