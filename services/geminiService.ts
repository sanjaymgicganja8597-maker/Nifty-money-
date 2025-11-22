import { GoogleGenAI } from "@google/genai";

export const analyzeStock = async (stockSymbol: string, currentPrice: number, recentTrend: 'UP' | 'DOWN' | 'FLAT'): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "NiftyBot unavailable: API Key not configured.";
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Act as a senior financial analyst for a premium trading app called "Nifty Money".
      Analyze the stock "${stockSymbol}" which is currently trading at ₹${currentPrice}.
      The immediate short-term trend appears ${recentTrend}.

      Provide a concise, professional analysis (under 100 words) covering:
      1. Technical sentiment (Bullish/Bearish/Neutral).
      2. Key support/resistance levels (simulated based on price).
      3. A risk warning.

      Format the output with bold keywords.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to connect to NiftyBot AI service.";
  }
};