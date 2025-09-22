import { NextRequest, NextResponse } from 'next/server'

// This is a demo API route showing how to handle server-side data fetching
// You would replace this with your actual database queries

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Extract pagination parameters
  const page = parseInt(searchParams.get('page') || '0')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')
  const search = searchParams.get('search') || ''
  
  // Extract sorting parameters
  const sortBy = searchParams.get('sortBy') || 'id'
  const sortOrder = searchParams.get('sortOrder') || 'asc'
  
  // Extract column filters
  const filters: Record<string, string> = {}
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter_')) {
      const filterKey = key.replace('filter_', '')
      filters[filterKey] = value
    }
  }
  
  try {
    // Simulate database query delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // This is where you would perform your actual database query
    // Example with Prisma:
    /*
    const whereCondition = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      }),
      ...(filters.status && { status: filters.status }),
      ...(filters.role && { role: filters.role }),
    }
    
    const [data, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        orderBy: { [sortBy]: sortOrder },
        skip: page * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where: whereCondition })
    ])
    */
    
    // For demo purposes, we'll use mock data
    const mockUsers = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      profileImg: `/avatars/user-${i + 1}.jpg`,
      status: ['Ativo', 'Inativo', 'Pendente', 'Suspenso'][i % 4],
      role: ['Usuário', 'Editor', 'Moderador', 'Administrador', 'Premium'][i % 5],
    }))
    
    // Apply search filter
    let filteredUsers = mockUsers
    if (search) {
      filteredUsers = mockUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filteredUsers = filteredUsers.filter(user => 
          user[key as keyof typeof user]?.toString().toLowerCase() === value.toLowerCase()
        )
      }
    })
    
    // Apply sorting
    filteredUsers.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] || ''
      const bVal = b[sortBy as keyof typeof b] || ''
      
      if (sortOrder === 'desc') {
        return bVal.toString().localeCompare(aVal.toString())
      }
      return aVal.toString().localeCompare(bVal.toString())
    })
    
    // Apply pagination
    const totalCount = filteredUsers.length
    const pageCount = Math.ceil(totalCount / pageSize)
    const paginatedUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize)
    
    return NextResponse.json({
      data: paginatedUsers,
      totalCount,
      pageCount,
      currentPage: page,
      pageSize,
    })
    
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
