import { GoogleGenerativeAI } from "@google/generative-ai";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

// Initialize Gemini AI
const API_KEY = env.GOOGLE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message || typeof message !== "string") {
      return json({ error: "Message is required" }, { status: 400 });
    }

    if (!API_KEY) {
      return json(
        {
          error: "Google Gemini API key not configured",
          response:
            "I apologize, but I'm not properly configured yet. Please add your Google Gemini API key to the environment variables.",
        },
        { status: 500 },
      );
    }

    // Build conversation context from history
    let conversationContext = "";
    if (conversationHistory.length > 0) {
      conversationContext = "\n\nPrevious conversation:\n";
      conversationHistory.forEach((msg: any) => {
        const role = msg.sender === "user" ? "User" : "Maya";
        conversationContext += `${role}: ${msg.text}\n`;
      });
    }

    // Create a prompt that includes conversation history and encourages conversational responses
    const prompt = `
			You are Maya, a helpful and friendly AI assistant. Speak naturally and conversationally, as your responses will be read aloud. Keep replies concise, clear, and engaging. Always consider the previous conversation for context and respond appropriately. If the user’s question requires up-to-date or external information, fetch it from the internet before responding. 
			
			Conversation context: 
       		${conversationContext}
		
			User message: 
			${message}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return json({ response: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return json(
      {
        error: "Failed to generate response",
        response:
          "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
};
