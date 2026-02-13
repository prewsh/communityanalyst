import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

// Try these in order. If gemini-1.5-flash failed, use the absolute latest string:
export const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite"
});

