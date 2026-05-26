import React from "react";

/**
 * Typographic ORQYNE wordmark.
 * The "Q" carries an AI accent — an orbital ring + spark — to signal
 * the brand's RAG-grounded AI identity. Renders inline so it scales
 * with text and never blocks first paint.
 *
 * Brand color: #0073E6 (ORQYNE theme color, kept as the SOURCE-OF-TRUTH).
 * Accent gradient blends ORQYNE blue → Orgainse orange to bridge both brands.
 */
const OrqyneLogo = ({ className = "h-8", showTagline = false, mono = false }) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} aria-label="ORQYNE by Orgainse Consulting">
      <svg
        viewBox="0 0 220 56"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
        role="img"
      >
        <defs>
          <linearGradient id="orqyneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0073E6" />
            <stop offset="55%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="orqyneAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {/* Wordmark — uppercase, tight, geometric */}
        <text
          x="0"
          y="40"
          fontFamily="'Inter', 'SF Pro Display', system-ui, sans-serif"
          fontWeight="800"
          fontSize="34"
          letterSpacing="2"
          fill={mono ? "currentColor" : "url(#orqyneGrad)"}
        >
          ORQYNE
        </text>

        {/* AI orbital ring around the Q — subtle, premium feel */}
        <ellipse
          cx="59"
          cy="32"
          rx="22"
          ry="9"
          fill="none"
          stroke={mono ? "currentColor" : "url(#orqyneAccent)"}
          strokeWidth="1.5"
          opacity="0.85"
          transform="rotate(-22 59 32)"
        />
        {/* AI "spark" on the orbital path */}
        <circle
          cx="78"
          cy="22"
          r="2.4"
          fill={mono ? "currentColor" : "url(#orqyneAccent)"}
        />
      </svg>

      {showTagline && (
        <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-slate-500 hidden sm:inline-block leading-tight border-l border-slate-300 pl-3 ml-1">
          by Orgainse<br />Consulting
        </span>
      )}
    </div>
  );
};

export default OrqyneLogo;
