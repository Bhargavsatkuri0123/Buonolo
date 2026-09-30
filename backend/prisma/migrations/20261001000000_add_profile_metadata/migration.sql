ALTER TABLE "User"
  ADD COLUMN "avatarUrl" TEXT,
  ADD COLUMN "languages" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "situation" TEXT,
  ADD COLUMN "focus" TEXT;