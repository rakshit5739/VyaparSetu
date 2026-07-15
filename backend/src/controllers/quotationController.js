const Quotation = require("../models/Quotation");
const Requirement = require("../models/Requirement");
const Shop = require("../models/Shop");
const Order = require("../models/Order");

/**
 * @desc    Submit a new quotation (Shopkeeper only)
 * @route   POST /api/quotations
 * @access  Private
 */
const createQuotation = async (req, res) => {
  try {
    const { requestId, estimatedPrice, remarks, deliveryTime } = req.body;

    if (!requestId || !estimatedPrice || !deliveryTime) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (requestId, estimatedPrice, deliveryTime)",
      });
    }

    // Verify requirement exists and is active
    const requirement = await Requirement.findById(requestId);
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    if (requirement.status === "Completed" || requirement.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot quote on a closed or cancelled requirement",
      });
    }

    // Check if shopkeeper already submitted a quotation
    const existingQuotation = await Quotation.findOne({
      requestId,
      shopkeeperId: req.user._id,
    });

    if (existingQuotation) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a quotation for this requirement",
      });
    }

    // Find shopkeeper's shop name
    const shop = await Shop.findOne({ userId: req.user._id });
    const shopName = shop ? shop.shopName : req.user.name;

    let quotationFile = "";
    if (req.file) {
      quotationFile = `/uploads/${req.file.filename}`;
    }

    const quotation = await Quotation.create({
      requestId,
      shopkeeperId: req.user._id,
      shopName,
      estimatedPrice: Number(estimatedPrice),
      remarks,
      quotationFile,
      deliveryTime: Number(deliveryTime),
    });

    // Update requirement status to "Quoted" if it was "Pending"
    if (requirement.status === "Pending") {
      requirement.status = "Quoted";
      await requirement.save();
    }

    res.status(201).json({
      success: true,
      message: "Quotation submitted successfully",
      quotation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get quotations for a requirement (Customer only, populates shopkeeper profile)
 * @route   GET /api/quotations/requirement/:requestId
 * @access  Private
 */
const getQuotationsForRequirement = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Verify requirement ownership
    const requirement = await Requirement.findById(requestId);
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    if (requirement.customerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view quotations for this requirement",
      });
    }

    const quotations = await Quotation.find({ requestId })
      .populate("shopkeeperId", "name email phone city address")
      .sort({ estimatedPrice: 1 }); // Highlight lowest price first by sorting asc

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
  getQuotationsForRequirement,
  getMyQuotations,
  acceptQuotation,
};
