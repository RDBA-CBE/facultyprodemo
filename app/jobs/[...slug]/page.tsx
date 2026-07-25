import type { Metadata } from "next";
import JobSlugClient from "./JobSlugClient";
import {  fetchJobById,
  buildJobMetaFields,
  buildJobPostingJsonLd,
  extractJobIdFromSlug,
  SITE_URL, } from "@/utils/jobSeo.utils";

const BASEURL = "https://demofile.facultypro.in/api/";

async function fetchSeoCatList() {
  try {
    const res = await fetch(`${BASEURL}categories/?pagination=false`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Recursively search all subcategory nodes for a slug match */
function findBySlug(nodes: any[], slug: string): { title: string; description: string } | null {
  for (const node of nodes) {
    if (node.slug === slug) return { title: node.title, description: node.description };
    const children = node.subcategories ?? node.children ?? [];
    if (children.length) {
      const found = findBySlug(children, slug);
      if (found) return found;
    }
  }
  return null;
}

function toText(s: string) {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugParts = Array.isArray(slug) ? slug : [slug];
  const rawFirst = decodeURIComponent(slugParts[0] ?? "");
  const firstSegment = rawFirst.split(/[&?]/)[0];
  const restSegments = slugParts.slice(1);
  const canonical = `${SITE_URL}/jobs/${slugParts.join("/")}`;

  // --- Single job page: both &id=175 and trailing -180 patterns ---
  const jobId = extractJobIdFromSlug(rawFirst);
  if (jobId) {
    const job = await fetchJobById(jobId);

    if (job) {
      const { title, description, image, canonical: jobCanonical } = buildJobMetaFields(job);
      return {
        title,
        description,
        alternates: { canonical: jobCanonical },
        openGraph: {
          title,
          description,
          url: jobCanonical,
          type: "article",
          images: [{ url: image, width: 800, height: 600 }],
        },
        twitter: { card: "summary_large_image", title, description, images: [image] },
      };
    }
  }

  // --- SEO category list: match last URL segment against API data ---
  const lastSlug = slugParts[slugParts.length - 1];
  const seoCatData = await fetchSeoCatList();
  console.log('✌️seoCatData --->', seoCatData);

  if (seoCatData?.results?.length) {
    const allNodes = seoCatData.results.flatMap((cat: any) => [
      cat,
      ...(cat.subcategories ?? []),
    ]);
    const match = findBySlug(allNodes, lastSlug);
    console.log('✌️match --->', match);

    if (match) {
      const title = match.title ? `${match.title} | FacultyPro` : "Faculty Jobs | FacultyPro";
      const description = match.description ||
        "Browse faculty and academic job openings at top colleges and universities across India.";
      return {
        title,
        description,
        alternates: { canonical },
        openGraph: { title, description, url: canonical, type: "website" },
      };
    }
  }

  // --- Fallback: Category / location listing pages ---
  let title = "Faculty Jobs | FacultyPro";
  let description =
    "Browse faculty and academic job openings at top colleges and universities across India.";

  if (firstSegment === "job-by-category") {
    const category = toText(restSegments[0] || "");
    const college  = toText(restSegments[1] || "");
    title = college
      ? `${category} Jobs at ${college} | FacultyPro`
      : `${category} Faculty Jobs | FacultyPro`;
    description = college
      ? `Find ${category} faculty job openings at ${college}. Apply now on FacultyPro.`
      : `Browse ${category} faculty and academic job openings across India on FacultyPro.`;
  } else if (firstSegment === "job-by-location") {
    const location = restSegments.map(toText).join(", ");
    title = `Faculty Jobs in ${location} | FacultyPro`;
    description = `Find faculty and academic job openings in ${location}. Apply now on FacultyPro.`;
  } else if (firstSegment === "location") {
    const location = restSegments.map(toText).join(" ");
    title = `Faculty Jobs in ${location} | FacultyPro`;
    description = `Browse faculty job openings in ${location} on FacultyPro.`;
  } else if (firstSegment === "category") {
    const category = restSegments.map(toText).join(" ");
    title = `${category} Faculty Jobs | FacultyPro`;
    description = `Browse ${category} faculty job openings across India on FacultyPro.`;
  }

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}

export default async function JobSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugParts = Array.isArray(slug) ? slug : [slug];
  const rawFirst = decodeURIComponent(slugParts[0] ?? "");
  const jobId = extractJobIdFromSlug(rawFirst);

  let jsonLd: object | null = null;
  if (jobId) {
    const job = await fetchJobById(jobId);
    if (job) jsonLd = buildJobPostingJsonLd(job);
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <JobSlugClient />
    </>
  );
}
