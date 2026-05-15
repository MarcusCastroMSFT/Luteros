import 'dotenv/config'
import { db } from '../lib/db'
import { users } from '../lib/db/schema'

async function main() {
  const all = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role, createdAt: users.createdAt })
    .from(users)
  console.log(`Found ${all.length} user(s):`)
  for (const u of all) {
    console.log(`  - [${u.role}] ${u.email}  (name: ${u.name ?? '-'}, id: ${u.id})`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
