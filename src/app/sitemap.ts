import type { MetadataRoute } from "next";
import { projects } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, priority: 1 },
    { url: `${SITE_URL}/resume/`, lastModified, priority: 0.8 },
    ...projects.map((p) => ({ url: `${SITE_URL}/work/${p.id}/`, lastModified, priority: 0.7 })),
  ];
}
