const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async(req, res) => {

    const { name, email, password, roles, businessCategories, } = req.body;

    // Validation
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields",
        });
    }

    if (roles) {
    const validRoles = ["customer", "shopkeeper"];

    const isValid = roles.every(role => validRoles.includes(role));

    if (!isValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid roles",
        });
    }
    }
    if ( roles && roles.includes("shopkeeper") && (!businessCategories || businessCategories.length === 0)) {
    return res.status(400).json({
        success: false,
        message: "Shopkeeper must select at least one business category",
    });
}

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User already exists",
       });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
    name,
    email,
    password: hashedPassword,
    roles: roles || ["customer"],
    businessCategories: businessCategories || [],
   });

    res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: { // Response shaping to avoid sending the password back to the client
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        businessCategories: user.businessCategories,
    },
});
};

const loginUser = async (req, res) => { // controller function for login
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide both email and password",
        });
    }
    
    const user = await User.findOne({ email });

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
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);

    res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    });
};
const getProfile = async (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        },
    });
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
};

// console.log(user);

//     console.log("Original Password:", password);
//     console.log("Hashed Password:", hashedPassword);

//     console.log("Name:", name);
//     console.log("Email:", email);
//     console.log("Password:", password);