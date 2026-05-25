import Link from "next/link";

export function AccessDenied() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="mt-2 text-sm">Your account is authenticated but is not listed as an admin, editor, or viewer for DineDeal.</p>
        <Link className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700" href="/admin/login">Back to login</Link>
      </section>
    </main>
  );
}
