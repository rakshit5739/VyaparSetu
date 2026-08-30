const Quotation = require("../models/Quotation");
const PurchaseRequest = require("../models/PurchaseRequest");
const Order = require("../models/Order");
// const Requirement = require("../models/Requirement");
// const Shop = require("../models/Shop");
// const Order = require("../models/Order");


const createQuotation = async (req, res) => {
  try {
    const { purchaseRequest, estimatedPrice, message } = req.body;

    if (!purchaseRequest || !estimatedPrice || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (purchaseRequest, estimatedPrice, message)",
      });
    }

    // Verify requirement exists and is active
    // const requirement = await Requirement.findById(purchaseRequest);
    // if (!requirement) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Requirement not found",
    //   });
    // }

    // if (requirement.status === "Completed" || requirement.status === "Cancelled") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Cannot quote on a closed or cancelled requirement",
    //   });
    // }

    // Check if shopkeeper already submitted a quotation
    const existingQuotation = await Quotation.findOne({
      shopkeeper: req.user._id,
      purchaseRequest,
    });

    if (existingQuotation) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a quotation for this request",
      });
    }

    const quotation = await Quotation.create({
      shopkeeper: req.user._id,
      purchaseRequest,
      estimatedPrice,
      message,
    });

    // Update requirement status to "Quoted" if it was "Pending"
    // if (requirement.status === "Pending") {
    //   requirement.status = "Quoted";
    //   await requirement.save();
    // }

    res.status(201).json({
      success: true,
      message: "Quotation submitted successfully",
      quotation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};


const getQuotationsForPurchaseRequest = async (req, res) => {
    try {
        const { purchaseRequestId } = req.params;

        const purchaseRequest = await PurchaseRequest.findById(
            purchaseRequestId
        );

        if (!purchaseRequest) {
            return res.status(404).json({
                success: false,
                message: "Purchase request not found",
            });
        }

        if (
            purchaseRequest.customer.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to view these quotations",
            });
        }

        const quotations = await Quotation.find({
            purchaseRequest: purchaseRequestId,
        }).populate(
            "shopkeeper",
            "name email businessCategories"
        );

        return res.status(200).json({
            success: true,
            count: quotations.length,
            quotations,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

/**
 * @desc    Get quotations submitted by current Shopkeeper
 * @route   GET /api/quotations/my
 * @access  Private
 */
const getMyQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ shopkeeperId: req.user._id })
      .populate({
        path: "requestId",
        select: "title category city status deadline customerId",
        populate: { path: "customerId", select: "name email phone" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      quotations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Accept a Quotation (Customer accepts, order gets created, other quotes rejected)
 * @route   PUT /api/quotations/:id/accept
 * @access  Private
 */
const acceptQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found",
            });
        }

        // Find the purchase request connected to this quotation
        const purchaseRequest = await PurchaseRequest.findById(
            quotation.purchaseRequest
        );

        if (!purchaseRequest) {
            return res.status(404).json({
                success: false,
                message: "Purchase request not found",
            });
        }

        // Only the customer who created the request can accept its quotation
        if (
            purchaseRequest.customer.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to accept this quotation",
            });
        }

        // Quotation must still be pending
        if (quotation.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "This quotation is no longer pending",
            });
        }

        // Accept selected quotation
        quotation.status = "Accepted";
        await quotation.save();

        // Reject all other quotations for this purchase request
        await Quotation.updateMany(
            {
                purchaseRequest: quotation.purchaseRequest,
                _id: { $ne: quotation._id },
            },
            {
                status: "Rejected",
            }
        );

        // Create order
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
            order,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

module.exports = {
  createQuotation,
  getQuotationsForPurchaseRequest,
  getMyQuotations,
  acceptQuotation,
};
