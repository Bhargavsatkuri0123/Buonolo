import { GoogleGenAI } from "@google/genai";
async function test() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Key length:", key?.length);
  console.log("Key start:", key?.substring(0, 5));
  console.log("Key end:", key?.substring(key.length - 5));
  console.log("Has whitespace:", /\s/.test(key || ""));
}
test();
