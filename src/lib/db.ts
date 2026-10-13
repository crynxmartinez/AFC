import { PrismaClient } from '@prisma/client';
const globalDb = globalThis as unknown as { afcDb?: PrismaClient };
export const db = globalDb.afcDb ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalDb.afcDb = db;
