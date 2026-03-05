import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get homepage content
export async function GET() {
  try {
    // Get all sections
    const sectionsResult = await pool.query(
      'SELECT * FROM homepage_content WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Parse metadata JSON for sections
    const sections = sectionsResult.rows.map((section: any) => {
      if (section.metadata && typeof section.metadata === 'string') {
        try {
          section.metadata = JSON.parse(section.metadata);
        } catch (e) {
          section.metadata = null;
        }
      }
      return section;
    });
    
    // Get stats
    const statsResult = await pool.query(
      'SELECT * FROM homepage_stats WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get values
    const valuesResult = await pool.query(
      'SELECT * FROM homepage_values WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get partners
    const partnersResult = await pool.query(
      'SELECT * FROM homepage_partners WHERE is_active = true ORDER BY order_index ASC'
    );

    return NextResponse.json({
      sections: sections,
      stats: statsResult.rows,
      values: valuesResult.rows,
      partners: partnersResult.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public homepage content:', error);
    
    // If tables don't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        sections: [],
        stats: [],
        values: [],
        partners: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders,
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى الصفحة الرئيسية' },
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
