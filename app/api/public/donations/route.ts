import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Submit donation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      donation_type,
      product_id,
      donor_name,
      donor_email,
      donor_phone,
      amount,
      donation_method_id,
      notes,
    } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'المبلغ مطلوب ويجب أن يكون أكبر من الصفر' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!donation_type) {
      return NextResponse.json(
        { error: 'نوع التبرع مطلوب' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!donor_name) {
      return NextResponse.json(
        { error: 'اسم المتبرع مطلوب' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!donation_method_id) {
      return NextResponse.json(
        { error: 'طريقة التبرع مطلوبة' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Insert donation
    // Note: If donation_method_id column doesn't exist, we'll store it in notes
    const notesWithMethod = donation_method_id 
      ? `${notes ? notes + '\n\n' : ''}طريقة التبرع: ${donation_method_id}`
      : notes || null;

    const result = await pool.query(
      `INSERT INTO donations (
        donation_type, 
        product_id, 
        donor_name, 
        donor_email, 
        donor_phone, 
        amount, 
        status, 
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
      RETURNING *`,
      [
        donation_type,
        product_id || null,
        donor_name,
        donor_email || null,
        donor_phone || null,
        amount,
        notesWithMethod,
      ]
    );

    const donation = result.rows[0];

    // Update or insert donor record
    if (donor_email || donor_phone) {
      try {
        // Check if donor exists
        const donorCheck = await pool.query(
          `SELECT id FROM donors 
           WHERE email = $1 OR phone = $2`,
          [donor_email, donor_phone]
        );

        if (donorCheck.rows.length > 0) {
          // Update existing donor
          await pool.query(
            `UPDATE donors 
             SET total_donated = total_donated + $1,
                 donations_count = donations_count + 1,
                 updated_at = NOW()
             WHERE id = $2`,
            [amount, donorCheck.rows[0].id]
          );
        } else {
          // Insert new donor
          await pool.query(
            `INSERT INTO donors (name, email, phone, total_donated, donations_count)
             VALUES ($1, $2, $3, $4, 1)`,
            [donor_name, donor_email || null, donor_phone || null, amount]
          );
        }
      } catch (error) {
        console.error('Error updating donor:', error);
        // Don't fail the donation if donor update fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم إرسال طلب التبرع بنجاح',
        donation: {
          id: donation.id,
          amount: donation.amount,
          status: donation.status,
        },
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error submitting donation:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال التبرع' },
      { status: 500, headers: corsHeaders }
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
