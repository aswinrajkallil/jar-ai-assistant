import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import chatConfig from "./chatConfig.js"; // 👈 add this

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "Hello";

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: chatConfig.model, // 👈 use config
        messages: [
          { role: "system", content: chatConfig.systemPrompt }, // 👈 use config
          { role: "user", content: userMessage },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "Aswin Chatbot",
        },
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content || "No response";

    res.json({ reply });

  } catch (error) {
    console.log("ERROR:", error.response?.data || error.message);

    res.json({
      reply: "OpenRouter error ❌",
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});