const express = require("express");
const doubletick = require("@api/doubletick");
const { v4: uuidv4 } = require("uuid"); // For generating messageId
const router = express.Router();
const axios = require("axios");
const DOUBLE_TICK_API_KEY = "key_El4GytQ8Vg"; // Replace with your actual API key

doubletick.auth(DOUBLE_TICK_API_KEY);

router.post("/send-template", async (req, res) => {
  const { from, to, templateName, language } = req.body;

  if (!from || !to || !templateName || !language) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await doubletick.outgoingMessagesWhatsappTemplate({
      messages: [
        {
          from, // Sender's WhatsApp number
          to, // Receiver's WhatsApp number
          messageId: uuidv4(), // Generate a unique message ID
          content: {
            templateName: templateName, // WhatsApp template name
            language: language, // Template language
          },
        },
      ],
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send WhatsApp template message" });
  }
});
router.post("/send-text", async (req, res) => {
    try {
      const { from, to, message } = req.body;
  
      if (!from || !to || !message) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }
  
      const payload = {
        from,
        to,
        messageId: uuidv4(),
        content: { text: message },
      };
  
      const response = await axios.post(
        "https://public.doubletick.io/whatsapp/message/text",
        payload,
        { headers: { Authorization: `Bearer ${DOUBLE_TICK_API_KEY}` } }
      );
  
      return res.json({ success: true, data: response.data });
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error.message);
      return res.status(500).json({ success: false, error: error.response?.data || "Internal Server Error" });
    }
  });
  
module.exports = router;
