import React from "react";

const ringPos = (i, total, radiusX, radiusY) => {
  const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
  return {
    left: `${50 + Math.cos(angle) * radiusX}%`,
    top: `${50 + Math.sin(angle) * radiusY}%`,
  };
};

/**
 * Animated orbit diagram — two counter-rotating rings of capability chips
 * around a labelled core. Replaces stock photography site-wide.
 */
export const OrbitDiagram = ({
  coreLabel,
  coreSub,
  coreIcon: CoreIcon,
  innerChips = [],
  outerChips = [],
  accent = "37, 99, 235",
  caption,
  testId = "orbit-diagram",
}) => {
  const chip = (label, key, style, reverseDuration) => (
    <span
      key={key}
      className="absolute -translate-x-1/2 -translate-y-1/2 org-orbit-chip"
      style={{ ...style, animationDuration: reverseDuration, animationDirection: "reverse" }}
    >
      <span
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-[0_8px_24px_-14px_rgba(15,23,42,0.4)] backdrop-blur-sm"
        style={{ borderColor: `rgba(${accent},0.25)` }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `rgb(${accent})` }} />
        {label}
      </span>
    </span>
  );

  return (
    <div data-testid={testId}>
      <div className="relative w-full aspect-[4/3] rounded-3xl border border-slate-200 bg-white overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 org-grid-mesh-sm" style={{ maskImage: "radial-gradient(black 25%, transparent 78%)", WebkitMaskImage: "radial-gradient(black 25%, transparent 78%)" }} />
        <div aria-hidden="true" className="absolute inset-0" style={{ background: `radial-gradient(rgba(${accent},0.12), transparent 62%)` }} />

        <div aria-hidden="true" className="absolute rounded-full border border-dashed" style={{ borderColor: `rgba(${accent},0.2)`, left: "26%", top: "18%", width: "48%", height: "64%" }} />
        <div aria-hidden="true" className="absolute rounded-full border border-dashed" style={{ borderColor: `rgba(${accent},0.2)`, left: "19%", top: "9%", width: "62%", height: "82%" }} />

        <div className="absolute inset-0 org-orbit-ring" style={{ animationDuration: "46s" }}>
          {innerChips.map((label, i) => chip(label, `in-${i}`, ringPos(i, innerChips.length, 24, 32), "46s"))}
        </div>
        <div className="absolute inset-0 org-orbit-ring" style={{ animationDuration: "68s", animationDirection: "reverse" }}>
          {outerChips.map((label, i) => chip(label, `out-${i}`, ringPos(i, outerChips.length, 31, 41), "68s"))}
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex flex-col items-center gap-2 rounded-2xl border bg-white px-4 py-4 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)]" style={{ borderColor: `rgba(${accent},0.33)` }}>
            <span aria-hidden="true" className="absolute -inset-3 rounded-3xl org-pulse-soft" style={{ background: `radial-gradient(circle, rgba(${accent},0.14), transparent 70%)` }} />
            {CoreIcon && (
              <span className="relative grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: `rgba(${accent},0.08)`, color: `rgb(${accent})` }}>
                <CoreIcon className="h-[18px] w-[18px]" />
              </span>
            )}
            <p className="relative font-outfit text-sm font-bold tracking-[-0.01em] text-slate-900">{coreLabel}</p>
            {coreSub && (
              <p className="relative text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: `rgb(${accent})` }}>
                {coreSub}
              </p>
            )}
          </div>
        </div>
      </div>
      {caption && <p className="mt-3 text-[11px] text-slate-400 text-center">{caption}</p>}
    </div>
  );
};

export default OrbitDiagram;
