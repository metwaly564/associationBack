import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get supervising authorities
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, name, image_url, icon_name, website_url, order_index
       FROM supervising_authorities 
       WHERE is_active = true
       ORDER BY order_index ASC, name ASC`
    );
    
    return NextResponse.json(result.rows, {
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error('Error fetching public supervising authorities:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json([], {
        headers: corsHeaders,
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الجهات المشرفة' },
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
