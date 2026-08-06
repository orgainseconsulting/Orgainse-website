import React from "react";

/**
 * Capability constellation — a deterministic, pixel-aligned diagram.
 * Chip positions are computed from fixed angles and centred on their point,
 * so nothing can drift, tilt, or clip. Only the dashed rings and the tracer
 * dot animate; text always stays upright.
 */

const INNER_ANGLES = [-90, 30, 150];
const OUTER_ANGLES = [0, 60, 120, 180, 240, 300];

const INNER_R = { x: 24, y: 32 };
const OUTER_R = { x: 32, y: 40 };

const point = (angleDeg, r) => {
  const a = (angleDeg * Math.PI) / 180;
  return { x: 50 + Math.cos(a) * r.x, y: 50 + Math.sin(a) * r.y };
};

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
  const inner = innerChips.slice(0, 3).map((label, i) => ({ label, ...point(INNER_ANGLES[i], INNER_R) }));
  const outer = outerChips.slice(0, 6).map((label, i) => ({ label, ...point(OUTER_ANGLES[i], OUTER_R) }));
  const nodes = [...inner, ...outer];

  return (
    <figure data-testid={testId} className="m-0">
      <div className="relative w-full aspect-[4/3] rounded-3xl border border-slate-200 bg-white overflow-hidden">
        {/* backdrop */}
        <div
          aria-hidden="true"
          className="absolute inset-0 org-grid-mesh-sm"
          style={{ maskImage: "radial-gradient(black 20%, transparent 76%)", WebkitMaskImage: "radial-gradient(black 20%, transparent 76%)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: `radial-gradient(60% 60% at 50% 50%, rgba(${accent},0.10), rgba(255,255,255,0) 70%)` }}
        />

        {/* rings, connectors, tracer */}
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {nodes.map((n) => (
            <line key={`l-${n.label}`} x1="50" y1="50" x2={n.x} y2={n.y} stroke={`rgba(${accent},0.16)`} strokeWidth="0.25" />
          ))}
          <ellipse cx="50" cy="50" rx={INNER_R.x} ry={INNER_R.y} fill="none" stroke={`rgba(${accent},0.28)`} strokeWidth="0.25" strokeDasharray="1.6 2.2" className="org-orbit-ring" style={{ animationDuration: "60s", transformOrigin: "50% 50%" }} />
          <ellipse cx="50" cy="50" rx={OUTER_R.x} ry={OUTER_R.y} fill="none" stroke={`rgba(${accent},0.22)`} strokeWidth="0.25" strokeDasharray="1.2 2.6" className="org-orbit-ring" style={{ animationDuration: "90s", animationDirection: "reverse", transformOrigin: "50% 50%" }} />
          <g className="org-orbit-ring" style={{ animationDuration: "26s", transformOrigin: "50% 50%" }}>
            <circle cx={50 + OUTER_R.x} cy="50" r="0.9" fill={`rgb(${accent})`} opacity="0.75" />
          </g>
          <g className="org-orbit-ring" style={{ animationDuration: "18s", animationDirection: "reverse", transformOrigin: "50% 50%" }}>
            <circle cx={50 - INNER_R.x} cy="50" r="0.75" fill={`rgb(${accent})`} opacity="0.55" />
          </g>
        </svg>

        {/* node dots */}
        {nodes.map((n) => (
          <span
            key={`d-${n.label}`}
            aria-hidden="true"
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%, -50%)", backgroundColor: `rgba(${accent},0.35)` }}
          />
        ))}

        {/* chips — centred on their point, always upright */}
        {nodes.map((n, i) => (
          <span
            key={n.label}
            className="absolute org-fade-up"
            style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%, -50%)", animationDelay: `${0.08 * i}s` }}
          >
            <span
              className="block whitespace-nowrap rounded-full border bg-white/95 px-2 py-1 text-[10px] font-semibold leading-none text-slate-700 shadow-[0_6px_18px_-10px_rgba(15,23,42,0.45)] backdrop-blur-sm"
              style={{ borderColor: `rgba(${accent},0.28)` }}
            >
              {n.label}
            </span>
          </span>
        ))}

        {/* core */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full org-pulse-soft"
            style={{ background: `radial-gradient(circle, rgba(${accent},0.18), rgba(255,255,255,0) 68%)` }}
          />
          <div
            className="relative flex flex-col items-center gap-1.5 rounded-2xl border bg-white px-4 py-3 text-center shadow-[0_22px_55px_-30px_rgba(15,23,42,0.5)]"
            style={{ borderColor: `rgba(${accent},0.3)` }}
          >
            {CoreIcon && (
              <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ backgroundColor: `rgba(${accent},0.09)`, color: `rgb(${accent})` }}>
                <CoreIcon className="h-4 w-4" />
              </span>
            )}
            <span className="font-outfit text-[13px] font-bold leading-tight tracking-[-0.01em] text-slate-900">{coreLabel}</span>
            {coreSub && (
              <span className="text-[9px] font-bold uppercase leading-tight tracking-[0.16em]" style={{ color: `rgb(${accent})` }}>
                {coreSub}
              </span>
            )}
          </div>
        </div>
      </div>
      {caption && <figcaption className="mt-3 text-center text-[11px] text-slate-400">{caption}</figcaption>}
    </figure>
  );
};

export default OrbitDiagram;
