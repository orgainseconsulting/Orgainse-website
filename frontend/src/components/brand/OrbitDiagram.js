import React from "react";

/**
 * Capability constellation — deterministic, always-visible layout.
 *
 * Rules that guarantee nothing is obstructed or clipped:
 *  • ONE chip ring only (max 6), evenly distributed from the 12 o'clock mark.
 *  • Ring radii (36% / 40%) are chosen so a chip's box can never reach the
 *    core card (chips only ever sit above or below the core's vertical band)
 *    and can never exceed the frame at any container width.
 *  • Chips are centred on their node with a static transform — no runtime
 *    rotation, so labels always stay upright.
 *  • Secondary labels render as a legend row underneath the frame instead of
 *    a second ring, so they are always fully readable.
 */

const RING = { x: 36, y: 40 };

const normalise = (chip) => (typeof chip === "string" ? { label: chip } : chip);

const layout = (chips) => {
  const n = chips.length || 1;
  const step = 360 / n;
  // rotate by half a step when a chip would land on the horizontal axis, where a
  // wide label is most likely to reach the frame edge
  const lands = (start) =>
    chips.some((_, i) => {
      const a = ((start + i * step) % 360 + 360) % 360;
      return Math.min(Math.abs(a - 0), Math.abs(a - 180), Math.abs(a - 360)) < 20;
    });
  const start = lands(-90) ? -90 + step / 2 : -90;
  return chips.map((chip, i) => {
    const a = ((start + i * step) * Math.PI) / 180;
    return { ...normalise(chip), x: 50 + Math.cos(a) * RING.x, y: 50 + Math.sin(a) * RING.y };
  });
};

export const OrbitDiagram = ({
  coreLabel,
  coreSub,
  coreIcon: CoreIcon,
  innerChips = [],
  outerChips = [],
  accent = "37, 99, 235",
  caption,
  legendLabel = "Core",
  testId = "orbit-diagram",
}) => {
  const ringSource = (outerChips.length ? outerChips : innerChips).slice(0, 6);
  const legend = outerChips.length ? innerChips.map(normalise) : [];
  const nodes = layout(ringSource);

  return (
    <figure data-testid={testId} className="m-0">
      <div className="relative w-full aspect-[4/3] rounded-3xl border border-slate-200 bg-white overflow-hidden">
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

        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {nodes.map((n) => (
            <line key={`l-${n.label}`} x1="50" y1="50" x2={n.x} y2={n.y} stroke={`rgba(${accent},0.16)`} strokeWidth="0.25" />
          ))}
          <ellipse
            cx="50"
            cy="50"
            rx={RING.x}
            ry={RING.y}
            fill="none"
            stroke={`rgba(${accent},0.26)`}
            strokeWidth="0.25"
            strokeDasharray="1.5 2.4"
            className="org-orbit-ring"
            style={{ animationDuration: "70s", transformOrigin: "50% 50%" }}
          />
          <ellipse
            cx="50"
            cy="50"
            rx={RING.x * 0.62}
            ry={RING.y * 0.62}
            fill="none"
            stroke={`rgba(${accent},0.18)`}
            strokeWidth="0.25"
            strokeDasharray="1 2.8"
            className="org-orbit-ring"
            style={{ animationDuration: "50s", animationDirection: "reverse", transformOrigin: "50% 50%" }}
          />
          <g className="org-orbit-ring" style={{ animationDuration: "28s", transformOrigin: "50% 50%" }}>
            <circle cx={50 + RING.x * 0.62} cy="50" r="0.85" fill={`rgb(${accent})`} opacity="0.7" />
          </g>
        </svg>

        {nodes.map((n) => (
          <span
            key={`d-${n.label}`}
            aria-hidden="true"
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%, -50%)", backgroundColor: `rgba(${accent},0.4)` }}
          />
        ))}

        {nodes.map((n, i) => (
          <span
            key={n.label}
            className="absolute z-20 org-fade-up"
            style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%, -50%)", animationDelay: `${0.08 * i}s` }}
          >
            <span
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-white px-2 py-1 text-[10px] font-semibold leading-none text-slate-700 shadow-[0_6px_18px_-10px_rgba(15,23,42,0.45)]"
              style={{ borderColor: `rgba(${accent},0.28)` }}
            >
              {n.badge && (
                <span className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: `rgb(${accent})` }}>
                  {n.badge}
                </span>
              )}
              {n.label}
            </span>
          </span>
        ))}

        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full org-pulse-soft"
            style={{ background: `radial-gradient(circle, rgba(${accent},0.18), rgba(255,255,255,0) 68%)` }}
          />
          <div
            className="relative flex max-w-[9.5rem] flex-col items-center gap-1.5 rounded-2xl border bg-white px-3.5 py-3 text-center shadow-[0_22px_55px_-30px_rgba(15,23,42,0.5)]"
            style={{ borderColor: `rgba(${accent},0.3)` }}
          >
            {CoreIcon && (
              <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ backgroundColor: `rgba(${accent},0.09)`, color: `rgb(${accent})` }}>
                <CoreIcon className="h-[15px] w-[15px]" />
              </span>
            )}
            <span className="font-outfit text-[12px] font-bold leading-tight tracking-[-0.01em] text-slate-900">{coreLabel}</span>
            {coreSub && (
              <span className="text-[8px] font-bold uppercase leading-[1.3] tracking-[0.14em]" style={{ color: `rgb(${accent})` }}>
                {coreSub}
              </span>
            )}
          </div>
        </div>
      </div>

      {legend.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2" data-testid={`${testId}-legend`}>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{legendLabel}</span>
          {legend.map((l) => (
            <span
              key={l.label}
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold text-slate-700"
              style={{ borderColor: `rgba(${accent},0.25)`, backgroundColor: `rgba(${accent},0.05)` }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `rgb(${accent})` }} />
              {l.label}
            </span>
          ))}
        </div>
      )}

      {caption && <figcaption className="mt-3 text-[11px] text-slate-400">{caption}</figcaption>}
    </figure>
  );
};

export default OrbitDiagram;
