"use client";

import React from "react";

export function AnalogGrain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 opacity-[0.04] mix-blend-multiply"
      aria-hidden="true"
    >
      <svg className="h-full w-full">
        <filter id="booth-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#booth-grain)" />
      </svg>
    </div>
  );
}
