import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get about page sections
export async function GET() {
  try {
    // Get sections (vision, mission)
    const sectionsResult = await pool.query(
      'SELECT * FROM about_sections WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get goals
    const goalsResult = await pool.query(
      'SELECT * FROM about_goals WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get values
    let valuesResult: any = { rows: [] };
    try {
      valuesResult = await pool.query(
        'SELECT * FROM about_values WHERE is_active = true ORDER BY order_index ASC'
      );
    } catch (error: any) {
      // If table doesn't exist, continue without values
      if (error.code !== '42P01') {
        console.error('Error fetching about values:', error);
      }
    }

    return NextResponse.json({
      sections: sectionsResult.rows,
      goals: goalsResult.rows,
      values: valuesResult.rows || [],
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public about sections:', error);
    
    // If tables don't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        sections: [],
        goals: [],
        values: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders,
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب أقسام صفحة "من نحن"' },
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
