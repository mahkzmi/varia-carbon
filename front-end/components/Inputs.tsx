import React from "react";
import { FIELDS, type AssessmentForm, type FieldName } from "./Assessment";

type InputsProps = {
  values: AssessmentForm;
  onChange: (name: FieldName, value: string) => void;
};

const Inputs = ({ values, onChange }: InputsProps) => {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
      {FIELDS.map(({ name, label, unit, icon: Icon, min, max }) => (
        <div key={name} className="flex flex-col gap-3">
          <label
            htmlFor={name}
            className="flex items-center gap-2.5 text-sm font-semibold text-gray-900"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-[#1b4d35]">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span>
              {label} <span className="ml-1 font-normal text-gray-500">({unit})</span>
            </span>
          </label>

          <input
            id={name}
            name={name}
            type="number"
            inputMode="decimal"
            step="any"
            min={min}
            max={max}
            required
            value={values[name]}
            onChange={(e) => onChange(name, e.target.value)}
            className="h-[46px] w-full rounded-full border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 outline-none transition-colors [appearance:textfield] focus:border-[#1b4d35] focus:bg-white focus:ring-2 focus:ring-[#1b4d35]/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      ))}
    </div>
  );
};

export default Inputs;