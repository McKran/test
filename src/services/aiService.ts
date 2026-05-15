import { ChatMessage } from "../types";

export const aiService = {
  sendMessage: async (message: string, history: ChatMessage[], context: string) => {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, userPrefs: { context } }),
    });
    if (!res.ok) throw new Error("AI request failed");
    const data = await res.json();
    return data.content;
  }
};
