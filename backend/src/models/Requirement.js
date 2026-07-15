const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedFile: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Quoted", "Completed", "Cancelled"],
      default: "Pending",
    },
    city: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Requirement = mongoose.model("Requirement", requirementSchema);
module.exports = Requirement;
