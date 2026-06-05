import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  const value = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(value);
}

export function daysBetween(from: string, to = new Date()) {
  const start = new Date(`${from}T00:00:00`);
  const current = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  const diff = current.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / 86400000) + 1);
}

export function nextDate(date: string, recurring: "none" | "yearly") {
  const original = new Date(`${date}T00:00:00`);
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (recurring === "none") {
    return original;
  }

  const candidate = new Date(
    today.getFullYear(),
    original.getMonth(),
    original.getDate()
  );
  if (candidate < base) {
    candidate.setFullYear(candidate.getFullYear() + 1);
  }
  return candidate;
}

export function daysUntil(date: Date) {
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.ceil((date.getTime() - base.getTime()) / 86400000));
}

export function todayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
