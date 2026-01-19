import { config } from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'

// Load environment variables - try multiple locations
const envPaths = [
  resolve(process.cwd(), '.env.local'),
  resolve(process.cwd(), '.env'),
  resolve(__dirname, '../.env.local'),
  resolve(__dirname, '../.env'),
]

for (const path of envPaths) {
  if (existsSync(path)) {
    console.log(`📂 Loading env from: ${path}`)
    config({ path })
    break
  }
}

import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { sampleArticles } from '../data/articles'

// Use require for PrismaClient to avoid import issues in some environments
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')

// Use DIRECT_URL for seeding (bypasses connection pooler)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seed...')
  
  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    throw new Error('DATABASE_URL or DIRECT_URL environment variable is not set.')
  }
  
  console.log('✅ Database connection configured')

  try {
    // First, get the first user to use as author
    const firstUser = await prisma.userProfile.findFirst({
      select: { id: true }
    })

    if (!firstUser) {
      throw new Error('No users found in database. Please create a user first.')
    }

    console.log(`📝 Found user: ${firstUser.id}`)
    console.log(`📚 Seeding ${sampleArticles.length} articles...`)

    // Create articles
    let createdCount = 0
    let skippedCount = 0

    for (const article of sampleArticles) {
      try {
        // Check if article already exists
        const existing = await prisma.blogArticle.findUnique({
          where: { slug: article.slug }
        })

        if (existing) {
          console.log(`⏭️  Skipping existing article: ${article.title}`)
          skippedCount++
          continue
        }

        // Parse read time (e.g., "8 min de leitura" -> 8)
        const readTimeMatch = article.readTime.match(/(\d+)/)
        const readTime = readTimeMatch ? parseInt(readTimeMatch[1]) : 5

        // Parse date (e.g., "15 Setembro 2024" -> Date)
        const monthMap: Record<string, number> = {
          'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3,
          'Maio': 4, 'Junho': 5, 'Julho': 6, 'Agosto': 7,
          'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
        }
        
        const dateParts = article.date.split(' ')
        const day = parseInt(dateParts[0])
        const month = monthMap[dateParts[1]]
        const year = parseInt(dateParts[2])
        const publishedAt = new Date(year, month, day)

        // Create the article
        await prisma.blogArticle.create({
          data: {
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            content: generateContent(article.excerpt),
            image: article.image,
            coverImage: article.image,
            authorId: firstUser.id,
            category: article.category,
            tags: [article.category, 'Saúde Sexual', 'Educação'],
            readTime,
            commentCount: article.commentCount || 0,
            likeCount: Math.floor(Math.random() * 100),
            isPublished: Math.random() > 0.2, // 80% published, 20% draft
            publishedAt,
            metaTitle: article.title,
            metaDescription: article.excerpt,
          }
        })

        console.log(`✅ Created: ${article.title}`)
        createdCount++
      } catch (error) {
        console.error(`❌ Error creating article "${article.title}":`, error)
      }
    }

    console.log('\n✨ Seed completed!')
    console.log(`📊 Summary:`)
    console.log(`   - Created: ${createdCount} articles`)
    console.log(`   - Skipped: ${skippedCount} articles`)
    console.log(`   - Total: ${sampleArticles.length} articles`)

  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

function generateContent(excerpt: string): string {
  return `
<h2>Introdução</h2>
<p>${excerpt}</p>

<h2>Por que isso é importante?</h2>
<p>A compreensão adequada deste tema é fundamental para promover uma sociedade mais saudável e informada. Com base em pesquisas científicas e experiências práticas, este artigo explora os principais aspectos que você precisa conhecer.</p>

<h2>Principais pontos a considerar</h2>
<ul>
  <li>Informação baseada em evidências científicas</li>
  <li>Orientações práticas para o dia a dia</li>
  <li>Recursos e apoio profissional disponíveis</li>
  <li>Desmistificação de conceitos errôneos comuns</li>
</ul>

<h2>Como aplicar na prática</h2>
<p>O conhecimento teórico só é valioso quando aplicado na prática. Aqui estão algumas estratégias concretas que você pode implementar imediatamente para melhorar seu bem-estar e qualidade de vida.</p>

<h2>Conclusão</h2>
<p>A educação continuada e o acesso a informações confiáveis são essenciais. Continue explorando nossos recursos e não hesite em buscar orientação profissional quando necessário.</p>
  `.trim()
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
