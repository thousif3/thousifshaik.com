import { useId } from "react";

/**
 * "TS" drawn as one line-art mark: the S swoops out of the T's crossbar, and a single glowing point
 * sits at the end of the stroke, like a point in the latent space the site is about.
 */
export default function Monogram({ size = 36, draw = false, className = "" }: { size?: number; draw?: boolean; className?: string }) {
  const id = useId();
  return (
    <svg className={`mono ${draw ? "mono--draw" : ""} ${className}`} width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="3" y1="6" x2="37" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path pathLength={1} d="M3 8 H26" />
        <path pathLength={1} d="M12 8 V33" />
        <path pathLength={1} d="M33 9.5 C29.5 7 22 7.5 22 13 C22 19 34 18 34 25.5 C34 32 26 33.5 21 30.5" />
      </g>
      <circle className="mono-dot" cx="21" cy="30.5" r="1.9" fill="#22d3ee" />
    </svg>
  );
}
