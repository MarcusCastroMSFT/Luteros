import { NextRequest, NextResponse } from 'next/server';
import { sampleSpecialists } from '@/data/specialists';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Find the specialist by slug
    const specialist = sampleSpecialists.find(s => s.slug === slug);
    
    if (!specialist) {
      return NextResponse.json(
        { success: false, error: 'Specialist not found' },
        { status: 404 }
      );
    }

    // Find related specialists (same specialties, excluding current one)
    const relatedSpecialists = sampleSpecialists
      .filter(s => 
        s.id !== specialist.id && 
        s.specialties.some(specialty => specialist.specialties.includes(specialty))
      )
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      data: {
        specialist,
        relatedSpecialists
      }
    });
  } catch (error) {
    console.error('Error fetching specialist:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
