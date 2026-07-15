const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Requirement",
      required: true,
    },
    shopkeeperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    estimatedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    remarks: {
      type: String,
      trim: true,
    },
    quotationFile: {
      type: String,
      default: "",
    },
    deliveryTime: {
      type: Number, // In days
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Submitted", "Accepted", "Rejected"],
      default: "Submitted",
    },
  },
  {
    timestamps: true,
  }
);

const Quotation = mongoose.model("Quotation", quotationSchema);
module.exports = Quotation;
