import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  }).$extends(withAccelerate())

  // Add connection retry middleware
  return client.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        let lastError: any
        
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            return await query(args)
          } catch (error: any) {
            lastError = error
            
            // Only retry on connection/timeout errors
            const isRetryable = 
              error.code === 'P1001' || // Can't reach database server
              error.code === 'P1002' || // Database server timeout
              error.code === 'P1008' || // Operations timed out
              error.code === 'P1017' || // Server closed connection
              error.message?.includes('fetch failed') ||
              error.message?.includes('ECONNREFUSED') ||
              error.message?.includes('ETIMEDOUT')
            
            if (!isRetryable || attempt === MAX_RETRIES) {
              console.error(`Prisma ${operation} on ${model} failed after ${attempt} attempts:`, error)
              throw error
            }
            
            console.warn(`Prisma ${operation} on ${model} failed (attempt ${attempt}/${MAX_RETRIES}), retrying...`)
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt))
          }
        }
        
        throw lastError
      },
    },
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
