import { NextRequest, NextResponse } from 'next/server';
import { sampleCourses } from '@/data/courses';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Extract query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const level = searchParams.get('level');

  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter courses by category
    let filteredCourses = [...sampleCourses];
    
    if (category && category !== 'Todos') {
      filteredCourses = filteredCourses.filter(course => 
        course.category === category
      );
    }

    // Filter by level
    if (level && level !== 'Todos') {
      filteredCourses = filteredCourses.filter(course => 
        course.level === level
      );
    }

    // Filter by search term
    if (search) {
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase()) ||
        course.instructor.name.toLowerCase().includes(search.toLowerCase()) ||
        course.category.toLowerCase().includes(search.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Sort by rating (highest first), then by studentsCount
    filteredCourses.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.studentsCount - a.studentsCount;
    });

    // Apply pagination
    const totalCourses = filteredCourses.length;
    const totalPages = Math.ceil(totalCourses / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    // Get unique categories and levels for filters
    const categories = ['Todos', ...Array.from(new Set(sampleCourses.map(course => course.category)))];
    const levels = ['Todos', ...Array.from(new Set(sampleCourses.map(course => course.level)))];

    return NextResponse.json({
      success: true,
      data: {
        courses: paginatedCourses,
        pagination: {
          currentPage: page,
          totalPages,
          totalCourses,
          coursesPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        categories,
        levels,
      },
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch courses',
        data: null,
      },
      { status: 500 }
    );
  }
}
