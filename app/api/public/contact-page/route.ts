import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get contact page content
export async function GET() {
  try {
    // Get content sections
    const contentResult = await pool.query(
      'SELECT * FROM contact_page_content WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get contact info
    const infoResult = await pool.query(
      'SELECT * FROM contact_info WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get working hours
    const hoursResult = await pool.query(
      'SELECT * FROM contact_working_hours ORDER BY order_index ASC'
    );

    return NextResponse.json({
      content: contentResult.rows,
      contactInfo: infoResult.rows,
      workingHours: hoursResult.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public contact page content:', error);
    
    // If tables don't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        content: [],
        contactInfo: [],
        workingHours: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders,
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى صفحة التواصل' },
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
