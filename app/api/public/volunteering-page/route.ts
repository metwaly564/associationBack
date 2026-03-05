import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get volunteering page content
export async function GET() {
  try {
    // Get content sections
    const contentResult = await pool.query(
      'SELECT * FROM volunteering_page_content WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get benefits
    const benefitsResult = await pool.query(
      'SELECT * FROM volunteering_benefits WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get opportunities
    const opportunitiesResult = await pool.query(
      'SELECT * FROM volunteering_opportunities WHERE is_active = true ORDER BY order_index ASC'
    );

    return NextResponse.json({
      content: contentResult.rows,
      benefits: benefitsResult.rows,
      opportunities: opportunitiesResult.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public volunteering page content:', error);
    
    // If tables don't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        content: [],
        benefits: [],
        opportunities: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders,
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى صفحة التطوع' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders,
        },
      }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
