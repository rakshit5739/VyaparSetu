const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        shopkeeper: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        quotation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quotation",
            required: true,
        },

        purchaseRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PurchaseRequest",
            required: true,
        },

        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Delivered", "Cancelled"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;