const Quotation = require("../models/Quotation");
const PurchaseRequest = require("../models/PurchaseRequest");
const Order = require("../models/Order");

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

const getMyQuotations = async (req, res) => {
    try {
        // Find all purchase requests created by this customer
        const purchaseRequests =
            await PurchaseRequest.find({
                customer: req.user._id,
            }).select("_id");

        const purchaseRequestIds =
            purchaseRequests.map(
                (request) => request._id
            );

        // Find quotations for those purchase requests
        const quotations =
            await Quotation.find({
                purchaseRequest: {
                    $in: purchaseRequestIds,
                },
            })
                .populate(
                    "shopkeeper",
                    "name email businessCategories"
                )
                .populate(
                    "purchaseRequest",
                    "title description categories city deadline status"
                )
                .sort({
                    estimatedPrice: 1,
                });

        return res.status(200).json({
            success: true,
            count: quotations.length,
            quotations,
        });
    } catch (error) {
        console.error(
            "Get My Quotations Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getQuotationsByRequest = async (req, res) => {
    try {
        const { purchaseRequestId } = req.params;

        const purchaseRequest =
            await PurchaseRequest.findById(purchaseRequestId);

        if (!purchaseRequest) {
            return res.status(404).json({
                success: false,
                message: "Purchase request not found",
            });
        }

        // Only the customer who created the request
        // can view its quotations
        if (
            purchaseRequest.customer.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to view quotations for this request",
            });
        }

        const quotations =
            await Quotation.find({
                purchaseRequest: purchaseRequestId,
            })
                .populate(
                    "shopkeeper",
                    "name email businessCategories"
                )
                .sort({
                    estimatedPrice: 1,
                });

        return res.status(200).json({
            success: true,
            count: quotations.length,
            quotations,
        });
    } catch (error) {
        console.error(
            "Get Quotations By Request Error:",
            error
        );

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid purchase request ID",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const acceptQuotation = async (req, res) => {
    try {
        const { quotationId } = req.params;

        const quotation = await Quotation.findById(quotationId);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found",
            });
        }

        const purchaseRequest =
            await PurchaseRequest.findById(
                quotation.purchaseRequest
            );

        if (!purchaseRequest) {
            return res.status(404).json({
                success: false,
                message: "Purchase request not found",
            });
        }

        // Only the customer who created the request
        // can accept its quotation
        if (
            purchaseRequest.customer.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to accept this quotation",
            });
        }

        // Cannot accept an already rejected quotation
        if (quotation.status === "Rejected") {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot accept a rejected quotation",
            });
        }

        // Cannot accept another quotation after one
        // has already been accepted
        if (purchaseRequest.status === "Accepted") {
            return res.status(400).json({
                success: false,
                message:
                    "A quotation has already been accepted for this request",
            });
        }

        // Request deadline check
        if (purchaseRequest.deadline <= new Date()) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot accept quotation after request deadline",
            });
        }

        // Accept selected quotation
        quotation.status = "Accepted";
        await quotation.save();

        // Reject all other quotations for this request
        await Quotation.updateMany(
            {
                purchaseRequest: purchaseRequest._id,
                _id: {
                    $ne: quotation._id,
                },
                status: "Pending",
            },
            {
                $set: {
                    status: "Rejected",
                },
            }
        );

        // Update purchase request
        purchaseRequest.status = "Accepted";
await purchaseRequest.save();

const order = await Order.create({
    customer: purchaseRequest.customer,
    shopkeeper: quotation.shopkeeper,
    quotation: quotation._id,
    purchaseRequest: purchaseRequest._id,
    status: "Pending",
});

return res.status(200).json({
    success: true,
    message: "Quotation accepted and order created successfully",
    quotation,
    purchaseRequest,
    order,
});
    } catch (error) {
        console.error(
            "Accept Quotation Error:",
            error
        );

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid quotation ID",
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
    getMyQuotations,
    getQuotationsByRequest,
    acceptQuotation,
};