import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get offices/branches content
export async function GET() {
  try {
    // Get page content
    let pageContent: any[] = [];
    try {
      const contentResult = await pool.query(
        'SELECT * FROM offices_branches_page_content WHERE is_active = true ORDER BY order_index ASC'
      );
      pageContent = contentResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching offices/branches page content:', error);
      }
    }
    
    // Get offices/branches
    let offices: any[] = [];
    try {
      const officesResult = await pool.query(
        `SELECT * FROM offices_branches 
         WHERE is_active = true 
         ORDER BY order_index ASC, city ASC, name ASC`
      );
      offices = officesResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching offices/branches:', error);
      }
    }

    return NextResponse.json({
      content: pageContent,
      offices: offices,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public offices/branches:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى المكاتب والفروع', content: [], offices: [] },
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
