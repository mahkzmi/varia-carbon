import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AssessmentForm, FieldName } from "@/components/Assessment";

const FIELD_NAMES: FieldName[] = [
  "ndvi",
  "precipitation",
  "temperature",
  "elevation",
  "clay",
];

export function useAssessmentUrl(
  values: AssessmentForm,
  setValues: Dispatch<SetStateAction<AssessmentForm>>
) {
  // Read URL parameters and populate the form on initial load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (!FIELD_NAMES.some((name) => params.has(name))) {
      return;
    }

    setValues((previousValues) => {
      const nextValues = { ...previousValues };

      for (const name of FIELD_NAMES) {
        const value = params.get(name);

        if (value !== null) {
          nextValues[name] = value;
        }
      }

      return nextValues;
    });
  }, [setValues]);

  // Update the URL when form values change.
  useEffect(() => {
    const params = new URLSearchParams();

    for (const name of FIELD_NAMES) {
      if (values[name] !== "") {
        params.set(name, values[name]);
      }
    }

    const query = params.toString();
    const nextUrl = query
      ? `${window.location.pathname}?${query}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;

    window.history.replaceState(null, "", nextUrl);
  }, [values]);
}