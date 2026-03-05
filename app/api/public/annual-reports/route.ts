import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get annual reports content
export async function GET() {
  try {
    // Get page content
    let pageContent: any[] = [];
    try {
      const contentResult = await pool.query(
        'SELECT * FROM annual_reports_page_content WHERE is_active = true ORDER BY order_index ASC'
      );
      pageContent = contentResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching annual reports page content:', error);
      }
    }
    
    // Get annual reports
    let reports: any[] = [];
    try {
      const reportsResult = await pool.query(
        `SELECT * FROM annual_reports 
         WHERE is_active = true 
         ORDER BY year DESC, order_index ASC`
      );
      reports = reportsResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching annual reports:', error);
      }
    }

    return NextResponse.json({
      content: pageContent,
      reports: reports,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public annual reports:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى التقارير السنوية', content: [], reports: [] },
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
