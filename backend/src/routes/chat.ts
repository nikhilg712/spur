import { Router } from "express";
import prisma from "../lib/prisma.ts";
import { generateReply } from "../services/llm.ts";

const router = Router();

router.post("/message", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: "Message too long" });
    }

    let conversationId = sessionId;

    if (!conversationId) {
      const convo = await prisma.conversation.create({ data: {} });
      conversationId = convo.id;
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId,
        sender: "user",
        text: message,
      },
    });

    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 10, // cost control
    });

    let reply: string;
    try {
      reply = await generateReply(history, message);
    } catch {
      reply = "Sorry, I'm having trouble right now. Please try again later.";
    }

    // Save AI message
    await prisma.message.create({
      data: {
        conversationId,
        sender: "ai",
        text: reply,
      },
    });

    res.json({ reply, sessionId: conversationId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
