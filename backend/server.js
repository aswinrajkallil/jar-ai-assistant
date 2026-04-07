import axios from "axios";
import chatConfig from "../chatConfig.js"; // adjust path if needed

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const userMessage = req.body.message || "Hello";

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: chatConfig.model,
        messages: [
          { role: "system", content: chatConfig.systemPrompt },
          { role: "user", content: userMessage },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://your-domain.vercel.app", // 🔥 change this
          "X-Title": "Aswin Chatbot",
        },
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content || "No response";

    return res.status(200).json({ reply });

  } catch (error) {
    console.log("ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      reply: "OpenRouter error",
    });
  }
}