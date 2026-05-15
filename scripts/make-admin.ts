import 'dotenv/config'
import { eq, sql } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from '../lib/db/schema'

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: tsx scripts/make-admin.ts <email>')
    process.exit(1)
  }

  const normalized = email.trim().toLowerCase()

  const existing = await db
    .select({ id: users.id, email: users.email, role: users.role, name: users.name })
    .from(users)
    .where(sql`lower(${users.email}) = ${normalized}`)
    .limit(1)
    .then((r) => r[0] ?? null)

  if (!existing) {
    console.error(`No user found with email "${normalized}".`)
    process.exit(1)
  }

  if (existing.role === 'ADMIN') {
    console.log(`User ${existing.email} (id=${existing.id}) is already ADMIN. Nothing to do.`)
    return
  }

  const [updated] = await db
    .update(users)
    .set({ role: 'ADMIN', updatedAt: new Date() })
    .where(eq(users.id, existing.id))
    .returning({ id: users.id, email: users.email, role: users.role, name: users.name })

  console.log('Updated user:')
  console.log(updated)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
