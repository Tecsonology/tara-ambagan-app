const mongoose = require("mongoose");

const joinedContributionSchema = new mongoose.Schema({
  ambaganId: {
    type: mongoose.Schema.ObjectId,
    ref: "Ambagan",
    required: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    joinedContributions: [joinedContributionSchema],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
