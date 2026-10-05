const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    ambagan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ambagan",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
      default: "PENDING",
    },

    paymongoCheckoutSessionId: {
      type: String,
    },

    referenceNumber: {
      type: String,
      unique: true,
      required: true,
    },

    paymentMethod: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Payment", paymentSchema);
