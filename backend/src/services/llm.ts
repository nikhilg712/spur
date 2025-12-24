import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FAQ_CONTEXT = `
Store FAQ:
- Shipping: We ship worldwide. Delivery takes 5–10 business days.
- Returns: 30-day return policy. Unused items only.
- Refunds: Processed within 5 business days after return.
- Support hours: Mon–Fri, 9am–6pm IST.
`;

export async function generateReply(
  history: { sender: "user" | "ai"; text: string }[],
  userMessage: string
): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful support agent for a small e-commerce store. Answer clearly and concisely.\n" +
        FAQ_CONTEXT,
    },
    ...history.map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    })),
    { role: "user", content: userMessage },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 200,
    });

    return completion.choices[0].message.content ?? "Sorry, I couldn't answer that.";
  } catch (err) {
    console.error("LLM error:", err);
    throw new Error("LLM_FAILED");
  }
}
