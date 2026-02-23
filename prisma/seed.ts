import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DIRECT_DATABASE_URL || 'postgres://326f8a42d37fe3cea03ec2fb0b3844d52f7efacf7bca79d5f887562dfd4da554:sk_FKnU1tkejNr7ySnVaF1Et@db.prisma.io:5432/postgres?sslmode=require'

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Seed Level Configuration (100 levels)
  console.log('📊 Seeding level configuration...')
  const levels = []
  for (let level = 1; level <= 100; level++) {
    const xpRequired = Math.floor(100 * Math.pow(level, 1.5))
    let title = 'Novice'
    
    if (level >= 80) title = 'Legend'
    else if (level >= 60) title = 'Master'
    else if (level >= 40) title = 'Expert'
    else if (level >= 20) title = 'Advanced'
    else if (level >= 10) title = 'Intermediate'
    
    levels.push({
      level,
      xpRequired,
      title: `${title} ${level}`,
    })
  }

  await prisma.levelConfig.createMany({
    data: levels,
    skipDuplicates: true,
  })
  console.log(`✅ Created ${levels.length} level configurations`)

  // Seed XP Rewards
  console.log('🎁 Seeding XP rewards...')
  const xpRewards = [
    {
      actionType: 'daily_login',
      xpAmount: 10,
      description: 'Daily login bonus',
      enabled: true,
    },
    {
      actionType: 'profile_complete',
      xpAmount: 50,
      description: 'Complete your profile',
      enabled: true,
    },
    {
      actionType: 'first_entry',
      xpAmount: 100,
      description: 'Submit your first contest entry',
      enabled: true,
    },
    {
      actionType: 'entry_approved',
      xpAmount: 50,
      description: 'Entry approved by admin',
      enabled: true,
    },
    {
      actionType: 'receive_reaction',
      xpAmount: 5,
      description: 'Receive a reaction on your entry',
      enabled: true,
    },
    {
      actionType: 'receive_comment',
      xpAmount: 3,
      description: 'Receive a comment on your entry',
      enabled: true,
    },
    {
      actionType: 'share_entry',
      xpAmount: 10,
      description: 'Share an entry on social media (once per day)',
      enabled: true,
    },
    {
      actionType: 'contest_winner_1st',
      xpAmount: 200,
      description: 'Win 1st place in a contest',
      enabled: true,
    },
    {
      actionType: 'contest_winner_2nd',
      xpAmount: 150,
      description: 'Win 2nd place in a contest',
      enabled: true,
    },
    {
      actionType: 'contest_winner_3rd',
      xpAmount: 100,
      description: 'Win 3rd place in a contest',
      enabled: true,
    },
  ]

  await prisma.xpReward.createMany({
    data: xpRewards,
    skipDuplicates: true,
  })
  console.log(`✅ Created ${xpRewards.length} XP reward configurations`)

  // Seed Level Rewards
  console.log('🏆 Seeding level rewards...')
  const levelRewards = [
    {
      level: 5,
      rewardType: 'badge',
      rewardValue: 'Rising Star',
      description: 'Reached level 5',
      autoGrant: true,
    },
    {
      level: 10,
      rewardType: 'points',
      rewardValue: '50',
      description: '50 bonus points',
      autoGrant: true,
    },
    {
      level: 20,
      rewardType: 'badge',
      rewardValue: 'Dedicated Artist',
      description: 'Reached level 20',
      autoGrant: true,
    },
    {
      level: 50,
      rewardType: 'points',
      rewardValue: '200',
      description: '200 bonus points',
      autoGrant: true,
    },
    {
      level: 100,
      rewardType: 'badge',
      rewardValue: 'Legendary Creator',
      description: 'Reached max level',
      autoGrant: true,
    },
  ]

  await prisma.levelReward.createMany({
    data: levelRewards,
    skipDuplicates: true,
  })
  console.log(`✅ Created ${levelRewards.length} level reward configurations`)

  console.log('✨ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
