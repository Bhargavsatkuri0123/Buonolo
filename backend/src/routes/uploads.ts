import { Router } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { env } from "../env.js";

export const uploadsRouter = Router();

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const storage = multer.diskStorage({
  destination: env.uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) return cb(new Error("Unsupported file type"));
    cb(null, true);
  },
});

uploadsRouter.post("/", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) throw new HttpError(400, "No file uploaded");
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});
