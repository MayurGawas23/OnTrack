import { GoogleGenAI } from "@google/genai";
import AiChatModel from "../models/aiChat.model.js";

export const generateHabits = async (req, res) => {
    try {
        const { title, description } = req.body;

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const prompt = `
You are a fitness coach.

Goal:
Title: ${title}
Description: ${description}

Generate 5 daily habits.

Rules:
- MUST be short numeric-based outputs (e.g. "10000 steps", "2 hours workout", "3 liters water").
- DO NOT use paragraphs, explanations, or sentences longer than 4-5 words.
- Output ONLY JSON array:
[
 { "title": "Short Habit Name", "description": "Short Target Value" }
]
`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        let text = response.text;

        // clean response
        text = text.replace(/```json|```/g, "").trim();

        let habits;
        try {
            habits = JSON.parse(text);
        } catch (err) {
            return res.status(500).json({
                success: false,
                raw: text,
            });
        }

        res.json({
            success: true,
            habits,
        });
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

export const chatWithAI = async (req, res) => {
    const { message, prompt, saveChat, userMessage } = req.body;
    const contents = prompt || message;

    if (!contents) {
        return res.status(400).json({ error: "Message or prompt is required" });
    }

    if (saveChat && userMessage && req.userId) {
        await AiChatModel.findOneAndUpdate(
            { userId: req.userId },
            { $push: { messages: { role: 'user', content: userMessage } } },
            { upsert: true }
        );
    }

    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
    });

    if (saveChat && userMessage && req.userId) {
        await AiChatModel.findOneAndUpdate(
            { userId: req.userId },
            { $push: { messages: { role: 'ai', content: response.text } } }
        );
    }

    res.json({ reply: response.text, response: response.text });
};

export const getChats = async (req, res) => {
    try {
        const chat = await AiChatModel.findOne({ userId: req.userId });
        if (!chat) {
            return res.json({ messages: [] });
        }
        res.json({ messages: chat.messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const generateDietPlan = async (req, res) => {
    try {
        const { weight, height, fitnessGoal, activityLevel, sleepHours, dietPreferences } = req.body;

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

const prompt = `
You are an expert fitness coach and nutritionist.

User Profile:
- Weight: ${weight} kg
- Height: ${height} cm
- Goal: ${fitnessGoal}
- Activity Level: ${activityLevel}
- Sleep: ${sleepHours} hours
- Diet Preferences: ${dietPreferences}

Based on the user's activity level and fitness goal, first recommend some basic activities (like strength training, daily steps, cardio).
Then, generate a strictly Indian budget diet plan tailored to this user. DO NOT use fancy or expensive foods. Use affordable, everyday Indian ingredients.
Calculate the target daily calories to intake, the target daily calories to burn (via workout), and the target daily protein intake (in grams).

FORMATTING RULES:
- Use clear Markdown formatting.
- Differentiate meals (Breakfast, Lunch, Dinner, Snacks) with bold titles (e.g. **Breakfast:**).
- Use bullet points for the recommended activities and the food items.
- Ensure the output is highly readable and well-structured.

Output ONLY a JSON object with this exact structure (No markdown code blocks or backticks wrapping the JSON itself, just the raw JSON):
{
  "dietPlan": "String containing the markdown formatted structured daily diet plan and recommended basic activities.",
  "targetCalories": 2000,
  "targetBurn": 500,
  "targetProtein": 120
}
`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        let text = response.text;
        text = text.replace(/```json|```/g, "").trim();

        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            return res.status(500).json({ success: false, raw: text });
        }

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};