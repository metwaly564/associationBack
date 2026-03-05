import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get team page content
export async function GET() {
  try {
    // Get content sections
    const contentResult = await pool.query(
      'SELECT * FROM team_page_content WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get hero images
    const heroImagesResult = await pool.query(
      'SELECT * FROM team_page_hero_images WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get executive director info
    const executiveResult = await pool.query(
      'SELECT * FROM team_page_executive_director WHERE is_active = true LIMIT 1'
    );

    return NextResponse.json({
      content: contentResult.rows,
      heroImages: heroImagesResult.rows,
      executiveDirector: executiveResult.rows[0] || null,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public team page content:', error);
    
    // If tables don't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        content: [],
        heroImages: [],
        executiveDirector: null,
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders,
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى صفحة فريق العمل' },
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
