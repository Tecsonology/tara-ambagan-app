const mongoose = require("mongoose");

const contributorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contributorName: {
      type: String,
      required: false,
    },

    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const ambaganSchema = new mongoose.Schema(
  {
    ambaganName: {
      type: String,
      required: true,
      trim: true,
    },

    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Contribution Type: Fixed amount vs Open/Flexible amount
    contributionType: {
      type: String,
      enum: ["Fixed", "Open"],
      default: "Open",
      required: true,
    },

    // Set value if contributionType is "Fixed". Required only when type is "Fixed".
    targetAmount: {
      type: Number,
      min: 0,
      default: null,
      validate: {
        validator: function (value) {
          // If contribution type is Fixed, fixedAmount must be greater than 0
          if (this.contributionType === "Fixed") {
            return value != null && value > 0;
          }
          return true;
        },
        message:
          "A fixed amount greater than 0 is required when contribution type is Fixed.",
      },
    },

    membersCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
      required: true,
    },

    // Owner/creator of the Ambagan
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    dueDate: {
      type: Date,
      required: false,
      validate: {
        validator: function (value) {
          return !value || value > new Date();
        },
        message: "Due date must be in the future.",
      },
    },

    // People contributing to the Ambagan
    contributors: [contributorSchema],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Ambagan", ambaganSchema);
