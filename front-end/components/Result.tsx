"use client"

import React, { useEffect, useRef } from "react";
import { Info } from "lucide-react";
import { getLevel, type AssessmentResult, type SocLevel } from "./Assessment";

const LEVEL_STYLES: Record<SocLevel, { badge: string; message: string }> = {
  High: {
    badge: "bg-emerald-100 text-[#1b4d35]",
    message: "Soil shows strong organic carbon levels.",
  },
  Medium: {
    badge: "bg-amber-100 text-amber-900",
    message: "Soil shows moderate organic carbon levels.",
  },
  Low: {
    badge: "bg-orange-100 text-orange-900",
    message: "Soil shows low organic carbon levels.",
  },
};

// Assumed from the design (5.94% -> 2.97 tCO₂/ha). Replace with your backend value or formula.
const CREDITS_FACTOR = 0.5;
const DEFAULT_R2 = 0.78;

type ResultProps = { result: AssessmentResult };

const Result = ({ result }: ResultProps) => {
  const ref = useRef<HTMLElement>(null);

  // Bring the result into view every time a new result arrives.
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const soc = result.prediction;
  const level = result.level ?? getLevel(soc);
  const credits = result.carbon_credits ?? soc * CREDITS_FACTOR;
  const r2 = result.r2 ?? DEFAULT_R2;

  const stats = [
    { label: "Prediction", value: `${soc.toFixed(2)}%` },
    { label: "Carbon Credits", value: `${credits.toFixed(2)} tCO₂/ha` },
    { label: "Confidence", value: `R² = ${r2.toFixed(2)}` },
  ];

  // Same outer wrapper as Main, so both cards share the exact same width.
  return (
    <section
      ref={ref}
      aria-live="polite"
      className="mx-auto w-full max-w-3xl scroll-mt-6 px-4 pb-16"
    >
      <div className="flex flex-col items-center rounded-3xl border border-gray-200 bg-white px-6 py-10 text-center shadow-xl shadow-emerald-950/5 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
          Estimated Soil Organic Carbon
        </p>

        <p className="mt-6 flex items-baseline text-[#1b4d35]">
          <span className="text-[5rem] font-extrabold leading-none tracking-tight">
            {soc.toFixed(2)}
          </span>
          <span className="ml-1 text-4xl font-semibold">%</span>
        </p>

        <span
          className={`mt-5 rounded-full px-5 py-1.5 text-sm font-bold ${LEVEL_STYLES[level].badge}`}
        >
          {level}
        </span>

        <p className="mt-6 text-lg text-gray-600">{LEVEL_STYLES[level].message}</p>

        <dl className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map(({ label, value }) => (
            <div key={label} className="rounded-3xl bg-emerald-50 px-4 py-4">
              <dt className="text-sm text-gray-600">{label}</dt>
              <dd className="mt-1 text-lg font-bold text-[#1b4d35]">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 flex items-center gap-2 text-xs text-gray-600">
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          This is a preliminary screening result. Lab validation recommended.
        </p>
      </div>
    </section>
  );
};

export default Result;