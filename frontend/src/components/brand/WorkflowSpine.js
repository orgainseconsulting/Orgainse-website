import React from "react";

/**
 * Vertical "one governed flow" spine — numbered/iconed steps joined by a
 * gradient rail. Used in place of hero imagery.
 */
export const WorkflowSpine = ({ title = "One governed flow", steps = [], testId = "workflow-spine" }) => (
  <div
    data-testid={testId}
    className="relative rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.3)]"
  >
    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 font-bold">{title}</p>
    <div className="mt-6 relative">
      <span
        aria-hidden="true"
        className="absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-blue-500/60 via-violet-500/40 to-transparent"
      />
      {steps.map((step, i) => (
        <div key={step.label} className="relative flex items-start gap-4 pb-6 last:pb-0">
          <span
            className="relative z-10 w-8 h-8 rounded-full bg-white border border-slate-200 grid place-items-center shrink-0 shadow-sm org-spine-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {step.icon ? <step.icon className="h-[13px] w-[13px] text-blue-600" /> : <span className="text-[11px] font-bold text-blue-600">{i + 1}</span>}
          </span>
          <div className="org-spine-in" style={{ animationDelay: `${i * 0.05 + 0.05}s` }}>
            <p className="font-outfit font-bold text-slate-900 text-[15px] tracking-[-0.01em]">{step.label}</p>
            <p className="mt-0.5 text-[12px] text-slate-500 leading-relaxed">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default WorkflowSpine;
