import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  imageBucket,
  isSupabaseConfigured,
  verifyAdminCode
} from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  if (!verifyAdminCode(request)) {
    return NextResponse.json({ error: "Invalid admin code." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const path = `uploads/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(imageBucket)
    .upload(path, Buffer.from(arrayBuffer), {
      contentType: file.type || "image/jpeg",
      upsert: false
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(imageBucket).getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl });
}
