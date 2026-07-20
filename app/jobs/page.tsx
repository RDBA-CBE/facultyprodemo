import type { Metadata } from "next";
import JobsPageClient from "./JobsPageClient";
import { FRONTEND_URL } from "@/utils/constant.utils";

const CANONICAL_JOBS = "https://demo.facultypro.in/jobs";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = Object.keys(params).length > 0;

  // Filter URLs (/jobs?category=..., /jobs?location=...) should not be indexed
  // as separate pages — they are thin/duplicate content. Canonical always points
  // to the clean /jobs URL.
  if (hasFilters) {
    return {
      title: "Faculty Jobs – Browse Academic Openings",
      description:
        "Browse faculty and academic job openings at top colleges and universities across India.",
      robots: { index: false, follow: true },
      alternates: { canonical: CANONICAL_JOBS },
    };
  }

  return {
    title: "Faculty Jobs – Browse Academic Openings",
    description:
      "Browse hundreds of faculty and academic job openings at top colleges and universities across India. Find assistant professor, associate professor, and other teaching positions.",
    keywords: [
      "faculty jobs",
      "professor jobs",
      "academic jobs India",
      "assistant professor vacancy",
      "college teaching jobs",
      "university jobs",
    ],
    alternates: { canonical: CANONICAL_JOBS },
    openGraph: {
      title: "Faculty Jobs – Browse Academic Openings | FacultyPro",
      description:
        "Find faculty and academic job openings at top colleges and universities across India.",
      url: CANONICAL_JOBS,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Faculty Jobs – FacultyPro",
      description:
        "Find faculty and academic job openings at top colleges and universities across India.",
    },
  };
}

export default function JobsPage() {
  return <JobsPageClient jobUrl={`${FRONTEND_URL}/jobs`} />;
}
