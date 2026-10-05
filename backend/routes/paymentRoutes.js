const express = require("express");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");

const router = express.Router();

router.post("/create-checkout", async (req, res) => {
  try {
    const { ambaganId, userId, amount } = req.body;

    if (!ambaganId || !userId || !amount) {
      return res.status(400).json({
        message: "Missing payment information",
      });
    }

    const referenceNumber = `AMBAG-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    // Create your own pending payment first
    const payment = await Payment.create({
      ambagan: ambaganId,
      user: userId,
      amount,
      status: "PENDING",
      referenceNumber,
    });

    const response = await fetch(
      "https://api.paymongo.com/v2/checkout_sessions",
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString(
              "base64",
            ),

          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          data: {
            attributes: {
              line_items: [
                {
                  name: "Ambagan Contribution",
                  amount: amount * 100,
                  currency: "PHP",
                  quantity: 1,
                },
              ],

              payment_method_types: ["gcash", "qrph", "card"],

              reference_number: referenceNumber,

              success_url: "https://your-domain.com/payment/success",

              cancel_url: "https://your-domain.com/payment/cancelled",

              metadata: {
                payment_id: payment._id.toString(),
                ambagan_id: ambaganId,
                user_id: userId,
              },
            },
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(400).json({
        message: "Failed to create PayMongo checkout",
        error: data,
      });
    }

    const checkoutSession = data.data;

    payment.paymongoCheckoutSessionId = checkoutSession.id;

    await payment.save();

    res.json({
      success: true,
      paymentId: payment._id,
      checkoutUrl: checkoutSession.attributes.checkout_url,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/paymongo-webhook", async (req, res) => {
  try {
    console.log("========== PAYMONGO WEBHOOK ==========");

    console.log(JSON.stringify(req.body, null, 2));

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
