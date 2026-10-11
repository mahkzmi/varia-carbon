
"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Main from "@/components/Main";
import Result from "@/components/Result";
import type { AssessmentResult } from "@/components/Assessment";
import ComparisonTable from "@/components/ComparisonTable";
import ContactUs from "@/components/ContactUs";
import License from "@/components/license";

export default function HomePage() {
  const [result, setResult] = useState<AssessmentResult | null>(null);

  return (
    <main className="min-h-screen bg-page topo">
      <Header />
      <Main onResult={(data) => setResult(data as AssessmentResult)} />

      {result && <Result result={result} />}
      <ComparisonTable />
      <License />
      <ContactUs />
    </main>
  );
}
