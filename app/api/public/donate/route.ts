import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get donate content
export async function GET() {
  try {
    // Get page content
    let pageContent: any[] = [];
    try {
      const contentResult = await pool.query(
        'SELECT * FROM donate_page_content WHERE is_active = true ORDER BY order_index ASC'
      );
      pageContent = contentResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching donate page content:', error);
      }
    }
    
    // Get donation methods
    let methods: any[] = [];
    try {
      const methodsResult = await pool.query(
        `SELECT * FROM donation_methods 
         WHERE is_active = true 
         ORDER BY order_index ASC, name ASC`
      );
      methods = methodsResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching donation methods:', error);
      }
    }

    return NextResponse.json({
      content: pageContent,
      methods: methods,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public donate:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى التبرع', content: [], methods: [] },
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
