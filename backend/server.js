const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const ambaganRoutes = require("./routes/ambaganRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const dns = require("dns");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

/*
====================================================
CORS
====================================================
*/

app.use(cors());

/*
====================================================
PAYMONGO WEBHOOK
====================================================

IMPORTANT:
This MUST come before express.json().

The webhook needs the original/raw request body
for PayMongo signature verification.
*/

app.post(
  "/api/payments/paymongo-webhook",
  express.raw({
    type: "application/json",
  }),
  async (req, res) => {
    try {
      console.log("========== PAYMONGO WEBHOOK ==========");

      /*
        Get the original raw body
      */

      const rawBody = req.body.toString();

      console.log("RAW BODY:");
      console.log(rawBody);

      /*
        Get PayMongo's webhook signature
      */

      const signature = req.headers["paymongo-signature"];

      console.log("SIGNATURE:");
      console.log(signature);

      /*
        FOR NOW:
        We are only testing that PayMongo
        can reach your backend.

        We will add signature verification
        and payment processing next.
      */

      return res.sendStatus(200);
    } catch (error) {
      console.error("Webhook error:", error);

      return res.sendStatus(500);
    }
  },
);

/*
====================================================
NORMAL JSON MIDDLEWARE
====================================================

Everything below this point can use:

req.body

as a normal JavaScript object.
*/

app.use(express.json());

/*
====================================================
NORMAL ROUTES
====================================================
*/

app.use("/api/ambagan", ambaganRoutes);

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/payments", paymentRoutes);

/*
====================================================
HOME
====================================================
*/

app.get("/", (req, res) => {
  res.json({
    message: "Ambagan API is running",
  });
});

/*
====================================================
CHAT
====================================================
*/

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await client.messages.create({
      model: "claude-sonnet-5-5",

      max_tokens: 1024,

      system: "You are a helpful assistant inside my app.",

      messages,
    });

    res.json({
      text: response.content[0].text,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

/*
====================================================
MONGODB
====================================================
*/

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

/*
====================================================
SERVER
====================================================
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
