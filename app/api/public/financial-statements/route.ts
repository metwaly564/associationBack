import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get financial statements
export async function GET() {
  try {
    // Get financial statements
    const statementsResult = await pool.query(
      'SELECT id, title, description, file_url, file_name, year, type, created_at FROM financial_statements WHERE is_active = true ORDER BY year DESC, order_index ASC, created_at DESC'
    );
    
    // Get page content
    let pageContent: any[] = [];
    try {
      const contentResult = await pool.query(
        'SELECT * FROM financial_statements_page_content WHERE is_active = true ORDER BY order_index ASC'
      );
      pageContent = contentResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching financial statements page content:', error);
      }
    }

    return NextResponse.json({
      statements: statementsResult.rows,
      content: pageContent,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public financial statements:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب القوائم المالية', statements: [], content: [] },
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
