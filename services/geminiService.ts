import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface WasteAnalysisResult {
  itemName: string;
  material: string;
  recyclability: string;
  disposalAdvice: string;
}

export const analyzeWasteImage = async (base64Image: string): Promise<WasteAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] // remove data:image/jpeg;base64, prefix
            }
          },
          {
            text: "Analyze this image and identify the primary piece of trash/waste centered in the frame. Provide the specific name, material, recyclability status, and brief disposal advice."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemName: { type: Type.STRING },
            material: { type: Type.STRING },
            recyclability: { type: Type.STRING, enum: ["Recyclable", "Non-Recyclable", "Compostable", "Hazardous"] },
            disposalAdvice: { type: Type.STRING }
          },
          required: ["itemName", "material", "recyclability", "disposalAdvice"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as WasteAnalysisResult;
    }
    
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};