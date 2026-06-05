"use client";

import { requestAdminCode } from "@/lib/admin-access";
import { readFileAsDataUrl } from "@/lib/file";

export async function saveImageFile(file: File) {
  const code = requestAdminCode();

  if (!code) {
    return readFileAsDataUrl(file);
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "x-between-us-admin-code": code
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const payload = (await response.json()) as { url: string };
    return payload.url;
  } catch {
    return readFileAsDataUrl(file);
  }
}
