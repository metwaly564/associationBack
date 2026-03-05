import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get policies
export async function GET() {
  try {
    // Get policies
    const policiesResult = await pool.query(
      'SELECT id, title, description, file_url, created_at FROM policies ORDER BY created_at DESC'
    );
    
    // Get page content
    let pageContent: any[] = [];
    try {
      const contentResult = await pool.query(
        'SELECT * FROM policies_page_content WHERE is_active = true ORDER BY order_index ASC'
      );
      pageContent = contentResult.rows;
    } catch (error: any) {
      // If table doesn't exist, continue without content
      if (error.code !== '42P01') {
        console.error('Error fetching policies page content:', error);
      }
    }

    return NextResponse.json({
      policies: policiesResult.rows,
      content: pageContent,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public policies:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب السياسات', policies: [], content: [] },
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
