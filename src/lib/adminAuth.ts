import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseBrowserClient, hasSupabaseEnv } from "./supabaseClient";

type AdminRole = "admin" | "editor" | "viewer";
const allowedRoles: AdminRole[] = ["admin", "editor", "viewer"];
type VerifiedAdminUser = {
  id: string;
  auth_user_id: string | null;
  email: string | null;
  role: AdminRole;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function tokenFromCookieValue(value: string) {
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

function readAccessToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice("Bearer ".length).trim();

  const directCookie = request.cookies.get("sb-access-token")?.value;
  const directToken = directCookie ? tokenFromCookieValue(directCookie) : null;
  if (directToken) return directToken;

  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.endsWith("auth-token")) {
      const token = tokenFromCookieValue(cookie.value);
      if (token) return token;
    }
  }

  return null;
}

export async function getAdminUser(request: NextRequest) {
  if (!hasSupabaseEnv()) return true;
  const token = readAccessToken(request);
  if (!token) return null;

  const authClient = createSupabaseBrowserClient();
  const adminClient = createSupabaseAdminClient();
  if (!authClient || !adminClient) return null;

  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) return null;

  const { data: adminUserById, error: adminByIdError } = await adminClient
    .from("admin_users")
    .select("id, auth_user_id, email, role")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();

  if (adminByIdError) throw adminByIdError;

  let adminUser = adminUserById as VerifiedAdminUser | null;
  if (!adminUser && userData.user.email) {
    const { data: adminUserByEmail, error: adminByEmailError } = await adminClient
      .from("admin_users")
      .select("id, auth_user_id, email, role")
      .eq("email", userData.user.email)
      .maybeSingle();

    if (adminByEmailError) throw adminByEmailError;
    adminUser = adminUserByEmail as VerifiedAdminUser | null;
  }

  if (!adminUser) return false;
  if (!allowedRoles.includes(adminUser.role)) return false;
  return adminUser;
}

export async function requireAdminRequest(request: NextRequest) {
  const result = await getAdminUser(request);
  if (result === true || result) return null;
  if (result === false) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  return NextResponse.json({ error: "Authentication required" }, { status: 401 });
}
