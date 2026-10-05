const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const ambaganRoutes = require("./routes/ambaganRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const Payment = require("./models/paymentModel");

const dns = require("dns");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

// DNS configuration
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
This MUST be BEFORE express.json().

PayMongo sends the webhook as raw JSON.
We need the raw body for signature verification
later.
*/
app.post(
  "/api/payments/paymongo-webhook",
  express.raw({
    type: "application/json",
  }),
  async (req, res) => {
    try {
      console.log("========== PAYMONGO WEBHOOK ==========");

      // Convert raw body into JSON
      const rawBody = req.body.toString();

      console.log("RAW BODY:");
      console.log(rawBody);

      // PayMongo signature
      const signature = req.headers["paymongo-signature"];

      console.log("SIGNATURE:");
      console.log(signature);

      // Parse webhook event
      const event = JSON.parse(rawBody);

      const eventType = event.data?.attributes?.type;

      console.log("EVENT TYPE:", eventType);

      /*
      ==================================================
      IGNORE EVENTS WE DON'T NEED
      ==================================================
      */

      if (eventType !== "checkout_session.payment.paid") {
        console.log("Ignoring event:", eventType);

        return res.sendStatus(200);
      }

      /*
      ==================================================
      GET CHECKOUT SESSION
      ==================================================
      */

      const checkoutSession = event.data?.attributes?.data;

      if (!checkoutSession) {
        console.error("Checkout session data not found");

        return res.sendStatus(400);
      }

      /*
      ==================================================
      GET METADATA
      ==================================================
      */

      const metadata = checkoutSession.attributes?.metadata;

      const paymentId = metadata?.payment_id;

      const ambaganId = metadata?.ambagan_id;

      const userId = metadata?.user_id;

      console.log("Payment ID:", paymentId);
      console.log("Ambagan ID:", ambaganId);
      console.log("User ID:", userId);

      /*
      ==================================================
      VALIDATE METADATA
      ==================================================
      */

      if (!paymentId || !ambaganId || !userId) {
        console.log("No Tara, Ambagan metadata found. Ignoring test event.");

        return res.sendStatus(400);
      }

      /*
      ==================================================
      FIND PAYMENT
      ==================================================
      */

      const payment = await Payment.findById(paymentId);

      if (!payment) {
        console.error("Payment not found:", paymentId);

        return res.sendStatus(404);
      }

      /*
      ==================================================
      PREVENT DUPLICATE PROCESSING
      ==================================================

      PayMongo may retry a webhook.

      If the payment is already PAID,
      don't process it again.
      */

      if (payment.status === "PAID") {
        console.log("Payment already processed:", paymentId);

        return res.sendStatus(200);
      }

      /*
      ==================================================
      GET PAYMONGO PAYMENT
      ==================================================
      */

      const paymongoPayment = checkoutSession.attributes?.payments?.[0];

      const paymongoPaymentId = paymongoPayment?.id;

      console.log("PayMongo Payment ID:", paymongoPaymentId);

      /*
      ==================================================
      UPDATE PAYMENT
      ==================================================
      */

      payment.status = "PAID";

      if (paymongoPaymentId) {
        payment.paymongoPaymentId = paymongoPaymentId;
      }

      await payment.save();

      console.log("Payment successfully marked as PAID:", paymentId);

      /*
      ==================================================
      SUCCESS
      ==================================================
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

This comes AFTER the PayMongo webhook.
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
