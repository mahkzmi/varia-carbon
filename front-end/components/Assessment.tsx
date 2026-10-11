"use client";

import {
  CloudRain,
  Layers,
  Leaf,
  Mountain,
  Thermometer,
  type LucideIcon,
} from "lucide-react";

export type FieldName =
  | "ndvi"
  | "precipitation"
  | "temperature"
  | "elevation"
  | "clay";

// Form state keeps raw strings so an input can be empty while typing.
export type AssessmentForm = Record<FieldName, string>;

// What the backend receives. Rename keys here (apiKey in FIELDS) if your API differs.
export type AssessmentPayload = {
  ndvi: number;
  precipitation: number;
  temperature: number;
  elevation: number;
  clay: number;
};

type Field = {
  name: FieldName;
  apiKey: keyof AssessmentPayload;
  label: string;
  unit: string;
  icon: LucideIcon;
  min: number;
  max?: number;
};

export const FIELDS: Field[] = [
  {
    name: "ndvi",
    apiKey: "ndvi",
    label: "NDVI",
    unit: "0–1",
    icon: Leaf,
    min: 0,
    max: 1,
  },
  {
    name: "precipitation",
    apiKey: "precipitation",
    label: "Annual Precipitation",
    unit: "mm",
    icon: CloudRain,
    min: 0,
  },
  {
    name: "temperature",
    apiKey: "temperature",
    label: "Mean Annual Temperature",
    unit: "°C",
    icon: Thermometer,
    min: -50,
    max: 50,
  },
  {
    name: "elevation",
    apiKey: "elevation",
    label: "Elevation",
    unit: "m",
    icon: Mountain,
    min: -500,
    max: 9000,
  },
  {
    name: "clay",
    apiKey: "clay",
    label: "Clay Content",
    unit: "%",
    icon: Layers,
    min: 0,
    max: 100,
  },
];

export const DEFAULT_VALUES: AssessmentForm = {
  ndvi: "",
  precipitation: "",
  temperature: "",
  elevation: "",
  clay: "",
};

type BuildResult =
  | { ok: true; payload: AssessmentPayload }
  | { ok: false; error: string };

// Converts the string form values to a validated, numeric payload.
export function buildPayload(form: AssessmentForm): BuildResult {
  const payload = {} as AssessmentPayload;

  for (const field of FIELDS) {
    const raw = form[field.name].trim();
    const value = Number(raw);

    if (raw === "" || !Number.isFinite(value)) {
      return { ok: false, error: `${field.label} must be a number.` };
    }
    if (value < field.min || (field.max !== undefined && value > field.max)) {
      const range =
        field.max !== undefined
          ? `between ${field.min} and ${field.max}`
          : `at least ${field.min}`;
      return { ok: false, error: `${field.label} must be ${range}.` };
    }

    payload[field.apiKey] = value;
  }

  return { ok: true, payload };
}

export type SocLevel = "Low" | "Medium" | "High";

// Backend response. Only `prediction` is required; the rest fall back to defaults in Result.
export type AssessmentResult = {
  prediction: number; // SOC in %
  level?: SocLevel;
  carbon_credits?: number; // tCO₂/ha
  r2?: number;
};

// Thresholds are an assumption; adjust to your own classes.
export function getLevel(soc: number): SocLevel {
  if (soc < 1.5) return "Low";
  if (soc < 3) return "Medium";
  return "High";
}