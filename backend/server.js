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

app.use(cors());
app.use(express.json());
app.use("/api/ambagan", ambaganRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error(error));

app.get("/", (req, res) => {
  res.json({
    message: "Ambagan API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body; // [{ role: "user", content: "Hi" }, ...]
    const response = await client.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 1024,
      system: "You are a helpful assistant inside my app.",
      messages,
    });
    res.json({ text: response.content[0].text });
  } catch (e) {
    res.status(500).json({ error: "Something went wrong" });
  }
});
