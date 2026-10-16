const mongoose = require("mongoose");

const purchaseRequestSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        categories: {
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
            required: true,
        },

        // Manually entered items
        items: [
            {
                itemName: {
                    type: String,
                    required: true,
                    trim: true,
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },

                unit: {
                    type: String,
                    required: true,
                    trim: true,
                },
            },
        ],

        // Uploaded item list
        uploadedFile: {
            fileUrl: {
                type: String,
                default: "",
            },

            fileName: {
                type: String,
                default: "",
            },

            fileType: {
                type: String,
                default: "",
            },
        },

        // Used later for nearby shopkeeper matching
        city: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        deadline: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Quoted",
                "Accepted",
                "Completed",
                "Cancelled",
            ],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

const PurchaseRequest = mongoose.model(
    "PurchaseRequest",
    purchaseRequestSchema
);

module.exports = PurchaseRequest;