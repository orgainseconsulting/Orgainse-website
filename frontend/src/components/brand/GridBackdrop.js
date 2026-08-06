import React from "react";

/**
 * Layered grid + drifting orb backdrop. Purely decorative.
 */
export const GridBackdrop = ({ variant = "hero", className = "" }) => (
  <div aria-hidden="true" className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
    <div
      className={variant === "hero" ? "absolute inset-0 org-grid-mesh opacity-[0.45]" : "absolute inset-0 org-grid-mesh-sm opacity-40"}
      style={{
        maskImage: "radial-gradient(at 50% 30%, black 20%, transparent 72%)",
        WebkitMaskImage: "radial-gradient(at 50% 30%, black 20%, transparent 72%)",
      }}
    />
    <div
      className="absolute -top-24 left-[18%] w-[520px] h-[520px] rounded-full blur-3xl org-orb-a"
      style={{ background: "radial-gradient(circle, rgba(37,99,235,0.30), transparent 62%)" }}
    />
    <div
      className="absolute top-[8%] right-[6%] w-[400px] h-[400px] rounded-full blur-3xl org-orb-b"
      style={{ background: "radial-gradient(circle, rgba(124,58,237,0.24), transparent 62%)" }}
    />
  </div>
);

export default GridBackdrop;
