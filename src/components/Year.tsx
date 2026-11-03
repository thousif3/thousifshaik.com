"use client";

import { useEffect, useState } from "react";

/** Build-time year for the static HTML, corrected to the visitor's current year after load. */
export default function Year() {
  const [y, setY] = useState(new Date().getFullYear());
  useEffect(() => setY(new Date().getFullYear()), []);
  return <>{y}</>;
}
