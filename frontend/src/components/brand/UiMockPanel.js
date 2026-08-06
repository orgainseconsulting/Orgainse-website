import React from "react";

/**
 * Abstract interface illustration — a fake governed workspace panel.
 * No tenant data, no stock photography.
 */
export const UiMockPanel = ({ title = "Delivery workspace", rows = [], chips = [], footnote = "Interface illustration. No client data is shown.", testId = "ui-mock-panel" }) => (
  <div data-testid={testId} className="relative rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
    <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
      <p className="ml-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
    </div>

    <div className="p-5 space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 grid place-items-center shrink-0">
            {row.icon ? <row.icon className="h-3 w-3 text-blue-600" /> : <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
          </span>
          <div className="flex-1 min-w-0">
            {row.label ? (
              <p className="text-[12px] font-semibold text-slate-800 leading-snug">{row.label}</p>
            ) : (
              <div className="h-1.5 rounded-full bg-slate-200" style={{ width: `${60 + ((i * 13) % 30)}%` }} />
            )}
            <div className="mt-1.5 h-1.5 rounded-full bg-slate-100" style={{ width: `${72 + ((i * 7) % 22)}%` }} />
          </div>
        </div>
      ))}

      {chips.length > 0 && (
        <div className="pt-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {c}
            </span>
          ))}
        </div>
      )}
    </div>

    <div className="border-t border-slate-200 px-4 py-2 text-[9px] text-slate-400 bg-slate-50">{footnote}</div>
  </div>
);

export default UiMockPanel;
