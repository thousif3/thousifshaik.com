"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Google Analytics 4, loaded only when the GA_ID repo variable is set, and never for visitors who
 * send Do Not Track or Global Privacy Control. IP anonymization is on by default in GA4.
 */
export default function Analytics() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    setOk(Boolean(GA_ID) && navigator.doNotTrack !== "1" && !nav.globalPrivacyControl);
  }, []);
  if (!GA_ID || !ok) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}</Script>
    </>
  );
}
