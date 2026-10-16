const PurchaseRequest = require("../models/PurchaseRequest");

const createPurchaseRequest = async (req, res) => {
    try {
        let {
            title,
            description,
            categories,
            category,
            items,
            city,
            deadline,
        } = req.body;

        if (typeof categories === "string") {
            try {
                categories = JSON.parse(categories);
            } catch {
                categories = [categories];
            }
        }

        if (!categories && category) {
            categories = [category];
        }

        if (typeof items === "string") {
            try {
                items = JSON.parse(items);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Items must be valid JSON",
                });
            }
        }

        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required",
            });
        }

        if (!Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one category is required",
            });
        }

        const validCategories = [
            "Construction",
            "Electrical",
            "Paint",
            "Plumbing",
            "Hardware",
            "Agriculture",
            "Others",
        ];

        if (!categories.every((cat) => validCategories.includes(cat))) {
            return res.status(400).json({
                success: false,
                message: "One or more categories are invalid",
            });
        }

        if (items !== undefined && !Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                message: "Items must be an array",
            });
        }

        const hasItems = Array.isArray(items) && items.length > 0;
        const hasUploadedFile = Boolean(req.file);

        if (!hasItems && !hasUploadedFile) {
            return res.status(400).json({
                success: false,
                message: "Provide at least one item or upload a requirement file",
            });
        }

        const normalizedItems = (items || []).map((item) => ({
            itemName: typeof item.itemName === "string" ? item.itemName.trim() : "",
            quantity: Number(item.quantity),
            unit: typeof item.unit === "string" ? item.unit.trim() : "",
        }));

        for (const item of normalizedItems) {
            if (
                !item.itemName ||
                !Number.isFinite(item.quantity) ||
                item.quantity <= 0 ||
                !item.unit
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Each item needs a name, positive quantity, and unit",
                });
            }
        }

        const requestCity = city || req.user.city;
        if (typeof requestCity !== "string" || !requestCity.trim()) {
            return res.status(400).json({
                success: false,
                message: "City is required",
            });
        }

        const parsedDeadline = new Date(deadline);
        if (
            !deadline ||
            Number.isNaN(parsedDeadline.getTime()) ||
            parsedDeadline <= new Date()
        ) {
            return res.status(400).json({
                success: false,
                message: "Deadline must be a valid future date",
            });
        }

        const uploadedFile = req.file
            ? {
                  fileUrl: `/uploads/${req.file.filename}`,
                  fileName: req.file.originalname,
                  fileType: req.file.mimetype,
              }
            : {
                  fileUrl: "",
                  fileName: "",
                  fileType: "",
              };

        const purchaseRequest = await PurchaseRequest.create({
            customer: req.user._id,
            title: title.trim(),
            description: (description || "").trim(),
            categories,
            items: normalizedItems,
            uploadedFile,
            city: requestCity.trim().toLowerCase(),
            deadline: parsedDeadline,
        });

        return res.status(201).json({
            success: true,
            message: "Purchase request created successfully",
            purchaseRequest,
            requirement: purchaseRequest,
        });
    } catch (error) {
        console.error("Create Purchase Request Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
};

const getMatchingRequests = async (req, res) => {
    try {
        const shopkeeperCategories = req.user.businessCategories;
        const shopkeeperCity = req.user.city?.trim().toLowerCase();

        if (
            !Array.isArray(shopkeeperCategories) ||
            shopkeeperCategories.length === 0 ||
            !shopkeeperCity
        ) {
            return res.status(200).json({
                success: true,
                count: 0,
                purchaseRequests: [],
                requirements: [],
            });
        }

        const purchaseRequests = await PurchaseRequest.find({
            categories: {
                $in: shopkeeperCategories,
            },
            city: shopkeeperCity,
            status: {
                $nin: ["Cancelled", "Accepted", "Completed"],
            },
            customer: {
                $ne: null,
            },
            $or: [
                {
                    "items.0": {
                        $exists: true,
                    },
                },
                {
                    "uploadedFile.fileUrl": {
                        $nin: ["", null],
                    },
                },
            ],
            deadline: {
                $gte: new Date(),
            },
        })
            .populate("customer", "name email city")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: purchaseRequests.length,
            purchaseRequests,
            requirements: purchaseRequests,
        });
    } catch (error) {
        console.error("Get Matching Requests Error:", error);
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
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: purchaseRequests.length,
            purchaseRequests,
            requirements: purchaseRequests,
        });
    } catch (error) {
        console.error("Get My Purchase Requests Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getPurchaseRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const purchaseRequest = await PurchaseRequest.findById(id).populate(
            "customer",
            "name email city"
        );

        if (!purchaseRequest) {
            return res.status(404).json({
                success: false,
                message: "Purchase request not found",
            });
        }

        return res.status(200).json({
            success: true,
            purchaseRequest,
            requirement: purchaseRequest,
        });
    } catch (error) {
        console.error("Get Purchase Request By ID Error:", error);
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

const cancelPurchaseRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await PurchaseRequest.findOne({
            _id: id,
            customer: req.user._id,
            status: { $in: ["Pending", "Quoted"] },
        });

        if (!request) {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel this purchase request (already accepted, completed, or unauthorized)",
            });
        }

        request.status = "Cancelled";
        await request.save();

        return res.status(200).json({
            success: true,
            message: "Purchase request cancelled successfully",
            purchaseRequest: request,
            requirement: request,
        });
    } catch (error) {
        console.error("Cancel Purchase Request Error:", error);
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
    getPurchaseRequestById,
    cancelPurchaseRequest,
};