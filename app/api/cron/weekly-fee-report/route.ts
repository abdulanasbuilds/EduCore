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
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 6);

  const startStr = startOfWeek.toISOString().split('T')[0];
  const endStr = endOfWeek.toISOString().split('T')[0];
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
    .gte('payment_date', startStr)
    .lte('payment_date', endStr);

  if (!payments || payments.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No payments this week — skipping report',
      processed: 0,
    });
  }

  const weekTotal = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const count = payments.length;

  const todayPayments = payments.filter((p: any) => p.payment_date === todayStr);
  const todayTotal = todayPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

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

  const { data: defaulters } = await supabase
    .from('student_fees')
    .select('id', { count: 'exact' })
    .gt('balance', 0);

  const message = `[${schoolConfig.name}] — Weekly Fee Report 📊
Period: ${formatDate(startOfWeek)} – ${formatDate(endOfWeek)}

Week Total: ${formatGhs(weekTotal)}
Number of Payments: ${count}

Today's Payments: ${formatGhs(todayTotal)}

Students who paid:
${studentsList}

Term Total So Far: ${formatGhs(termTotal)}
Students with Outstanding Balance: ${defaulters?.length ?? 0}
— Fee Report`;

  const adminWhatsApp = schoolConfig.whatsapp;
  if (adminWhatsApp) {
    await sendWhatsApp({
      to: adminWhatsApp,
      message,
      recipientName: 'School Admin',
      type: 'weekly_fee_report',
    });
  }

  return NextResponse.json({
    success: true,
    processed: count,
    weekTotal,
    termTotal,
    defaultersCount: defaulters?.length ?? 0,
    message: 'Weekly fee report sent',
  });
}
