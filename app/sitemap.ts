import type { MetadataRoute } from "next";

const BASEURL = "https://demofile.facultypro.in/api/";
const SITE_URL = "https://demo.facultypro.in";

async function fetchSitemapUrls(): Promise<
  { url: string; updated_at: string }[]
> {
  try {
    const res = await fetch(`${BASEURL}jobs/urls`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.result ?? [];
  } catch {
    return [];
  }
}

/** Validates that a URL string is absolute, points to our domain, and has no query params (we never want ?filter= in sitemap) */
function isValidSitemapUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    // Must be our own domain
    if (u.hostname !== "demo.facultypro.in") return false;
    // No query-string filter pages (e.g. /jobs?category=...)
    if (u.search) return false;
    // Skip bare /jobs/ trailing-slash duplicates
    if (u.pathname === "/jobs/") return false;
    // Skip internal/private routes that are noindexed
    const blockedPrefixes = [
      "/job-detail/",
      "/profile",
      "/saved-jobs",
      "/hr-registeration",
      "/change-password",
      "/forget-password",
      "/reset-password",
      "/verify-email",
      "/remove-account",
      "/old-profile",
      "/profile1",
      "/home/",
      "/home1/",
      "/test/",
      "/jobs-list/",
      "/feedback/",
      "/applicant_availability/",
    ];
    if (blockedPrefixes.some((p) => u.pathname.startsWith(p))) return false;
    return true;
  } catch {
    // Unparseable URL — skip
    return false;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicUrls = await fetchSitemapUrls();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Deduplicate URLs — API can return same URL multiple times
  const seen = new Set<string>();

  const dynamicRoutes: MetadataRoute.Sitemap = dynamicUrls
    .filter((item) => {
      if (!item?.url || typeof item.url !== "string") return false;
      if (!isValidSitemapUrl(item.url)) return false;
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    })
    .map((item) => ({
      url: item.url,
      lastModified: new Date(item.updated_at),
      changeFrequency: "daily" as const,
      // Job detail slug pages (contain &id=) are higher priority than listing pages
      priority: item.url.match(/[?&]id=\d+/) ? 0.8 : 0.7,
    }));

  return [...staticRoutes, ...dynamicRoutes];
}
