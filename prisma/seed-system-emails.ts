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
import { systemEmailTemplates } from '../data/system-email-templates'

// Use require for PrismaClient to avoid import issues in some environments
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')

// Use DIRECT_URL for seeding (bypasses connection pooler)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Templates that were migrated to Supabase Auth and should be removed from DB
const DEPRECATED_TEMPLATE_CODES = [
  'welcome',
  'email_verification', 
  'password_reset',
  'password_changed',
  'email_changed',
]

async function main() {
  console.log('🌱 Starting system email templates seed...')
  
  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    throw new Error('DATABASE_URL or DIRECT_URL environment variable is not set.')
  }
  
  console.log('✅ Database connection configured')
  
  // First, remove deprecated templates that are now handled by Supabase Auth
  console.log('\n🧹 Cleaning up deprecated templates (now handled by Supabase Auth)...')
  let deletedCount = 0
  
  for (const code of DEPRECATED_TEMPLATE_CODES) {
    try {
      const existing = await prisma.system_email_templates.findUnique({
        where: { code }
      })
      
      if (existing) {
        await prisma.system_email_templates.delete({
          where: { code }
        })
        console.log(`🗑️  Removed deprecated template: ${code}`)
        deletedCount++
      }
    } catch (error) {
      // Ignore if template doesn't exist
    }
  }
  
  if (deletedCount > 0) {
    console.log(`   Removed ${deletedCount} deprecated templates\n`)
  } else {
    console.log(`   No deprecated templates found\n`)
  }
  
  console.log(`📧 Seeding ${systemEmailTemplates.length} email templates...`)

  let createdCount = 0
  let updatedCount = 0
  let skippedCount = 0

  try {
    for (const template of systemEmailTemplates) {
      try {
        // Check if template already exists
        const existing = await prisma.system_email_templates.findUnique({
          where: { code: template.code }
        })

        if (existing) {
          // Update only if there's a newer version (based on content changes)
          const hasChanges = 
            existing.htmlContent !== template.htmlContent ||
            existing.subject !== template.subject ||
            existing.textContent !== template.textContent

          if (hasChanges) {
            // Only update if the template hasn't been customized by a user
            if (!existing.updatedById) {
              await prisma.system_email_templates.update({
                where: { code: template.code },
                data: {
                  name: template.name,
                  description: template.description,
                  category: template.category,
                  subject: template.subject,
                  previewText: template.previewText,
                  htmlContent: template.htmlContent,
                  textContent: template.textContent,
                  variables: template.variables,
                }
              })
              console.log(`🔄 Updated: ${template.name}`)
              updatedCount++
            } else {
              console.log(`⏭️  Skipping customized template: ${template.name}`)
              skippedCount++
            }
          } else {
            console.log(`⏭️  Skipping unchanged template: ${template.name}`)
            skippedCount++
          }
          continue
        }

        // Create new template
        await prisma.system_email_templates.create({
          data: {
            code: template.code,
            name: template.name,
            description: template.description,
            category: template.category,
            subject: template.subject,
            previewText: template.previewText,
            htmlContent: template.htmlContent,
            textContent: template.textContent,
            variables: template.variables,
            isActive: true,
          }
        })

        console.log(`✅ Created: ${template.name}`)
        createdCount++
      } catch (error) {
        console.error(`❌ Error processing template "${template.name}":`, error)
      }
    }

    console.log('\n✨ Seed completed!')
    console.log(`📊 Summary:`)
    console.log(`   - Removed: ${deletedCount} deprecated templates`)
    console.log(`   - Created: ${createdCount} templates`)
    console.log(`   - Updated: ${updatedCount} templates`)
    console.log(`   - Skipped: ${skippedCount} templates`)
    console.log(`   - Total active: ${systemEmailTemplates.length} templates`)

  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
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
