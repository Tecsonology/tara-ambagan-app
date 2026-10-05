const express = require("express");
const Ambagan = require("../models/ambaganModel");
const User = require("../models/userModel");

const router = express.Router();

// Get all ambagan
router.get("/", async (req, res) => {
  try {
    const ambagan = await Ambagan.find();

    res.json(ambagan);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get one ambagan by ID
router.get("/:id", async (req, res) => {
  try {
    const ambagan = await Ambagan.findById(req.params.id);

    if (!ambagan) {
      return res.status(404).json({
        message: "Ambagan not found",
      });
    }

    res.json(ambagan);
  } catch (error) {
    res.status(400).json({
      message: "Invalid Ambagan ID",
    });
  }
});

// Create ambagan
router.post("/", async (req, res) => {
  try {
    const ambagan = await Ambagan.create(req.body);

    res.status(201).json(ambagan);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/:id/contributors", async (req, res) => {
  try {
    const ambagan = await Ambagan.findById(req.params.id).populate(
      "contributors.user",
      "name email",
    );

    if (!ambagan) {
      return res.status(404).json({
        message: "Ambagan not found",
      });
    }

    res.json(ambagan.contributors);
  } catch (error) {
    res.status(400).json({
      message: "Invalid Ambagan ID",
    });
  }
});

router.post("/:id/contributors", async (req, res) => {
  try {
    const { id } = req.params;
    const { user, contributorName, amount } = req.body;

    // Validate user ID
    if (!user) {
      return res.status(400).json({
        message: "Contributor user ID is required",
      });
    }

    // Validate amount
    if (
      amount === undefined ||
      amount === null ||
      typeof amount !== "number" ||
      amount < 0
    ) {
      return res.status(400).json({
        message: "A valid contribution amount is required",
      });
    }

    // Check if user exists
    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Find Ambagan
    const ambagan = await Ambagan.findById(id);

    if (!ambagan) {
      return res.status(404).json({
        message: "Ambagan not found",
      });
    }

    // Check if user is already a contributor
    const existingContributor = ambagan.contributors.find(
      (contributor) => contributor.user.toString() === user.toString(),
    );

    // Add contributor
    ambagan.contributors.push({
      user: existingUser._id,
      contributorName,
      amount,
    });

    // Update current amount
    ambagan.currentAmount = (ambagan.currentAmount || 0) + amount;

    // Update members count
    ambagan.membersCount = ambagan.contributors.length;

    await ambagan.save();

    return res.status(201).json({
      message: "Contributor added successfully",

      contributor: {
        user: existingUser._id,
        contributorName,
        amount,
      },

      ambagan,
    });
  } catch (error) {
    console.error("Add Contributor Error:", error);

    return res.status(500).json({
      message: "Failed to add contributor",
      error: error.message,
    });
  }
});

// Check if a user has already joined an Ambagan
router.get("/:ambaganId/joined/:userId", async (req, res) => {
  try {
    const { ambaganId, userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const joined = user.joinedContributions.some(
      (item) =>
        item.ambaganId && item.ambaganId.toString() === ambaganId.toString(),
    );

    return res.status(200).json({
      joined,
      ambaganId,
      userId,
    });
  } catch (error) {
    console.error("Check joined Ambagan error:", error);

    return res.status(500).json({
      message: "Failed to check if user joined Ambagan",
      error: error.message,
    });
  }
});

router.get("/created/:id", async (req, res) => {
  try {
    const ambagans = await Ambagan.find({
      user: req.params.id,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(ambagans);
  } catch (error) {
    console.error("Error fetching created Ambagans:", error);

    return res.status(500).json({
      message: "Failed to fetch created Ambagans",
      error: error.message,
    });
  }
});

module.exports = router;
