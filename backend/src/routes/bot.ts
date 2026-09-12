import { Router } from "express";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { env } from "../env.js";
import { redis } from "../redis.js";

export const botRouter = Router();

const ai = env.geminiApiKey ? new GoogleGenAI({ apiKey: env.geminiApiKey }) : null;

const SYSTEM_INSTRUCTION =
  "You are Mr O, a friendly, practical immigration and relocation assistant inside the Buonolo app. " +
  "Help users settle into a new country: visas, registration, housing, healthcare, banking, language learning, and " +
  "local culture. Keep answers concise, warm, and actionable. If you don't know a country-specific legal detail for " +
  "certain, say so and suggest checking the official local authority rather than guessing.";

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "model"]), text: z.string() }))
    .max(30)
    .default([]),
});

const RATE_LIMIT_PER_MINUTE = 15;

botRouter.post(
  "/chat",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!ai) throw new HttpError(503, "The AI assistant is not configured on this server");

    const rateKey = `bot-rate:${req.userId}`;
    const count = await redis.incr(rateKey);
    if (count === 1) await redis.expire(rateKey, 60);
    if (count > RATE_LIMIT_PER_MINUTE) throw new HttpError(429, "Too many messages — please slow down.");

    const { message, history } = chatSchema.parse(req.body);

    const contents = [
      ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: "user" as const, parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    const reply = response.text ?? "Sorry, I couldn't come up with a response just now — please try again.";
    res.json({ reply });
  })
);
