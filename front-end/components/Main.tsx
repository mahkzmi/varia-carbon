"use client";

import React, { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import Inputs from "./Inputs";
import {
  DEFAULT_VALUES,
  buildPayload,
  type AssessmentForm,
  type FieldName,
} from "./Assessment";
import { useAssessmentUrl } from "@/hooks/useAssessmentUrl";

type MainProps = {
  onResult?: (data: unknown) => void;
};

const Main = ({ onResult }: MainProps) => {
  const [form, setForm] = useState<AssessmentForm>(DEFAULT_VALUES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useAssessmentUrl(form, setForm);

  const handleChange = (name: FieldName, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const result = buildPayload(form);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed (${res.status})`
        );
      }

      const data = await res.json();

      onResult?.({
        prediction: data.predicted_soc_percent,
        level: undefined,
        carbon_credits: undefined,
        r2: undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto mt-6 w-full max-w-3xl px-4 pb-16">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-emerald-950/5">
        <h2 className="text-xl font-bold text-gray-900">
          New Assessment
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Enter environmental variables to estimate Soil Organic Carbon.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
          <Inputs values={form} onChange={handleChange} />

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#1b4d35] text-sm font-semibold text-white shadow-lg shadow-emerald-950/20 transition-colors hover:bg-[#153d2a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b4d35] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Running…
              </>
            ) : (
              <>
                Run Assessment
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Main;