const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    // requestId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Requirement",
    //   required: true,
    // },
    shopkeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    purchaseRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
      required: true,
    },
    // shopName: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    estimatedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    message: {
      type: String,
      trim: true,
      required: true,
    },
    // remarks: {
    //   type: String,
    //   trim: true,
    // },
    // quotationFile: {
    //   type: String,
    //   default: "",
    // },
    // deliveryTime: {
    //   type: Number, // In days
    //   required: true,
    //   min: 0,
    // },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

quotationSchema.index(
    {
        shopkeeper: 1,
        purchaseRequest: 1,
    },
    {
        unique: true,
    }
);

const Quotation = mongoose.model("Quotation", quotationSchema);
module.exports = Quotation;
