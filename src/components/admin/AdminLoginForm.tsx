"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase is not configured. Admin demo mode is open.");
      setLoading(false);
      return;
    }
    const form = new FormData(event.currentTarget);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") || ""),
      password: String(form.get("password") || "")
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (data.session?.access_token) {
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;
    }
    router.push(params.get("next") || "/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input name="email" type="email" required placeholder="Admin email" />
      <Input name="password" type="password" required placeholder="Password" />
      <Button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
      {message ? <p className="text-sm text-amber">{message}</p> : null}
    </form>
  );
}
