import { NextResponse } from "next/server";
import seed from "@/data/seed.json";
import type { MemoryData } from "@/types/memory";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
  memoryRowId
} from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      cloudEnabled: false,
      data: seed
    });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("memory_state")
    .select("data")
    .eq("id", memoryRowId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    cloudEnabled: true,
    initialized: Boolean(data?.data),
    data: (data?.data as MemoryData | undefined) ?? seed
  });
}

export async function PUT(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as { data?: MemoryData };
  if (!body.data) {
    return NextResponse.json({ error: "Missing memory data." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("memory_state").upsert({
    id: memoryRowId,
    data: body.data,
    updated_at: new Date().toISOString()
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
