const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        roles: {
            type: [String],
            enum: ["customer", "shopkeeper"],
            default: ["customer"],
        },

        businessCategories: {
            type: [
                {
                    type: String,
                    enum: [
                        "Construction",
                        "Electrical",
                        "Paint",
                        "Plumbing",
                        "Hardware",
                        "Agriculture",
                        "Others",
                    ],
                },
            ],
            default: [],
        },

        city: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;