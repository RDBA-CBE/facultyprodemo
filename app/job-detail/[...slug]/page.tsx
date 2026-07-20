import type { Metadata } from "next";
import JobDetailClient from "./JobDetailClient";
import {
  fetchJobById,
  buildJobMetaFields,
  buildJobPostingJsonLd,
  SITE_URL,
} from "@/utils/jobSeo.utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugParts = Array.isArray(slug) ? slug : [slug];
  const jobId = slugParts[0];

  if (jobId && /^\d+$/.test(jobId)) {
    const job = await fetchJobById(jobId);
    if (job) {
      // canonical always from job.slug — same source as JSON-LD url
      const { title, description, image, canonical: jobCanonical } = buildJobMetaFields(job);
      return {
        title,
        description,
        robots: { index: false, follow: true },
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

  return {
    title: "Faculty Job | FacultyPro",
    description:
      "Browse faculty and academic job openings at top colleges and universities across India.",
    robots: { index: false, follow: true },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugParts = Array.isArray(slug) ? slug : [slug];
  const jobId = slugParts[0];

  let jsonLd: object | null = null;
  if (jobId && /^\d+$/.test(jobId)) {
    const job = await fetchJobById(jobId);
    // buildJobPostingJsonLd derives url from job.slug — matches metadata canonical
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
      <JobDetailClient params={params} />
    </>
  );
}
