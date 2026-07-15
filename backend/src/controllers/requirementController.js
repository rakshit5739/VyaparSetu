const Requirement = require("../models/Requirement");
const Quotation = require("../models/Quotation");

/**
 * @desc    Create a new requirement (Customer only)
 * @route   POST /api/requirements
 * @access  Private
 */
const createRequirement = async (req, res) => {
  try {
    const { title, description, category, city, deadline } = req.body;

    if (!title || !category || !city || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (title, category, city, deadline)",
      });
    }

    let uploadedFile = "";
    if (req.file) {
      uploadedFile = `/uploads/${req.file.filename}`;
    }

    const requirement = await Requirement.create({
      customerId: req.user._id,
      title,
      description,
      category,
      uploadedFile,
      city: city.toLowerCase().trim(),
      deadline: new Date(deadline),
    });

    res.status(201).json({
      success: true,
      message: "Requirement list uploaded successfully",
      requirement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get requirements uploaded by current Customer
 * @route   GET /api/requirements/my
 * @access  Private
 */
const getMyRequirements = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const filter = { customerId: req.user._id };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Requirement.countDocuments(filter);
    const requirements = await Requirement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const requirementsWithCount = await Promise.all(
      requirements.map(async (item) => {
        const count = await Quotation.countDocuments({ requestId: item._id });
        return {
          ...item.toObject(),
          quotationsCount: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      requirements: requirementsWithCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get incoming requirements (Shopkeeper view, filtered by city)
 * @route   GET /api/requirements/incoming
 * @access  Private
 */
const getIncomingRequirements = async (req, res) => {
  try {
    const { city, category, search, page = 1, limit = 10 } = req.query;
    
    // Default to shopkeeper's city if not specified in query parameters
    const filterCity = city ? city.toLowerCase().trim() : (req.user.city ? req.user.city.toLowerCase().trim() : "");

    const filter = {
      status: { $in: ["Pending", "Quoted"] },
    };

    if (filterCity) {
      filter.city = filterCity;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Requirement.countDocuments(filter);
    const requirements = await Requirement.find(filter)
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const requirementsWithCount = await Promise.all(
      requirements.map(async (item) => {
        const count = await Quotation.countDocuments({ requestId: item._id });
        return {
          ...item.toObject(),
          quotationsCount: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      requirements: requirementsWithCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get requirement detail by ID
 * @route   GET /api/requirements/:id
 * @access  Private
 */
const getRequirementById = async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id)
      .populate("customerId", "name email phone city address");

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    res.status(200).json({
      success: true,
      requirement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update a requirement (Customer only)
 * @route   PUT /api/requirements/:id
 * @access  Private
 */
const updateRequirement = async (req, res) => {
  try {
    let requirement = await Requirement.findById(req.params.id);

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    // Verify ownership
    if (requirement.customerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this requirement",
      });
    }

    const { title, description, category, city, deadline, status } = req.body;

    if (title) requirement.title = title;
    if (description !== undefined) requirement.description = description;
    if (category) requirement.category = category;
    if (city) requirement.city = city.toLowerCase().trim();
    if (deadline) requirement.deadline = new Date(deadline);
    if (status) requirement.status = status;

    if (req.file) {
      requirement.uploadedFile = `/uploads/${req.file.filename}`;
    }

    await requirement.save();

    res.status(200).json({
      success: true,
      message: "Requirement updated successfully",
      requirement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete a requirement (Customer/Admin only)
 * @route   DELETE /api/requirements/:id
 * @access  Private
 */
const deleteRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    // Verify ownership
    if (requirement.customerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this requirement",
      });
    }

    await Requirement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Requirement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRequirement,
  getMyRequirements,
  getIncomingRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
};
