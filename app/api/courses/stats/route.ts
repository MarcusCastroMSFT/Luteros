import { NextRequest, NextResponse, connection } from 'next/server'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { getCourseStats } from '@/lib/courses'

export async function GET(request: NextRequest) {
  try {
    await connection()
    
    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    const stats = await getCourseStats()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Courses stats API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses stats' },
      { status: 500 }
    )
  }
}
