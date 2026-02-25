-- Migration: Add Referral and Withdrawal System
-- Run this manually on your database if auto-migration fails

-- Add referralCode column to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_code" TEXT UNIQUE;

-- Create referrals table
CREATE TABLE IF NOT EXISTS "referrals" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "referrer_id" TEXT NOT NULL,
  "referred_id" TEXT NOT NULL,
  "referral_code" TEXT NOT NULL,
  "bonus_xp_awarded" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "referrals_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint on referred_id
CREATE UNIQUE INDEX IF NOT EXISTS "referrals_referred_id_key" ON "referrals"("referred_id");

-- Create indexes for referrals
CREATE INDEX IF NOT EXISTS "referrals_referrer_id_idx" ON "referrals"("referrer_id");
CREATE INDEX IF NOT EXISTS "referrals_referral_code_idx" ON "referrals"("referral_code");

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS "withdrawals" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "points_deducted" INTEGER NOT NULL,
  "payment_method" TEXT NOT NULL,
  "payment_details" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processed_at" TIMESTAMP(3),
  "admin_notes" TEXT,
  "transaction_id" TEXT,
  CONSTRAINT "withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for withdrawals
CREATE INDEX IF NOT EXISTS "withdrawals_user_id_idx" ON "withdrawals"("user_id");
CREATE INDEX IF NOT EXISTS "withdrawals_status_idx" ON "withdrawals"("status");
