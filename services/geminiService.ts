
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Role, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export class GeminiService {
  private chat: Chat;

  constructor(systemInstruction: string = "你是一个专业、亲切的公司知识库助手。你的回答应该基于事实，条理清晰。如果涉及专业术语，请适当解释。") {
    this.chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
      },
    });
  }

  async sendMessage(text: string, onChunk?: (chunk: string) => void): Promise<string> {
    if (onChunk) {
      const result = await this.chat.sendMessageStream({ message: text });
      let fullText = "";
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text || "";
        fullText += chunkText;
        onChunk(chunkText);
      }
      return fullText;
    } else {
      const response = await this.chat.sendMessage({ message: text });
      return response.text || "";
    }
  }

  // Helper to format history for the chat if we need to reconstruct it
  static formatHistory(messages: Message[]) {
    return messages.map(msg => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
  }
}
