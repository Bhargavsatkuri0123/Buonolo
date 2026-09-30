import { Router } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAuth } from "../middleware/auth.js";
import { HttpError, asyncHandler } from "../middleware/errorHandler.js";
import { env } from "../env.js";

export const uploadsRouter = Router();

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

// Static credentials are only passed explicitly when set; otherwise the SDK falls
// back to its default provider chain (e.g. the EC2 instance profile in prod).
const s3Client =
  env.storageBackend === "s3"
    ? new S3Client({
        region: env.awsRegion,
        ...(env.awsAccessKeyId && env.awsSecretAccessKey
          ? { credentials: { accessKeyId: env.awsAccessKeyId, secretAccessKey: env.awsSecretAccessKey } }
          : {}),
      })
    : null;

const upload = multer({
  storage:
    env.storageBackend === "s3"
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: env.uploadDir,
          filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
        }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) return cb(new Error("Unsupported file type"));
    cb(null, true);
  },
});

uploadsRouter.post(
  "/",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, "No file uploaded");

    if (env.storageBackend === "s3") {
      const key = `${randomUUID()}${path.extname(req.file.originalname).toLowerCase()}`;
      await s3Client!.send(
        new PutObjectCommand({
          Bucket: env.s3Bucket!,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );
      return res.status(201).json({ url: `${env.s3PublicBaseUrl!.replace(/\/$/, "")}/${key}` });
    }

    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  })
);
