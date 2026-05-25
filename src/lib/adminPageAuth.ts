import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "./supabaseClient";
import { verifyAdminAccessToken } from "./adminAuth";

function decodeBase64Url(value: string) {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(normalized, "base64").toString("utf8");
  } catch {
    return "";
  }
}

function tokenFromCookieValue(value?: string) {
  if (!value) return null;
  if (value.startsWith("base64-")) {
    try {
      const decoded = JSON.parse(decodeBase64Url(value.slice(7)));
      return decoded?.access_token || decoded?.[0] || null;
    } catch {
      return null;
    }
  }
  try {
    const decoded = JSON.parse(decodeURIComponent(value));
    return decoded?.access_token || decoded?.[0] || null;
  } catch {
    return value.length > 40 ? value : null;
  }
}

function readTokenFromCookies() {
  const store = cookies();
  const direct = tokenFromCookieValue(store.get("sb-access-token")?.value);
  if (direct) return direct;
  for (const cookie of store.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.endsWith("auth-token")) {
      const token = tokenFromCookieValue(cookie.value);
      if (token) return token;
    }
  }
  return null;
}

export async function requireAdminPage() {
  if (!hasSupabaseEnv()) return { authorized: false, denied: true };
  const token = readTokenFromCookies();
  if (!token) redirect("/admin/login");
  const result = await verifyAdminAccessToken(token);
  if (!result) return { authorized: false, denied: true };
  return { authorized: true, denied: false };
}
