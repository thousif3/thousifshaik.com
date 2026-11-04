import type { Metadata, Viewport } from "next";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/inter-tight";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import Cursor from "@/components/Cursor";
import SmoothScroll from "@/components/SmoothScroll";
import TopBar from "@/components/TopBar";
import BackToTop from "@/components/BackToTop";
import AmbientField from "@/components/AmbientField";
import { person } from "@/lib/content";
import Analytics from "@/components/Analytics";
import { SITE_URL } from "@/lib/site";


const description = `${person.name}: MS Computer Science student (${person.gradTerm}) who builds self-hosted AI systems and runs them like products. CSM and CSPO certified.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${person.name} · AI Systems, Product & Operations`, template: `%s · ${person.name}` },
  description,
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: `${person.name} · AI Systems, Product & Operations`,
    description,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: `${person.name}, portfolio` }],
  },
  twitter: { card: "summary_large_image", images: ["/og-image.jpg"] },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = { themeColor: "#020408", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  url: SITE_URL,
  email: `mailto:${person.email}`,
  jobTitle: "AI Systems, Product & Program Management, Operations",
  alumniOf: [{ "@type": "CollegeOrUniversity", name: "Chaitanya Bharathi Institute of Technology" }],
  affiliation: { "@type": "CollegeOrUniversity", name: "Indiana University Indianapolis" },
  address: { "@type": "PostalAddress", addressLocality: "Indianapolis", addressRegion: "IN", addressCountry: "US" },
  hasCredential: ["Certified ScrumMaster (CSM)", "Certified Scrum Product Owner (CSPO)"],
  sameAs: [person.linkedin, person.github],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <Cursor />
        <SmoothScroll />
        <TopBar />
        <BackToTop />
        <AmbientField />
        <main id="main">{children}</main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Analytics />
      </body>
    </html>
  );
}
