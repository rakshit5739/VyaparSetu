const Quotation = require("../models/Quotation");
const PurchaseRequest = require("../models/PurchaseRequest");

const createQuotation = async (req, res) => {
    try {
        const {
            purchaseRequest,
            estimatedPrice,
            message,
        } = req.body;

        // Validate required fields
        if (!purchaseRequest || estimatedPrice === undefined || !message) {
            return res.status(400).json({
                success: false,
                message:
                    "Purchase request, estimated price and message are required",
            });
        }

        // Validate price
        const price = Number(estimatedPrice);

        if (!Number.isFinite(price) || price < 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Estimated price must be a valid number greater than or equal to 0",
            });
        }

        // Check purchase request exists
        const request = await PurchaseRequest.findById(
            purchaseRequest
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Purchase request not found",
            });
        }

        // Don't allow quotation for cancelled request
        if (request.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot create quotation for a cancelled request",
            });
        }

        // Don't allow quotation after deadline
        if (request.deadline <= new Date()) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot create quotation after request deadline",
            });
        }

        // Check if this shopkeeper already quoted
        const existingQuotation =
            await Quotation.findOne({
                shopkeeper: req.user._id,
                purchaseRequest: purchaseRequest,
            });

        if (existingQuotation) {
            return res.status(409).json({
                success: false,
                message:
                    "You have already submitted a quotation for this request",
            });
        }

        // Create quotation
        const quotation = await Quotation.create({
            shopkeeper: req.user._id,
            purchaseRequest: purchaseRequest,
            estimatedPrice: price,
            message: message.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Quotation created successfully",
            quotation,
        });
    } catch (error) {
        console.error(
            "Create Quotation Error:",
            error
        );

        // Handle invalid MongoDB ObjectId
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid purchase request ID",
            });
        }

        // Handle unique index
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "You have already submitted a quotation for this request",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

module.exports = {
    createQuotation,
};