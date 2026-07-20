import type { Metadata } from "next";
import JobSlugClient from "./JobSlugClient";
import {
  fetchJobById,
  buildJobMetaFields,
  buildJobPostingJsonLd,
  SITE_URL,
} from "@/utils/jobSeo.utils";

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

  // --- Single job page: /jobs/assistant-professor&id=175-food-technology-coimbatore ---
  const idMatch = rawFirst.match(/[?&]id=(\d+)/);
  if (idMatch) {
    const job = await fetchJobById(idMatch[1]);
    if (job) {
      // canonical is derived from job.slug inside buildJobMetaFields
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

  // --- Category / location listing pages ---
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
  const idMatch = rawFirst.match(/[?&]id=(\d+)/);
  const canonical = `${SITE_URL}/jobs/${slugParts.join("/")}`;

  let jsonLd: object | null = null;
  if (idMatch) {
    const job = await fetchJobById(idMatch[1]);
    // buildJobPostingJsonLd derives canonical from job.slug internally
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
