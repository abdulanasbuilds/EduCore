import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWhatsApp } from '@/lib/twilio';
import { schoolConfig } from '@/lib/env';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatGhs(amount: number): string {
  return `GHS ${amount.toLocaleString()}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = req.headers.get('Authorization')?.split(' ')[1] || searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createAdminClient() as any;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const { data: payments } = await supabase
    .from('fee_payments')
    .select(`
      id,
      amount,
      payment_date,
      payment_method,
      receipt_number,
      student_id,
      students!inner(full_name)
    `)
    .eq('payment_date', todayStr);

  if (!payments || payments.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No payments today — skipping report',
      processed: 0,
    });
  }

  const totalCollected = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const count = payments.length;

  const studentsList = payments
    .map((p: any) => `  • ${p.students?.full_name ?? 'Unknown'} — ${formatGhs(p.amount)} (${p.payment_method})`)
    .join('\n');

  const { data: activeTerm } = await supabase
    .from('terms')
    .select('id, start_date, end_date')
    .eq('status', 'active')
    .limit(1)
    .single();

  let termTotal = 0;
  if (activeTerm) {
    const { data: termPayments } = await supabase
      .from('fee_payments')
      .select('amount')
      .gte('payment_date', activeTerm.start_date.split('T')[0])
      .lte('payment_date', activeTerm.end_date.split('T')[0]);

    termTotal = termPayments?.reduce((sum: number, p: any) => sum + p.amount, 0) ?? 0;
  }

  const message = `[${schoolConfig.name}] — Daily Fee Report 📊
Date: ${formatDate(today)}

Total Collected Today: ${formatGhs(totalCollected)}
Number of Payments: ${count}

Students who paid:
${studentsList}

Term Total So Far: ${formatGhs(termTotal)}
— EduCore Auto-Report`;

  const adminWhatsApp = schoolConfig.whatsapp;
  if (adminWhatsApp) {
    await sendWhatsApp({
      to: adminWhatsApp,
      message,
      recipientName: 'School Admin',
      type: 'daily_fee_report',
    });
  }

  return NextResponse.json({
    success: true,
    processed: count,
    totalCollected,
    message: 'Daily fee report sent',
  });
}
