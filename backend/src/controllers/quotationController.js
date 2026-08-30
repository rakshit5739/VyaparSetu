const Quotation = require("../models/Quotation");
const PurchaseRequest = require("../models/PurchaseRequest");
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

    // Verify requirement ownership
    const requirement = await Requirement.findById(quotation.requestId);
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Associated requirement not found",
      });
    }

    if (requirement.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to accept quotations for this requirement",
      });
    }

    if (requirement.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "This requirement has already been completed/ordered",
      });
    }

    // Accept this quotation
    quotation.status = "Accepted";
    await quotation.save();

    // Reject other quotations for the same requirement
    await Quotation.updateMany(
      { _id: { $ne: quotation._id }, requestId: quotation.requestId },
      { status: "Rejected" }
    );

    // Complete the requirement status
    requirement.status = "Completed";
    await requirement.save();

    // Create the Order
    const order = await Order.create({
      customerId: req.user._id,
      shopkeeperId: quotation.shopkeeperId,
      quotationId: quotation._id,
      requirementId: requirement._id,
      status: "Pending",
    });

    res.status(200).json({
      success: true,
      message: "Quotation accepted, order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createQuotation,
  getQuotationsForPurchaseRequest,
  getMyQuotations,
  acceptQuotation,
};
