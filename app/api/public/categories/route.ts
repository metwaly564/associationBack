import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get all active categories
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, description, color, order_index
       FROM news_categories 
       WHERE is_active = true
       ORDER BY order_index, created_at ASC`
    );
    return NextResponse.json(result.rows, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public categories:', error);
    
    // If table doesn't exist, return empty array instead of error
    if (error.code === '42P01') {
      return NextResponse.json([], {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders,
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التصنيفات' },
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
