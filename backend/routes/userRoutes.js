const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Ambagan = require("../models/ambaganModel");

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get one user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({
      message: "Invalid user ID",
    });
  }
});

// Create user
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Don't return password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Create user error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/:id/joined_ambagan", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate({
        path: "joinedContributions.ambaganId",
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userJoined = user.joinedContributions;

    res.json(userJoined);
  } catch (error) {
    res.status(400).json({
      message: "Invalid user id",
    });
  }
});

router.post("/:id/join/me/:userId", async (req, res) => {
  try {
    const ambagan = await Ambagan.findById(req.params.id);

    if (!ambagan) {
      return res.status(404).json({
        message: "Ambagan not found",
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyJoined = user.joinedContributions.some(
      (item) => item.ambaganId.toString() === ambagan._id.toString(),
    );

    if (alreadyJoined) {
      return res.status(400).json({
        message: "You have already joined this ambagan",
      });
    }

    user.joinedContributions.push({
      ambaganId: req.params.id,
    });

    await user.save();

    await user.populate({
      path: "joinedContributions.ambaganId",
      model: "Ambagan",
    });

    res.status(200).json({
      message: "Successfully joined ambagan",
      user,
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
