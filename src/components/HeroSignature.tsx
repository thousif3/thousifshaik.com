"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { SIGNATURE } from "@/lib/signature";

/** The owner's signature, drawn on stroke by stroke once the scene is ready. */
export default function HeroSignature({ ready }: { ready: boolean }) {
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ready || !svg.current) return;
    const paths = Array.from(svg.current.querySelectorAll("path"));
    const tl = gsap.timeline({ delay: 0.9 });
    let t = 0;
    for (const p of paths) {
      const dur = Math.max(0.25, p.getTotalLength() / 520);
      tl.fromTo(p, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, ease: "power1.inOut" }, t);
      t += dur * 0.75;
    }
    return () => {
      tl.kill();
    };
  }, [ready]);

  return (
    <svg ref={svg} className="sig" viewBox={`0 0 ${SIGNATURE.width} ${SIGNATURE.height}`} aria-hidden="true" fill="none">
      {SIGNATURE.paths.map((d, i) => (
        <path key={i} d={d} pathLength={1} />
      ))}
    </svg>
  );
}
