"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Terminal } from "lucide-react";

const LICENSE_ENDPOINT = "/api/license";
type LicenseResponse = {
  message: string;
};

const BADGES = {
  loading: { label: "Checking…", style: "bg-gray-100 text-gray-600", dot: "bg-gray-400 animate-pulse" },
  active: { label: "License Active", style: "bg-emerald-100 text-[#1b4d35]", dot: "bg-[#1b4d35]" },
  inactive: { label: "License Inactive", style: "bg-red-100 text-red-800", dot: "bg-red-600" },
} as const;

const License = () => {
  const [data, setData] = useState<LicenseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch(LICENSE_ENDPOINT, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        setData((await res.json()) as LicenseResponse);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

const state = loading
  ? "loading"
  : failed
    ? "inactive"
    : "active";

const badge = BADGES[state];

  const message = loading
    ? "Connecting to the API…"
    : failed
      ? "Couldn't reach the API."
      : (data?.message ?? "No response from the API.");

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-16">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-emerald-950/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#1b4d35]">
              <ShieldCheck className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold leading-tight text-gray-900">License</h2>
              <p className="text-sm text-gray-500">No license key or input needed.</p>
            </div>
          </div>

          <span
            aria-live="polite"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${badge.style}`}
          >
            <span className={`h-2 w-2 rounded-full ${badge.dot}`} aria-hidden="true" />
            {badge.label}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-3xl bg-emerald-50 px-5 py-3.5">
          <Terminal className="h-4 w-4 shrink-0 text-[#c4a24a]" aria-hidden="true" />
          <p className="font-mono text-sm text-gray-800">{message}</p>
        </div>
      </div>
    </section>
  );
};

export default License;