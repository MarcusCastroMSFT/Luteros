import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from '../lib/db/schema'

async function main() {
  const affected = await db
    .update(users)
    .set({ email: sql`lower(${users.email})`, updatedAt: new Date() })
    .where(sql`${users.email} <> lower(${users.email})`)
    .returning({ id: users.id, email: users.email })

  if (affected.length === 0) {
    console.log('No emails needed normalization.')
    return
  }
  console.log(`Normalized ${affected.length} email(s):`)
  for (const u of affected) {
    console.log(`  - ${u.email} (id: ${u.id})`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
