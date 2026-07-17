import type { Metadata } from "next";
import JobsPageClient from "./JobsPageClient";
import { FRONTEND_URL } from "@/utils/constant.utils";

export const metadata: Metadata = {
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
  openGraph: {
    title: "Faculty Jobs – Browse Academic Openings | FacultyPro",
    description:
      "Find faculty and academic job openings at top colleges and universities across India.",
    url: "https://www.facultypro.in/jobs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Faculty Jobs – FacultyPro",
    description:
      "Find faculty and academic job openings at top colleges and universities across India.",
  },
  alternates: {
    canonical: "https://www.facultypro.in/jobs",
  },
};

export default function JobsPage() {
  return <JobsPageClient jobUrl={`${FRONTEND_URL}/jobs`} />;
}
