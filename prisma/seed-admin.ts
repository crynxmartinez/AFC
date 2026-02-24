import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_DATABASE_URL!,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash('Rasengan12@', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@afc.com' },
    update: {
      role: 'admin',
      passwordHash,
    },
    create: {
      email: 'admin@afc.com',
      username: 'admin',
      passwordHash,
      role: 'admin',
      displayName: 'Admin',
    },
  })

  console.log('Admin user created:', admin.id, admin.email, admin.role)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
