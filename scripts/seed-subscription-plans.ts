import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { subscriptionPlans } from '../lib/db/schema'

const PLANS = [
  {
    code: 'general-monthly',
    name: 'Plano Geral',
    description:
      'Acesso ilimitado a artigos, cursos e conteúdo exclusivo sobre saúde sexual e bem-estar para o público geral.',
    audience: 'general' as const,
    price: '39.90',
    currency: 'BRL',
    billingPeriod: 'monthly',
    isActive: true,
    sortOrder: 10,
  },
  {
    code: 'doctors-monthly',
    name: 'Plano Médicos e Especialistas',
    description:
      'Conteúdo clínico exclusivo para profissionais de saúde: protocolos clínicos, estudos de caso e artigos técnicos. Inclui também todo o conteúdo do plano Geral.',
    audience: 'doctors' as const,
    price: '59.90',
    currency: 'BRL',
    billingPeriod: 'monthly',
    isActive: true,
    sortOrder: 20,
  },
]

async function main() {
  for (const plan of PLANS) {
    const existing = await db
      .select({ id: subscriptionPlans.id })
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.code, plan.code))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (existing) {
      const [updated] = await db
        .update(subscriptionPlans)
        .set({ ...plan, updatedAt: new Date() })
        .where(eq(subscriptionPlans.code, plan.code))
        .returning({ id: subscriptionPlans.id, code: subscriptionPlans.code, name: subscriptionPlans.name })
      console.log(`Updated plan: ${updated.code} (${updated.id})`)
    } else {
      const [created] = await db
        .insert(subscriptionPlans)
        .values(plan)
        .returning({ id: subscriptionPlans.id, code: subscriptionPlans.code, name: subscriptionPlans.name })
      console.log(`Created plan: ${created.code} (${created.id})`)
    }
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => process.exit(0))
