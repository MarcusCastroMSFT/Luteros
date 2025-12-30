import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  // Use connection pooling with Supavisor (DATABASE_URL with pgbouncer=true)
  // Connection limit is set in DATABASE_URL for serverless/Next.js
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 1, // Limit connections for Next.js (matches connection_limit in URL)
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
