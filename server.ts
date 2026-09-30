import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json({ limit: "8mb" }));

  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, userOrigin, userHost, userCity, activeTab, appContext } = req.body;
      
      const systemInstruction = `You are Peanut, a highly helpful, personal, and friendly immigration AI assistant.
You help immigrants settling in from ${userOrigin || "their home country"} to ${userCity || "their new city"}, ${userHost || "their new country"}.
Provide clear, concise, and helpful advice about immigration, settling in, finding housing, jobs, local culture, and navigating the new environment.
    When a user attaches a government document, translate its readable text and explain the document type, deadlines, and requested actions. Clearly distinguish text visible in the document from your interpretation, and say when content is unreadable. Do not invent missing details.

Crucially, you are a PERSONAL assistant directly integrated into this app. You are aware of all activities of the user. 
The user is currently looking at the '${activeTab || 'unknown'}' tab of the application.
Here is some context about their current state and tasks within the app:
${JSON.stringify(appContext || {}, null, 2)}

Act as a proactive guide, pulling details from their context, and guiding them during their tasks in completing processes (like their goals/roadmaps). Do not just answer generally, relate it back to their specific context and goals when relevant. Keep responses concise and formatted nicely for a chat interface.`;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "At least one message is required" });
      }

      const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
      const formattedMessages = [];
      for (const message of messages) {
        const parts: any[] = [{ text: typeof message.text === "string" ? message.text : "" }];
        if (message.attachment) {
          const { mimeType, data } = message.attachment;
          if (typeof data !== "string" || !allowedMimeTypes.has(mimeType)) {
            return res.status(400).json({ error: "Unsupported document type" });
          }
          const document = Buffer.from(data, "base64");
          if (document.length === 0 || document.length > 5 * 1024 * 1024) {
            return res.status(413).json({ error: "Documents must be 5 MB or smaller" });
          }
          parts.push({ inlineData: { mimeType, data: document.toString("base64") } });
        }
        formattedMessages.push({
          role: message.sender === "Me" ? "user" : "model",
          parts,
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedMessages,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });
      
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  app.post('/api/host-info', async (req, res) => {
    try {
      const { origin, city, host } = req.body;
      const prompt = `You are a data provider for an immigration app. Provide contextual information for someone moving from ${origin || "their home"} to ${city || "a new city"}, ${host || "a new country"}.
Ensure all JSON is perfectly valid and properly formatted.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          welcomeMessage: { type: Type.STRING },
          emergency: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                num: { type: Type.STRING }
              }
            }
          },
          news: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                tag: { type: Type.STRING },
                title: { type: Type.STRING },
                body: { type: Type.STRING },
                time: { type: Type.STRING },
                source: { type: Type.STRING },
                author: { type: Type.STRING },
                readTime: { type: Type.STRING },
                url: { type: Type.STRING },
                highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                content: { type: Type.ARRAY, items: { type: Type.STRING } },
                advice: { type: Type.STRING }
              }
            }
          },
          communities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                members: { type: Type.STRING },
                emoji: { type: Type.STRING },
                joined: { type: Type.BOOLEAN }
              }
            }
          }
        },
        required: ["welcomeMessage", "emergency", "news", "communities"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.7
        }
      });
      let text = response.text || '{}';
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\n?/, '').replace(/```$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\n?/, '').replace(/```$/, '');
      }
      const data = JSON.parse(text);
      res.json(data);
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate host info" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
