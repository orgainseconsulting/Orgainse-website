import React from "react";

/**
 * Oversized "ORGAINSE" wordmark used as a background design element
 * (sits behind the footer / final CTA), mirroring orgainse.live.
 */
export const WordmarkBackdrop = ({ text = "ORGAINSE", className = "" }) => (
  <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden select-none ${className}`}>
    <p
      className="font-outfit font-extrabold leading-none text-center whitespace-nowrap"
      style={{
        fontSize: "clamp(4rem, 17vw, 16rem)",
        letterSpacing: "-0.05em",
        marginBottom: "-0.22em",
        color: "transparent",
        WebkitTextStroke: "1px rgba(15,23,42,0.10)",
        backgroundImage:
          "linear-gradient(180deg, rgba(37,99,235,0.10) 0%, rgba(15,23,42,0.05) 45%, rgba(15,23,42,0) 88%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
      }}
    >
      {text}
    </p>
  </div>
);

export default WordmarkBackdrop;
