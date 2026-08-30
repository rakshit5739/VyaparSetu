const PurchaseRequest = require("../models/PurchaseRequest");

const createPurchaseRequest = async (req, res) => {
    try {

        const { title, description, categories } = req.body;

        if (!title || !description || !categories || categories.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        const purchaseRequest = await PurchaseRequest.create({
            customer: req.user._id,
            title,
            description,
            categories,
        });

        return res.status(201).json({
            success: true,
            message: "Purchase request created successfully",
            purchaseRequest,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });

    }
};

const getMatchingRequests = async (req, res) => {
    try {

        const shopkeeperCategories = req.user.businessCategories;

        const purchaseRequests = await PurchaseRequest.find({
            categories: {
                $in: shopkeeperCategories,
            },
        }).populate("customer", "name email");

        return res.status(200).json({
        success: true,
        count: purchaseRequests.length,
        purchaseRequests,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getMyPurchaseRequests = async (req, res) => {
    try {

        const purchaseRequests = await PurchaseRequest.find({
            customer: req.user._id,
        });

        return res.status(200).json({
            success: true,
            count: purchaseRequests.length,
            purchaseRequests,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });

    }
};

module.exports = {
    createPurchaseRequest,
    getMatchingRequests,
    getMyPurchaseRequests,
};