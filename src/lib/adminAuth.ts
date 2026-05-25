import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseEnv } from "./supabaseClient";

export function isAdminRequest(request: NextRequest) {
  if (!hasSupabaseEnv()) return true;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return true;
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
}

export function requireAdminRequest(request: NextRequest) {
  if (isAdminRequest(request)) return null;
  return NextResponse.json({ error: "Authentication required" }, { status: 401 });
}
