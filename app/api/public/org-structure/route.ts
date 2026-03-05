import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get org structure content
export async function GET() {
  try {
    // Get page content
    let pageContent: any[] = [];
    try {
      const contentResult = await pool.query(
        'SELECT * FROM org_structure_content WHERE is_active = true ORDER BY order_index ASC'
      );
      pageContent = contentResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching org structure page content:', error);
      }
    }
    
    // Get structure items
    let items: any[] = [];
    try {
      const itemsResult = await pool.query(
        'SELECT id, title, description, order_index FROM org_structure WHERE order_index IS NOT NULL ORDER BY order_index ASC, created_at ASC'
      );
      items = itemsResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching org structure items:', error);
      }
    }

    return NextResponse.json({
      content: pageContent,
      items: items,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public org structure:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى الهيكل التنظيمي', content: [], items: [] },
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
