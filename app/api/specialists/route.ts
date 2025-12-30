import { NextRequest, NextResponse } from 'next/server';
import { sampleSpecialists } from '@/data/specialists';

// This route handles both GET requests for specialists data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const specialty = searchParams.get('specialty') || 'all';
    const search = searchParams.get('search') || '';

    // Filter specialists
    let filteredSpecialists = sampleSpecialists;

    // Filter by specialty
    if (specialty && specialty !== 'all') {
      filteredSpecialists = filteredSpecialists.filter(specialist =>
        specialist.specialties.some(s => 
          s.toLowerCase().includes(specialty.toLowerCase())
        )
      );
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSpecialists = filteredSpecialists.filter(specialist =>
        specialist.name.toLowerCase().includes(searchLower) ||
        specialist.profession.toLowerCase().includes(searchLower) ||
        specialist.bio.toLowerCase().includes(searchLower) ||
        specialist.specialties.some(s => s.toLowerCase().includes(searchLower))
      );
    }

    // Calculate pagination
    const total = filteredSpecialists.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const specialists = filteredSpecialists.slice(offset, offset + limit);

    // Get all unique specialties for filter options
    const allSpecialties = Array.from(
      new Set(sampleSpecialists.flatMap(s => s.specialties))
    ).sort();

    const response = {
      specialists,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      specialties: allSpecialties,
      filters: {
        specialty,
        search,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching specialists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialists' },
      { status: 500 }
    );
  }
}
