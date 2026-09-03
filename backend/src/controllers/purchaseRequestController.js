const PurchaseRequest = require("../models/PurchaseRequest");

// @desc    Create a new purchase request
// @route   POST /api/purchase-requests
// @access  Customer
const createPurchaseRequest = async (req, res) => {
    try {
        console.log("REQUEST BODY:", req.body);
        console.log("UPLOADED FILE:", req.file);

        let {
            title,
            description,
            categories,
            items,
            city,
            deadline,
        } = req.body;

        // -----------------------------------
        // 1. Parse form-data fields
        // -----------------------------------

        // categories comes as a string in form-data
        if (typeof categories === "string") {
            try {
                categories = JSON.parse(categories);
            } catch (error) {
                // If user sends:
                // Construction
                // instead of ["Construction"]
                categories = [categories];
            }
        }

        // items comes as a JSON string in form-data
        if (typeof items === "string") {
            try {
                items = JSON.parse(items);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid items format. Please provide items as a JSON array",
                });
            }
        }

        // -----------------------------------
        // 2. Validate basic fields
        // -----------------------------------

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required",
            });
        }

        // -----------------------------------
        // 3. Validate categories
        // -----------------------------------

        if (
            !Array.isArray(categories) ||
            categories.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "At least one category is required",
            });
        }

        // -----------------------------------
        // 4. Check items OR uploaded file
        // -----------------------------------

        const hasItems =
            Array.isArray(items) && items.length > 0;

        const hasUploadedFile = !!req.file;

        if (!hasItems && !hasUploadedFile) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide at least one item or upload an item list",
            });
        }

        // -----------------------------------
        // 5. Validate manually entered items
        // -----------------------------------

        let normalizedItems = [];

        if (hasItems) {
            normalizedItems = items.map((item) => ({
                itemName:
                    typeof item.itemName === "string"
                        ? item.itemName.trim()
                        : "",

                quantity: Number(item.quantity),

                unit:
                    typeof item.unit === "string"
                        ? item.unit.trim()
                        : "",
            }));

            for (const item of normalizedItems) {
                if (
                    !item.itemName ||
                    !item.unit ||
                    !Number.isFinite(item.quantity)
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Each item must contain itemName, quantity and unit",
                    });
                }

                if (item.quantity <= 0) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Item quantity must be greater than 0",
                    });
                }
            }
        }

        // -----------------------------------
        // 6. Validate city
        // -----------------------------------

        if (!city) {
            return res.status(400).json({
                success: false,
                message: "City is required",
            });
        }

        // -----------------------------------
        // 7. Validate deadline
        // -----------------------------------

        if (!deadline) {
            return res.status(400).json({
                success: false,
                message: "Deadline is required",
            });
        }

        const deadlineDate = new Date(deadline);

        if (isNaN(deadlineDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid deadline",
            });
        }

        if (deadlineDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Deadline must be a future date",
            });
        }

        // -----------------------------------
        // 8. Prepare uploaded file
        // -----------------------------------

        const uploadedFile = hasUploadedFile
            ? {
                  fileUrl: `/uploads/${req.file.filename}`,
                  fileName: req.file.originalname,
                  fileType: req.file.mimetype,
              }
            : {};

        // -----------------------------------
        // 9. Create purchase request
        // -----------------------------------

        const purchaseRequest =
            await PurchaseRequest.create({
                customer: req.user._id,
                title: title.trim(),
                description: description.trim(),
                categories,
                items: normalizedItems,
                uploadedFile,
                city: city.trim(),
                deadline: deadlineDate,
            });

        // -----------------------------------
        // 10. Send response
        // -----------------------------------

        return res.status(201).json({
            success: true,
            message:
                "Purchase request created successfully",
            purchaseRequest,
        });
    } catch (error) {
        console.error(
            "Create Purchase Request Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// @desc    Get purchase requests matching shopkeeper categories
// @route   GET /api/purchase-requests/matching
// @access  Shopkeeper
const getMatchingRequests = async (req, res) => {
    try {
        const shopkeeperCategories =
            req.user.businessCategories;

        if (
            !Array.isArray(shopkeeperCategories) ||
            shopkeeperCategories.length === 0
        ) {
            return res.status(200).json({
                success: true,
                count: 0,
                purchaseRequests: [],
            });
        }

        const purchaseRequests =
            await PurchaseRequest.find({
                // Shopkeeper's business category must match
                categories: {
                    $in: shopkeeperCategories,
                },

                // Don't show cancelled requests
                status: {
                    $ne: "Cancelled",
                },

                // Customer must still exist
                customer: {
                    $ne: null,
                },

                // Request must contain items
                // OR an uploaded file
                $or: [
                    {
                        "items.0": {
                            $exists: true,
                        },
                    },
                    {
                        "uploadedFile.fileUrl": {
                            $ne: "",
                        },
                    },
                ],

                // Deadline should not have passed
                deadline: {
                    $gte: new Date(),
                },
            })
                .populate(
                    "customer",
                    "name email"
                )
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,
            count: purchaseRequests.length,
            purchaseRequests,
        });
    } catch (error) {
        console.error(
            "Get Matching Requests Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// @desc    Get customer's own purchase requests
// @route   GET /api/purchase-requests/my
// @access  Customer
const getMyPurchaseRequests = async (req, res) => {
    try {
        const purchaseRequests =
            await PurchaseRequest.find({
                customer: req.user._id,
            }).sort({
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            count: purchaseRequests.length,
            purchaseRequests,
        });
    } catch (error) {
        console.error(
            "Get My Purchase Requests Error:",
            error
        );

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