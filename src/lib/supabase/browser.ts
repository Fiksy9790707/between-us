"use client";

import { createClient } from "@supabase/supabase-js";
import type { MemoryData } from "@/types/memory";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
