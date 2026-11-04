import { useId } from "react";

/**
 * "TS": a heavy, italic, angular mark. The T's bar is cut on a diagonal and runs into the
 * top of the S. On the loader (`draw`) the outlines trace themselves, then the letters fill in.
 */
export default function Monogram({ size = 40, draw = false, className = "" }: { size?: number; draw?: boolean; className?: string }) {
  const id = useId();
  const w = Math.round(size * (88 / 48));
  return (
    <svg className={`mono ${draw ? "mono--draw" : ""} ${className}`} width={w} height={size} viewBox="0 0 88 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="4" x2="88" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2aa9bf" />
          <stop offset="1" stopColor="#7358c9" />
        </linearGradient>
      </defs>
      <g transform="skewX(-12) translate(2 0)" stroke={`url(#${id})`} strokeWidth="1.4" strokeLinejoin="miter" fill={`url(#${id})`}>
        {/* T */}
        <path className="mono-l" pathLength={1} d="M10 5 H46 V16 H31 V43 H18 V16 H4 Z" />
        {/* S */}
        <path
          className="mono-l"
          pathLength={1}
          d="M54 5 H82 V15 H62 V19 H77 L83 25 V36 L77 43 H47 V33 H70 V29 H53 L47 23 V11 Z"
        />
      </g>
    </svg>
  );
}
