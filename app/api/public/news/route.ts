import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - لا يحتاج مصادقة
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, title, slug, excerpt, body, category, status, published_at, created_at, show_on_home, priority
       FROM news 
       WHERE status = 'published'
       ORDER BY published_at DESC, created_at DESC`
    );
    return NextResponse.json(result.rows, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public news:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الأخبار' },
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
