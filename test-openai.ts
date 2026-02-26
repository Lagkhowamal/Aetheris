import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGeminiKey() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log("Testing Gemini API key...");
    
    const response = await model.generateContent("Hello! Just testing the API connection.");

    console.log("✅ Gemini API key is working!");
    console.log("Response:", response.response.text());
  } catch (error: any) {
    console.error("❌ Error testing Gemini API key:");
    console.error("Error message:", error.message);
    
    if (error.status === 401 || error.message?.includes("API key")) {
      console.error("Invalid API key - check your credentials");
    } else if (error.code === "ERR_MODULE_NOT_FOUND") {
      console.error("Missing dotenv or @google/generative-ai module");
    }
  }
}

testGeminiKey();
