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
import { sampleCommunityPosts } from '../data/community'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')

// Use DIRECT_URL for seeding (bypasses connection pooler)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Parse date (e.g., "15 Setembro 2025" -> Date)
function parseDate(dateStr: string): Date {
  const monthMap: Record<string, number> = {
    'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3,
    'Maio': 4, 'Junho': 5, 'Julho': 6, 'Agosto': 7,
    'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
  }
  
  const dateParts = dateStr.split(' ')
  const day = parseInt(dateParts[0])
  const month = monthMap[dateParts[1]]
  const year = parseInt(dateParts[2])
  
  return new Date(year, month, day)
}

async function main() {
  console.log('🌱 Starting community posts seed...')
  
  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    throw new Error('DATABASE_URL or DIRECT_URL environment variable is not set.')
  }
  
  console.log('✅ Database connection configured')

  try {
    // Get the first few users to use as authors
    const users = await prisma.user_profiles.findMany({
      select: { id: true },
      take: 10
    })

    if (users.length === 0) {
      throw new Error('No users found in database. Please create users first.')
    }

    console.log(`📝 Found ${users.length} users`)
    console.log(`📚 Seeding ${sampleCommunityPosts.length} community posts...`)

    let createdPostsCount = 0
    let createdRepliesCount = 0
    let skippedCount = 0

    for (const post of sampleCommunityPosts) {
      try {
        // Check if post already exists (by title and content hash)
        const existingPost = await prisma.community_posts.findFirst({
          where: { 
            title: post.title,
          }
        })

        if (existingPost) {
          console.log(`⏭️  Skipping existing post: ${post.title}`)
          skippedCount++
          continue
        }

        // Map status
        const statusMap: Record<string, string> = {
          'Ativo': 'ACTIVE',
          'Fechado': 'CLOSED',
          'Moderação': 'MODERATION',
        }

        // Assign a random user from available users
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const createdAt = parseDate(post.createdDate)
        const lastReplyAt = post.lastReply ? parseDate(post.lastReply) : null

        // Create the post
        const newPost = await prisma.community_posts.create({
          data: {
            title: post.title,
            content: post.content,
            userId: randomUser.id,
            category: post.category,
            subcategory: post.subcategory || null,
            tags: post.tags,
            isAnonymous: post.isAnonymous,
            status: statusMap[post.status] || 'ACTIVE',
            isReported: post.isReported,
            isPinned: false,
            viewCount: Math.floor(Math.random() * 100) + 10,
            replyCount: post.repliesCount,
            likeCount: post.likes,
            createdAt,
            updatedAt: createdAt,
            lastReplyAt,
          }
        })

        console.log(`✅ Created post: ${post.title}`)
        createdPostsCount++

        // Create replies for this post
        if (post.replies && post.replies.length > 0) {
          for (const reply of post.replies) {
            try {
              const replyUser = users[Math.floor(Math.random() * users.length)]
              const replyCreatedAt = parseDate(reply.createdDate)

              await prisma.community_replies.create({
                data: {
                  postId: newPost.id,
                  userId: replyUser.id,
                  content: reply.content,
                  isAnonymous: reply.isAnonymous,
                  isReported: reply.isReported,
                  likeCount: reply.likes,
                  createdAt: replyCreatedAt,
                  updatedAt: replyCreatedAt,
                }
              })
              createdRepliesCount++
            } catch (replyError) {
              console.error(`❌ Error creating reply for post ${post.title}:`, replyError)
            }
          }
        }

      } catch (error) {
        console.error(`❌ Error creating post ${post.title}:`, error)
      }
    }

    console.log('\n📊 Seed Summary:')
    console.log(`   Posts created: ${createdPostsCount}`)
    console.log(`   Replies created: ${createdRepliesCount}`)
    console.log(`   Posts skipped (already exist): ${skippedCount}`)
    console.log('\n✨ Community posts seed completed!')

  } catch (error) {
    console.error('❌ Seed error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
