import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from '../lib/db/schema'

const LUTTEROS_EMAIL = 'system@lutteros.com'
const LUTTEROS_NAME = 'Lutteros'
const LUTTEROS_IMAGE = '/images/logo/lutteros-logo.svg'

async function main() {
  const normalized = LUTTEROS_EMAIL.toLowerCase()

  const existing = await db
    .select({ id: users.id, email: users.email, role: users.role, name: users.name, image: users.image })
    .from(users)
    .where(sql`lower(${users.email}) = ${normalized}`)
    .limit(1)
    .then((r) => r[0] ?? null)

  if (existing) {
    console.log(`Lutteros user already exists (id=${existing.id}, role=${existing.role}). Ensuring fields are up to date.`)
    const [updated] = await db
      .update(users)
      .set({
        name: LUTTEROS_NAME,
        displayName: LUTTEROS_NAME,
        image: LUTTEROS_IMAGE,
        role: 'ADMIN',
        updatedAt: new Date(),
      })
      .where(sql`lower(${users.email}) = ${normalized}`)
      .returning({ id: users.id, email: users.email, role: users.role, name: users.name, image: users.image })
    console.log('Updated user:', updated)
    return
  }

  const [created] = await db
    .insert(users)
    .values({
      name: LUTTEROS_NAME,
      displayName: LUTTEROS_NAME,
      email: LUTTEROS_EMAIL,
      emailVerified: new Date(),
      image: LUTTEROS_IMAGE,
      role: 'ADMIN',
    })
    .returning({ id: users.id, email: users.email, role: users.role, name: users.name, image: users.image })

  console.log('Created Lutteros system user:', created)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => process.exit(0))
