import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient() as any;
    const { data: school } = await supabase
      .from("schools")
      .select("id")
      .limit(1)
      .single();

    if (!school) return NextResponse.json({ classes: [] });

    const { data: classes } = await supabase
      .from("classes")
      .select("id, name")
      .eq("school_id", school.id)
      .order("name");

    return NextResponse.json({ classes: classes ?? [] });
  } catch {
    return NextResponse.json({ classes: [] });
  }
}
