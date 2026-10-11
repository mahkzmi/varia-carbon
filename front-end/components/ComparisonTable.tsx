import React from "react";
import { Leaf } from "lucide-react";

const COLUMNS = ["Method", "Cost/ha", "Time", "Field Visit"];

const ROWS = [
  {
    method: "Traditional Lab",
    cost: "$30–50",
    time: "Weeks",
    fieldVisit: "Required",
    highlight: false,
  },
  {
    method: "VARIA Carbon",
    cost: "$5–10",
    time: "Seconds",
    fieldVisit: "Not required",
    highlight: true,
  },
];

const ComparisonTable = () => {
  return (
    <section
      aria-labelledby="comparison-title"
      className="mx-auto w-full max-w-3xl px-4 pb-16"
    >
      <h2 id="comparison-title" className="text-lg font-bold text-gray-900">
        How VARIA compares
      </h2>

      <div className="mt-4 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-emerald-950/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {COLUMNS.map((col, i) => (
                  <th
                    key={col}
                    scope="col"
                    className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 ${
                      i === 0 ? "w-[32%]" : ""
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.method}
                  className={`border-t border-gray-200 first:border-t-0 ${
                    row.highlight
                      ? "bg-emerald-50 font-bold text-[#1b4d35]"
                      : "text-gray-900"
                  }`}
                >
                  <th scope="row" className="px-5 py-4 font-[inherit]">
                    <span className="flex items-center gap-2.5">
                      {row.highlight && (
                        <Leaf
                          className="h-3.5 w-3.5 shrink-0 text-[#c4a24a]"
                          aria-hidden="true"
                        />
                      )}
                      {row.method}
                    </span>
                  </th>
                  <td className="px-5 py-4">{row.cost}</td>
                  <td className="px-5 py-4">{row.time}</td>
                  <td className="px-5 py-4">{row.fieldVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;