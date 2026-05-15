import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Note: In this environment, GEMINI_API_KEY is handled.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const aiService = {
  sendMessage: async (message: string, history: ChatMessage[], context: string) => {
    // Advanced Routing Logic
    let modelType = "Llama-Chat";
    let systemInstruction = "";

    const lc = message.toLowerCase();
    if (lc.includes("analyze") || lc.includes("calculate") || lc.includes("reason") || lc.includes("decision")) {
      modelType = "DeepSeek-Reasoning";
      systemInstruction = `You are DeepSeek-Router configured for Agricultural Reasoning. 
      Focus on logical deduction, multi-step analysis, and data-driven farming decisions.
      Context: ${context}
      Provide step-by-step reasoning for the farmer's request. Avoid fluff.`;
    } else if (lc.includes("fact") || lc.includes("database") || lc.includes("knowledge") || lc.includes("how to grow") || lc.includes("details about")) {
      modelType = "Qwen-Knowledge";
      systemInstruction = `You are Qwen-Knowledge configured for Agricultural Information.
      Provide structured, highly accurate technical details about crops, pests, and soil.
      Context: ${context}
      Use bullet points and clear categories for your response.`;
    } else {
      modelType = "Llama-Conversational";
      systemInstruction = `You are Llama-Conversational configured for Farmer Interaction.
      Focus on being helpful, empathetic, and easy to talk to. 
      Context: ${context}
      Keep your response concise and conversational.`;
    }

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `${systemInstruction} (Selected Model Identity: ${modelType})`,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  }
};
