import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found", robots: { index: false }, alternates: {} };

export default function NotFound() {
  return (
    <section className="nf">
      <p className="eyebrow">404 · lost in the space</p>
      <h1 className="nf-title">That page isn&apos;t on the map.</h1>
      <p className="nf-sub">The link may be old or mistyped. These all exist:</p>
      <p className="nf-links">
        <Link className="btn-p" href="/">Back to the space</Link>
        <Link className="btn-s" href="/#work">All work</Link>
        <Link className="btn-s" href="/resume/">Résumé</Link>
      </p>
    </section>
  );
}
