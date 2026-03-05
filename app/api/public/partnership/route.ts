import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get partnership content
export async function GET() {
  try {
    // Get page content
    let pageContent: any[] = [];
    try {
      const contentResult = await pool.query(
        'SELECT * FROM partnership_page_content WHERE is_active = true ORDER BY order_index ASC'
      );
      pageContent = contentResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching partnership page content:', error);
      }
    }
    
    // Get partnership types
    let types: any[] = [];
    try {
      const typesResult = await pool.query(
        `SELECT * FROM partnership_types 
         WHERE is_active = true 
         ORDER BY order_index ASC, title ASC`
      );
      types = typesResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching partnership types:', error);
      }
    }

    return NextResponse.json({
      content: pageContent,
      types: types,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public partnership:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى الشراكة', content: [], types: [] },
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
