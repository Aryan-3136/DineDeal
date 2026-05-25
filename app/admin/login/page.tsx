import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Suspense } from "react";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <section className="w-full rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <p className="mt-2 text-sm text-ink/65">Sign in with your Supabase admin account to manage restaurants and offers.</p>
        <div className="mt-5">
          <Suspense fallback={<div className="text-sm text-ink/60">Loading login...</div>}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
