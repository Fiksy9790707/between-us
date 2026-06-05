"use client";

import { readFileAsDataUrl } from "@/lib/file";
import { uploadImageToSupabase } from "@/lib/supabase/browser";

export async function saveImageFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const payload = (await response.json()) as { url: string };
    return payload.url;
  } catch {
    try {
      return await uploadImageToSupabase(file);
    } catch {
      return readFileAsDataUrl(file);
    }
  }
}
