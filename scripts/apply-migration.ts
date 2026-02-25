// Manual migration script for production database
// Run this with: npx tsx scripts/apply-migration.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database migration...')

  try {
    // Add referralCode column to users table
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_code" TEXT UNIQUE;
    `)
    console.log('✓ Added referral_code column to users table')

    // Create referrals table
    await prisma.$executeRawUnsafe(`
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
    `)
    console.log('✓ Created referrals table')

    // Create unique constraint and indexes for referrals
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "referrals_referred_id_key" ON "referrals"("referred_id");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "referrals_referrer_id_idx" ON "referrals"("referrer_id");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "referrals_referral_code_idx" ON "referrals"("referral_code");
    `)
    console.log('✓ Created indexes for referrals table')

    // Create withdrawals table
    await prisma.$executeRawUnsafe(`
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
    `)
    console.log('✓ Created withdrawals table')

    // Create indexes for withdrawals
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "withdrawals_user_id_idx" ON "withdrawals"("user_id");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "withdrawals_status_idx" ON "withdrawals"("status");
    `)
    console.log('✓ Created indexes for withdrawals table')

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
