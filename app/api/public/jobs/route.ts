import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get jobs content
export async function GET() {
  try {
    // Get page content
    let pageContent: any[] = [];
    try {
      const contentResult = await pool.query(
        'SELECT * FROM jobs_page_content WHERE is_active = true ORDER BY order_index ASC'
      );
      pageContent = contentResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching jobs page content:', error);
      }
    }
    
    // Get jobs
    let jobs: any[] = [];
    try {
      const jobsResult = await pool.query(
        `SELECT * FROM jobs 
         WHERE is_active = true 
         ORDER BY order_index ASC, created_at DESC`
      );
      jobs = jobsResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching jobs:', error);
      }
    }

    return NextResponse.json({
      content: pageContent,
      jobs: jobs,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public jobs:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى الوظائف', content: [], jobs: [] },
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
