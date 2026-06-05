"use client";

const ADMIN_CODE_KEY = "between-us-admin-code";

export function getAdminCode() {
  return window.localStorage.getItem(ADMIN_CODE_KEY) ?? "";
}

export function requestAdminCode() {
  const existing = getAdminCode();
  if (existing) {
    return existing;
  }

  const code = window.prompt("请输入你们的共享管理密码");
  if (code?.trim()) {
    window.localStorage.setItem(ADMIN_CODE_KEY, code.trim());
    return code.trim();
  }

  return "";
}

export function clearAdminCode() {
  window.localStorage.removeItem(ADMIN_CODE_KEY);
}
