"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { flight, smooth } from "@/lib/store";

/**
 * Sparse, dim particles that float across every page and drift with scroll at different depths.
 * Cursor nudges them aside. Plain 2D canvas, so it stays cheap on phones.
 * On the home page it fades in as the 3D flight ends (the WebGL scene owns the screen before that).
 */
type P = { x: number; y: number; z: number; ph: number; sp: number; r: number; c: string; ox: number; oy: number };

const COLORS = ["34,211,238", "139,92,246", "226,232,240", "34,211,238"];

export default function AmbientField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const path = usePathname();
  const isHome = path === "/";

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760;
    const count = coarse ? 34 : 80;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5);
    let W = 0;
    let H = 0;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rnd = (() => {
      let s = 1337;
      return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    })();
    const ps: P[] = Array.from({ length: count }, () => {
      const z = 0.25 + rnd() * 0.75;
      return {
        x: rnd(),
        y: rnd(),
        z,
        ph: rnd() * 6.283,
        sp: 0.15 + rnd() * 0.35,
        r: 0.7 + z * 1.5,
        c: COLORS[Math.floor(rnd() * COLORS.length)],
        ox: 0,
        oy: 0,
      };
    });

    const mouse = { x: -9999, y: -9999 };
    const move = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const leave = () => {
      mouse.x = mouse.y = -9999;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", leave, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);

    let raf = 0;
    let last = performance.now();
    let hasStage = true;
    let stageCheck = 0;
    let shown = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (document.hidden) return;

      if (now - stageCheck > 400) {
        stageCheck = now;
        hasStage = !!document.querySelector(".stage");
      }
      const target = isHome && hasStage ? smooth(Math.min(1, Math.max(0, flight.after * 1.6))) : 1;
      shown += (target - shown) * (1 - Math.exp(-dt * 5));
      cv.style.opacity = String(shown);
      if (shown < 0.01) return;

      const t = now / 1000;
      const sy = window.scrollY;
      ctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        // slow upward float, parallax with scroll, a little sideways wobble
        const fy = (((p.y - t * 0.006 * p.sp * 8 - (sy / H) * 0.22 * p.z) % 1) + 1) % 1;
        let px = p.x * W + Math.sin(t * p.sp + p.ph) * 14 * p.z;
        let py = fy * H + Math.cos(t * p.sp * 0.8 + p.ph) * 10 * p.z;

        // cursor push, eased back when it leaves
        const dx = px - mouse.x;
        const dy = py - mouse.y;
        const d = Math.hypot(dx, dy);
        let tx = 0;
        let ty = 0;
        if (d < 140) {
          const f = (1 - d / 140) ** 2 * 55 * p.z;
          tx = (dx / Math.max(d, 1)) * f;
          ty = (dy / Math.max(d, 1)) * f;
        }
        p.ox += (tx - p.ox) * Math.min(1, dt * 6);
        p.oy += (ty - p.oy) * Math.min(1, dt * 6);
        px += p.ox;
        py += p.oy;

        const tw = 0.7 + 0.3 * Math.sin(t * (0.8 + p.sp) + p.ph * 3);
        const a = 0.5 * p.z * tw;
        ctx.fillStyle = `rgba(${p.c},${(a * 0.22).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.r * 3.2, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = `rgba(${p.c},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, 6.283);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [isHome]);

  return <canvas ref={ref} className="ambient" aria-hidden="true" />;
}
