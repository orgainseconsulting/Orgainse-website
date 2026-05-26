import React from "react";

/**
 * ORQYNE logo components — uses the official PNG assets in /public/orqyne/.
 *
 *   <OrqyneLogo />        full wordmark + "A product of ORGAINSE CONSULTING"
 *   <OrqyneMark />        icon-only mark (square)
 *
 * Logos are pre-optimised at 200 / 400 / 800 / 1200 widths and use
 * `srcSet` for crisp delivery on every viewport / DPR. Background is
 * transparent so the same asset works on light AND dark surfaces.
 */

const ORIGIN = "/orqyne";

export const OrqyneLogo = ({ className = "h-12", alt = "ORQYNE — a product of Orgainse Consulting" }) => (
  <img
    src={`${ORIGIN}/long-800.png`}
    srcSet={`${ORIGIN}/long-400.png 1x, ${ORIGIN}/long-800.png 2x, ${ORIGIN}/long-1200.png 3x`}
    alt={alt}
    width="1200"
    height="371"
    decoding="async"
    loading="eager"
    className={`${className} w-auto select-none`}
    draggable={false}
  />
);

export const OrqyneMark = ({ className = "h-8 w-8", alt = "ORQYNE" }) => (
  <img
    src={`${ORIGIN}/mark-400.png`}
    srcSet={`${ORIGIN}/mark-200.png 1x, ${ORIGIN}/mark-400.png 2x, ${ORIGIN}/mark-800.png 3x`}
    alt={alt}
    width="400"
    height="400"
    decoding="async"
    loading="lazy"
    className={`${className} object-contain select-none`}
    draggable={false}
  />
);

// Default export keeps backwards compat with earlier imports
export default OrqyneLogo;
