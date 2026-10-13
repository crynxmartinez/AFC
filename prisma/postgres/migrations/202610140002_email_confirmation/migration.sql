ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
-- Preserve accounts created before confirmation was introduced, including admin.
UPDATE "User" SET "emailVerifiedAt" = CURRENT_TIMESTAMP;
CREATE TABLE "EmailConfirmation" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailConfirmation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EmailConfirmation_userId_idx" ON "EmailConfirmation"("userId");
ALTER TABLE "EmailConfirmation" ADD CONSTRAINT "EmailConfirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
