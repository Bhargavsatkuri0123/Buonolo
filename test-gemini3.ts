import { GoogleGenAI } from "@google/genai";
async function test() {
  try {
    const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello",
    });
    console.log(response.text);
  } catch(e: any) {
    console.error("ERROR CAUGHT:");
    console.error(e.message);
  }
}
test();
