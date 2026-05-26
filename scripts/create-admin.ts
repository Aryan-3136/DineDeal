import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Args = {
  email?: string;
  password?: string;
  name?: string;
};

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const contents = readFileSync(envPath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    const next = argv[index + 1];
    if (item === "--email") args.email = next;
    if (item === "--password") args.password = next;
    if (item === "--name") args.name = next;
    if (item.startsWith("--email=")) args.email = item.slice("--email=".length);
    if (item.startsWith("--password=")) args.password = item.slice("--password=".length);
    if (item.startsWith("--name=")) args.name = item.slice("--name=".length);
  }
  return args;
}

function fail(message: string): never {
  console.error(`Admin setup failed: ${message}`);
  process.exit(1);
}

async function findUserByEmail(supabase: SupabaseClient, email: string) {
  let page = 1;
  const perPage = 100;

  while (page <= 100) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < perPage) return null;
    page += 1;
  }

  return null;
}

async function main() {
  if (typeof window !== "undefined" || process.env.NEXT_RUNTIME) {
    fail("This script must run only from a local/server command line.");
  }

  loadEnvLocal();

  const args = parseArgs(process.argv.slice(2));
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) fail("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in .env.local.");
  if (!serviceRoleKey) fail("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  if (!args.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email)) fail("Pass a valid --email value.");
  if (!args.password || args.password.length < 8) fail("Pass a --password value with at least 8 characters.");
  if (!args.name || args.name.trim().length < 2) fail("Pass a --name value.");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  let userId: string | null = null;
  let createdAuthUser = false;

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: args.email,
    password: args.password,
    email_confirm: true,
    user_metadata: { name: args.name }
  });

  if (createError) {
    const existingUser = await findUserByEmail(supabase, args.email);
    if (!existingUser) fail(createError.message);
    userId = existingUser.id;
    console.log("Auth user already exists; reusing existing Supabase Auth user.");
  } else {
    userId = created.user?.id ?? null;
    createdAuthUser = true;
  }

  if (!userId) fail("Supabase did not return an auth user id.");

  const { error: adminError } = await supabase.from("admin_users").upsert({
    auth_user_id: userId,
    email: args.email.toLowerCase(),
    name: args.name,
    role: "admin"
  }, { onConflict: "email" });

  if (adminError) fail(adminError.message);

  console.log(createdAuthUser ? "Admin auth user created successfully." : "Admin auth user already existed.");
  console.log(`Admin user is ready: ${args.email.toLowerCase()} (${args.name})`);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : "Unknown Supabase error.");
});
