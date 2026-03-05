import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get operational budget content
export async function GET() {
  try {
    // Get page content
    let pageContent: any[] = [];
    try {
      const contentResult = await pool.query(
        'SELECT * FROM operational_budget_page_content WHERE is_active = true ORDER BY order_index ASC'
      );
      pageContent = contentResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching operational budget page content:', error);
      }
    }
    
    // Get operational budgets
    let budgets: any[] = [];
    try {
      const budgetsResult = await pool.query(
        `SELECT * FROM operational_budgets 
         WHERE is_active = true 
         ORDER BY year DESC, order_index ASC, created_at DESC`
      );
      budgets = budgetsResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching operational budgets:', error);
      }
    }

    return NextResponse.json({
      content: pageContent,
      budgets: budgets,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public operational budget:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى الخطة التشغيلية والموازنة', content: [], budgets: [] },
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
