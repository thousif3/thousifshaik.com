"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { person } from "@/lib/content";
import Monogram from "./Monogram";
import { scrollToTarget } from "./SmoothScroll";

function useClock(timeZone: string) {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone, timeZoneName: "short" });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, [timeZone]);
  return now;
}

export default function TopBar() {
  const now = useClock(person.timeZone);
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // close on Escape (returning focus to the button) and whenever a menu link is used
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // same-page hash links are handled before React sees the click, so they announce themselves
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("site:navigate", close);
    return () => window.removeEventListener("site:navigate", close);
  }, []);

  return (
    <header className={`topbar ${open ? "topbar--open" : ""}`} aria-label="Site">
      <Link
        href="/"
        className="brand"
        aria-label={`${person.name}: back to the top`}
        onClick={(e) => {
          // already on the home page: Next would do nothing, so scroll to the very start ourselves
          if (pathname !== "/" || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          setOpen(false);
          scrollToTarget(0);
          history.replaceState(null, "", location.pathname + location.search);
        }}
      >
        <Monogram size={30} />
      </Link>
      <dl className="meta">
        <div>
          <dt>Currently</dt>
          <dd>{person.degree} · {person.gradTerm}</dd>
        </div>
        <div>
          <dt>Based in</dt>
          <dd>
            {person.city.split(",")[0]} <span className="tabular-nums">{now ? `(${now})` : ""}</span>
          </dd>
        </div>
      </dl>
      <button
        ref={btn}
        type="button"
        className="menu-btn"
        aria-expanded={open}
        aria-controls="site-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <nav id="site-nav" aria-label="Primary" className="links" onClick={() => setOpen(false)}>
        <Link href="/#work">Work</Link>
        <Link href="/#experience">Experience</Link>
        <Link href="/#contact">Contact</Link>
        <Link href="/resume/" className="resume-btn">Résumé ↗</Link>
      </nav>
    </header>
  );
}
