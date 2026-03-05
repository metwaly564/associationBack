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
      `SELECT id, title, description, donation_type, suggested_amount, min_amount, 
              is_active, order_index, image_url
       FROM donation_products 
       WHERE is_active = true
       ORDER BY order_index, created_at`
    );
    return NextResponse.json(result.rows, {
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error('Error fetching public donation products:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب منتجات التبرع' },
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
