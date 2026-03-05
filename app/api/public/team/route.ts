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
      `SELECT id, name, role, type, bio, image_url, order_index
       FROM team_members 
       ORDER BY type, order_index, created_at`
    );
    return NextResponse.json(result.rows, {
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error('Error fetching public team:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب فريق العمل' },
      { 
        status: 500,
        headers: corsHeaders,
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
