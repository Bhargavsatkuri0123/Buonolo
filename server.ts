import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, userOrigin, userHost, userCity } = req.body;
      
      const systemInstruction = `You are Mr O, a helpful and friendly immigration assistant.
You help immigrants settling in from ${userOrigin || "their home country"} to ${userCity || "their new city"}, ${userHost || "their new country"}.
Provide clear, concise, and helpful advice about immigration, settling in, finding housing, jobs, local culture, and navigating the new environment.`;

      const formattedMessages = messages.map((m: any) => ({
        role: m.sender === 'Me' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedMessages,
        config: {
          systemInstruction: { parts: [{ text: systemInstruction }] },
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
Return ONLY valid JSON matching this schema exactly:
{
  "welcomeMessage": "A short, warm welcome message tailored to the city",
  "emergency": [
    { "label": "Police", "num": "Local police number" },
    { "label": "Ambulance", "num": "Local ambulance number" },
    { "label": "Non-Emergency", "num": "Local non-emergency number" }
  ],
  "news": [
    { 
      "id": 1, 
      "tag": "Transport", 
      "title": "Realistic local news headline", 
      "body": "Short snippet summarizing the news", 
      "time": "2h ago",
      "source": "Local News Publication Name",
      "author": "Reporter Name",
      "readTime": "3 min read",
      "url": "https://news.example.com/local-article",
      "highlights": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3"],
      "content": ["Detailed paragraph 1 explaining the development", "Detailed paragraph 2 with statements or impacts", "Detailed paragraph 3 about next steps"],
      "advice": "Actionable advice or tips for newly arrived residents"
    }
  ],
  "communities": [
    { "name": "Realistic local expat group name", "members": "1.2k", "emoji": "🌍", "joined": false },
    { "name": "Local hobby group", "members": "800", "emoji": "🎨", "joined": false }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });
      const data = JSON.parse(response.text || '{}');
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
