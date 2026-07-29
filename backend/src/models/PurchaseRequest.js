const mongoose = require("mongoose");

const purchaseRequestSchema = new mongoose.Schema({

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
    type: [{
        type: String,
        enum: [
            "Construction",
            "Electrical",
            "Paint",
            "Plumbing",
            "Hardware",
            "Agriculture",
            "Others"
        ],
    }],
    required: true,
    },

});

const PurchaseRequest = mongoose.model(
    "PurchaseRequest",
    purchaseRequestSchema
);

module.exports = PurchaseRequest;