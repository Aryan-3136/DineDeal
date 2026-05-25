import { ComparePageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingState } from "@/components/LoadingState";

export default function ComparePage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-7xl px-4 py-8"><LoadingState label="Preparing comparison" /></main>}>
      <ComparePageClient />
    </Suspense>
  );
}
