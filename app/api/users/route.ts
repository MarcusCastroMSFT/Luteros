import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Extract pagination parameters
  const page = parseInt(searchParams.get('page') || '0')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')
  const search = searchParams.get('search') || ''
  
  // Extract sorting parameters
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
  
  // Extract column filters
  const filters: Record<string, string> = {}
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter_')) {
      const filterKey = key.replace('filter_', '')
      filters[filterKey] = value
    }
  }
  
  try {
    // Verify authentication (with caching)
    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) {
      return authUser // Return 401 response
    }

    // Build where condition for Prisma query
    const whereCondition: Record<string, unknown> = {}
    
    // Apply search filter
    if (search) {
      whereCondition.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    // Build orderBy condition
    const orderByField = sortBy === 'name' ? 'fullName' : sortBy
    const orderBy: Record<string, unknown> = { [orderByField]: sortOrder }
    
    // Execute database queries in parallel for performance
    const [users, totalCount] = await Promise.all([
      prisma.userProfile.findMany({
        where: whereCondition,
        orderBy,
        skip: page * pageSize,
        take: pageSize,
        select: {
          id: true,
          fullName: true,
          displayName: true,
          avatar: true,
          title: true,
          company: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        }
      }),
      prisma.userProfile.count({ where: whereCondition })
    ])
    
    const pageCount = Math.ceil(totalCount / pageSize)
    
    // Fetch emails from Supabase Auth using Admin API
    // Regular client cannot access auth.users table - must use admin API
    const supabaseAdmin = createAdminClient()
    const userIds = users.map((u: { id: string }) => u.id)
    
    // Use Promise.all to fetch all user emails in parallel
    const emailPromises = userIds.map(async (userId: string) => {
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)
      if (error) {
        console.error(`Error fetching user ${userId}:`, error)
        return [userId, null]
      }
      return [userId, data.user?.email]
    })
    
    const emailResults = await Promise.all(emailPromises)
    
    // Create a map for quick lookup
    const emailMap = new Map(emailResults as [string, string | null][])
    
    // Fetch roles for all users
    const roleAssignments = await prisma.userRoleAssignment.findMany({
      where: {
        userId: {
          in: userIds
        }
      },
      select: {
        userId: true,
        role: true
      }
    })
    
    // Create a map for quick role lookup
    const roleMap = new Map(roleAssignments.map((r: { userId: string; role: string }) => [r.userId, r.role]))
    
    // Role label mapping
    const roleLabelMap: Record<string, string> = {
      'ADMIN': 'Administrador',
      'INSTRUCTOR': 'Instrutor',
      'STUDENT': 'Estudante'
    }
    
    // Define type for user from Prisma query
    type UserWithProfile = {
      id: string
      displayName: string | null
      fullName: string | null
      avatar: string | null
      lastLoginAt: Date | null
    }

    // Map database results to frontend format
    const formattedUsers = users.map((user: UserWithProfile) => {
      const userRole = roleMap.get(user.id) || 'STUDENT'
      return {
        id: user.id,
        name: user.displayName || user.fullName || 'No Name',
        username: user.displayName || user.fullName?.split(' ')[0] || 'user',
        email: emailMap.get(user.id) || 'N/A',
        profileImg: user.avatar || null,
        status: user.lastLoginAt ? 'Ativo' : 'Inativo',
        role: roleLabelMap[userRole] || 'Usuário',
      }
    })
    
    return NextResponse.json({
      data: formattedUsers,
      totalCount,
      pageCount,
      currentPage: page,
      pageSize,
    })
    
  } catch (error) {
    console.error('Error fetching users:', error)
    
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
