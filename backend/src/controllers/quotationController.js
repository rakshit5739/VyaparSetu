const Quotation = require("../models/Quotation");
const PurchaseRequest = require("../models/PurchaseRequest");
const Order = require("../models/Order");

const createQuotation = async (req, res) => {
    try {
        const purchaseRequestId = req.body.purchaseRequest || req.body.requestId;
        const estimatedPrice = req.body.estimatedPrice;
        const message = req.body.message || req.body.remarks || "";

        if (
            !purchaseRequestId ||
            estimatedPrice === undefined ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Purchase request, estimated price and message are required",
            });
        }

        const price = Number(estimatedPrice);
        if (!Number.isFinite(price) || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Estimated price must be a valid number greater than or equal to 0",
            });
        }

        const request = await PurchaseRequest.findById(purchaseRequestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Purchase request not found",
            });
        }

        if (["Cancelled", "Accepted", "Completed"].includes(request.status)) {
            return res.status(400).json({
                success: false,
                message: "This purchase request is no longer accepting quotations",
            });
        }

        if (request.deadline <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Cannot create quotation after request deadline",
            });
        }

        const shopkeeperCity = req.user.city?.trim().toLowerCase();
        const requestCity = request.city?.trim().toLowerCase();

        if (!shopkeeperCity || !requestCity || shopkeeperCity !== requestCity) {
            return res.status(403).json({
                success: false,
                message: "You can only submit quotations for requests in your city",
            });
        }

        const shopkeeperCategories = req.user.businessCategories || [];
        const hasMatchingCategory = request.categories.some((category) =>
            shopkeeperCategories.includes(category)
        );

        if (!hasMatchingCategory) {
            return res.status(403).json({
                success: false,
                message: "Your business categories do not match this request",
            });
        }

        const existingQuotation = await Quotation.findOne({
            shopkeeper: req.user._id,
            purchaseRequest: request._id,
        });

        if (existingQuotation) {
            return res.status(409).json({
                success: false,
                message: "You have already submitted a quotation for this request",
            });
        }

        const quotation = await Quotation.create({
            shopkeeper: req.user._id,
            purchaseRequest: request._id,
            estimatedPrice: price,
            message: message.trim(),
        });

        if (request.status === "Pending") {
            request.status = "Quoted";
            await request.save();
        }

        return res.status(201).json({
            success: true,
            message: "Quotation created successfully",
            quotation,
        });
    } catch (error) {
        console.error("Create Quotation Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid purchase request ID",
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You have already submitted a quotation for this request",
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
        const isShopkeeper = req.user.roles.includes("shopkeeper");
        const isCustomer = req.user.roles.includes("customer");

        let filter = {};
        if (isShopkeeper && !isCustomer) {
            filter = { shopkeeper: req.user._id };
        } else if (isCustomer) {
            const customerRequests = await PurchaseRequest.find({
                customer: req.user._id,
            }).select("_id");
            const requestIds = customerRequests.map((request) => request._id);
            filter = { purchaseRequest: { $in: requestIds } };
        } else {
            filter = { shopkeeper: req.user._id };
        }

        const quotations = await Quotation.find(filter)
            .populate("shopkeeper", "name email city businessCategories")
            .populate("purchaseRequest", "title categories city status deadline items")
            .sort({ estimatedPrice: 1 });

        return res.status(200).json({
            success: true,
            count: quotations.length,
            quotations,
        });
    } catch (error) {
        console.error("Get My Quotations Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getQuotationsByRequest = async (req, res) => {
    try {
        const purchaseRequestId = req.params.purchaseRequestId || req.params.id;

        const request = await PurchaseRequest.findById(purchaseRequestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Purchase request not found",
            });
        }

        const isCustomer = request.customer.toString() === req.user._id.toString();
        const isShopkeeper = req.user.roles.includes("shopkeeper");

        if (!isCustomer && !isShopkeeper && !req.user.roles.includes("admin")) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view these quotations",
            });
        }

        let filter = { purchaseRequest: request._id };
        // If shopkeeper (and not the customer who owns the request), only show their own quote unless allowed
        if (!isCustomer && isShopkeeper && !req.user.roles.includes("admin")) {
            filter.shopkeeper = req.user._id;
        }

        const quotations = await Quotation.find(filter)
            .populate("shopkeeper", "name email city businessCategories")
            .sort({ estimatedPrice: 1 });

        return res.status(200).json({
            success: true,
            count: quotations.length,
            quotations,
        });
    } catch (error) {
        console.error("Get Quotations By Request Error:", error);
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
        const quotationId = req.params.quotationId || req.params.id;

        const quotation = await Quotation.findById(quotationId);
        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found",
            });
        }

        const purchaseRequest = await PurchaseRequest.findById(quotation.purchaseRequest);
        if (!purchaseRequest) {
            return res.status(404).json({
                success: false,
                message: "Purchase request not found",
            });
        }

        if (purchaseRequest.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to accept this quotation",
            });
        }

        if (quotation.status === "Rejected") {
            return res.status(400).json({
                success: false,
                message: "Cannot accept a rejected quotation",
            });
        }

        if (["Accepted", "Completed", "Cancelled"].includes(purchaseRequest.status)) {
            return res.status(400).json({
                success: false,
                message: "This purchase request can no longer accept a quotation",
            });
        }

        if (purchaseRequest.deadline <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Cannot accept quotation after request deadline",
            });
        }

        quotation.status = "Accepted";
        await quotation.save();

        await Quotation.updateMany(
            {
                purchaseRequest: purchaseRequest._id,
                _id: { $ne: quotation._id },
                status: "Pending",
            },
            {
                $set: { status: "Rejected" },
            }
        );

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
        console.error("Accept Quotation Error:", error);
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