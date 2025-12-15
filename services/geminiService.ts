import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateIdeas = async (prompt: string): Promise<string[]> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return ["Please configure your API_KEY to use AI features.", "Mock Idea 1", "Mock Idea 2"];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 4 short, punchy, creative ideas or sticky-note concepts related to: "${prompt}". Keep them brief (under 10 words each).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const ideas = JSON.parse(jsonText);
    if (Array.isArray(ideas)) {
      return ideas;
    }
    return [];

  } catch (error) {
    console.error("Gemini API Error:", error);
    return ["Error generating ideas. Try again."];
  }
};
