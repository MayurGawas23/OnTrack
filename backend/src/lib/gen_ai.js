
import { GoogleGenAI } from "@google/genai";

const GenerateHabit = async () => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Generate 3 habits for fat loss",
  });

  console.log(response.text);
};

GenerateHabit()

// export default GenerateHabit;