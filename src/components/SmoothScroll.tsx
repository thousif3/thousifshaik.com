"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

export function scrollToTarget(target: string | number | HTMLElement) {
  if (lenis) {
    lenis.resize(); // re-measure: after a page change Lenis still holds the previous page's height
    lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : -72, duration: 1.4 });
  }
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "smooth" });
  }
}

/** Lenis smooth scroll driven by GSAP's ticker, plus same-page anchor handling. */
export default function SmoothScroll() {
  const pathname = usePathname();

  // ---- once: smooth scroll + anchors ----
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("has-gsap");
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Same-page hash links (Work / Experience / Contact) are handled here, in the capture
    // phase, so Next's own hash scrolling can't fight the smooth scroll.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const el = document.querySelector(url.hash);
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      window.dispatchEvent(new Event("site:navigate")); // lets the mobile menu close (React never sees this click)
      scrollToTarget(el as HTMLElement);
      history.replaceState(null, "", url.hash);
    };
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
      document.documentElement.classList.remove("has-gsap");
    };
  }, []);

  // ---- every page: reveal + underline draw + hash on arrival ----
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Visibility is a function of what is on screen right now, not of scroll history, so a
    // fast jump (nav click, scrollbar drag, fast wheel) can never leave visible content hidden.
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const touch = window.matchMedia("(pointer: coarse)").matches; // blur filters are costly on phones
    const io = new IntersectionObserver(
      (entries) => {
        const show: HTMLElement[] = [];
        const hide: HTMLElement[] = [];
        for (const e of entries) {
          const el = e.target as HTMLElement;
          const vh = e.rootBounds?.height ?? window.innerHeight;
          if (e.isIntersecting) show.push(el);
          else if (e.boundingClientRect.top > vh * 0.5) hide.push(el); // below the viewport: reset so it replays
        }
        // overwrite:true kills any earlier tween on the same element at creation, so a delayed
        // hide can never start after (and undo) a show. Already-hidden elements need no tween.
        const toHide = hide.filter((el) => Number(gsap.getProperty(el, "opacity")) > 0.02);
        if (show.length)
          gsap.to(show, { opacity: 1, y: 0, ...(touch ? {} : { filter: "blur(0px)" }), stagger: 0.06, duration: 0.7, ease: "power3.out", overwrite: true });
        if (toHide.length)
          gsap.to(toHide, { opacity: 0, y: 24, ...(touch ? {} : { filter: "blur(6px)" }), stagger: 0.03, duration: 0.4, overwrite: true });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".draw-line").forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "top 55%", scrub: true } },
        );
      });
    });
    ScrollTrigger.refresh();

    // arriving with a hash (first load, or /work/talon/ -> /#contact). Next updates the URL a
    // moment after the page commits, so wait for the hash and its element, then scroll once.
    let tries = 0;
    const iv = setInterval(() => {
      tries += 1;
      const el = location.hash ? document.querySelector(location.hash) : null;
      if (el) {
        clearInterval(iv);
        scrollToTarget(el as HTMLElement);
      } else if (tries > 15) clearInterval(iv);
    }, 100);

    return () => {
      io.disconnect();
      ctx.revert();
      clearInterval(iv);
    };
  }, [pathname]);

  return null;
}
