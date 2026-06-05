"use client";

import { createClient } from "@supabase/supabase-js";
import type { MemoryData } from "@/types/memory";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const imageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "between-us-images";

export function isStaticMirror() {
  return process.env.NEXT_PUBLIC_STATIC_MIRROR === "true";
}

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !anonKey) {
    return null;
  }

  return createClient(supabaseUrl, anonKey);
}

export async function readMemoryFromSupabase() {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("memory_state")
    .select("data")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.data as MemoryData | undefined) ?? null;
}

export async function writeMemoryToSupabase(nextData: MemoryData) {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase browser client is not configured.");
  }

  const { data, error } = await supabase.rpc("save_memory_state", {
    p_data: nextData
  });

  if (error) {
    throw error;
  }

  return (data as MemoryData | null) ?? nextData;
}

export async function uploadImageToSupabase(file: File) {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase browser client is not configured.");
  }

  const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const path = `uploads/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(imageBucket).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(imageBucket).getPublicUrl(path);
  return data.publicUrl;
}
