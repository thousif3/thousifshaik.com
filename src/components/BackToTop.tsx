"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { flight } from "@/lib/store";
import { scrollToTarget } from "./SmoothScroll";

/** Small, faint "back to top" arrow, bottom left. Appears once the page has scrolled a little. */
export default function BackToTop() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // On the home page the camera flight has its own controls in the corners, so the arrow
    // waits until the page has scrolled past the flight (the flat view has no flight at all).
    const onScroll = () =>
      setShow(window.scrollY > window.innerHeight * 0.8 && (pathname !== "/" || !document.querySelector(".stage") || flight.after > 0.02));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <button
      type="button"
      className={`to-top no-print ${show ? "to-top--on" : ""}`}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      onClick={() => {
        scrollToTarget(0);
        history.replaceState(null, "", location.pathname + location.search);
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
