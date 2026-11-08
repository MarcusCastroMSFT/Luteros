import { NextRequest, NextResponse, connection } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { getCourseSales } from '@/lib/course-sales.server'

// Sales and revenue are admin-only: instructors can open the courses page but never see money.
export async function GET(request: NextRequest) {
  await connection()

  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    return NextResponse.json({ success: true, data: await getCourseSales() })
  } catch (error) {
    console.error('Course sales API error:', error)
    return NextResponse.json({ success: false, error: 'Falha ao carregar as vendas.' }, { status: 500 })
  }
}
