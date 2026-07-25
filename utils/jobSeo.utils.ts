/**
 * Shared SEO utilities for job detail pages.
 * Used by both /jobs/[...slug]/page.tsx and /job-detail/[...slug]/page.tsx
 */

const BASEURL = "https://demofile.facultypro.in/api/";

export const SITE_URL = "https://demo.facultypro.in";

export async function fetchJobById(id: string) {
  try {
    const res = await fetch(`${BASEURL}jobs/${id}/`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Extracts a job ID from a slug string.
 * Handles two patterns:
 *   1. &id=175  → "assistant-professor&id=175-food-technology-coimbatore"
 *   2. trailing  → "assistant-professor-science-and-humanities-physics-coimbatore-180"
 */
export function extractJobIdFromSlug(rawSlug: string): string | null {
  // Pattern 1: &id=175 (explicit)
  const ampMatch = rawSlug.match(/[?&]id=(\d+)/);
  if (ampMatch) return ampMatch[1];

  // Pattern 2: trailing numeric ID at end of slug e.g. "...-coimbatore-180"
  const trailMatch = rawSlug.match(/-(\d+)$/);
  if (trailMatch) return trailMatch[1];

  return null;
}
export function getJobCanonicalUrl(job: any): string {
  const slug = job?.slug ?? "";
  if (slug) return `${SITE_URL}/jobs/${slug}`;
  return `${SITE_URL}/jobs`;
}

/** Extracts job title from API response (mirrors front-end job_title() util) */
export function getJobTitle(job: any): string {
  return capitalize(job?.roles?.[0]?.role_name || job?.job_title || "Faculty Job");
}

/** Build metadata fields shared between both job routes */
export function buildJobMetaFields(job: any) {
  // canonical is always derived from job.slug — never from the incoming URL
  const canonical  = getJobCanonicalUrl(job);
  const jobTitle   = getJobTitle(job);
  const collegeName = job.college?.name || job.college?.college_name || "";
  const department  = (job.department || []).map((d: any) => d.name).join(", ");
  const location    = (job.locations || []).map((l: any) => l.city).join(", ");
  const experience  = job.experiences?.name || "";

  const title = job.meta_title
    ? job.meta_title
    : collegeName
      ? `${jobTitle} at ${collegeName} | FacultyPro`
      : `${jobTitle} | FacultyPro`;

  const description = job.meta_description
    ? job.meta_description
    : job.job_description
      ? String(job.job_description).slice(0, 155)
      : [
          `Apply for ${jobTitle} position`,
          collegeName && `at ${collegeName}`,
          department  && `in ${department}`,
          location    && `— ${location}`,
          experience  && `| Experience: ${experience}`,
        ]
          .filter(Boolean)
          .join(" ") + ". Apply now on FacultyPro.";

  const image = job.college?.college_logo || `${SITE_URL}/og-default.png`;

  return { jobTitle, collegeName, department, location, experience, title, description, image, canonical };
}

/**
 * Try to parse a numeric value out of a salary string like "3-6 LPA" or "50000".
 * Returns { min, max } in INR (approximate) or null if unparseable.
 */
function parseSalaryRange(salaryStr: string): { min: number; max: number } | null {
  // Match patterns like "3-6 LPA", "3 - 6 LPA", "3LPA", "50000-80000"
  const lpaMatch = salaryStr.match(/(\d+(?:\.\d+)?)\s*[-–to]+\s*(\d+(?:\.\d+)?)\s*lpa/i);
  if (lpaMatch) {
    return {
      min: Math.round(parseFloat(lpaMatch[1]) * 100000),
      max: Math.round(parseFloat(lpaMatch[2]) * 100000),
    };
  }
  const singleLpa = salaryStr.match(/(\d+(?:\.\d+)?)\s*lpa/i);
  if (singleLpa) {
    const val = Math.round(parseFloat(singleLpa[1]) * 100000);
    return { min: val, max: val };
  }
  const numRange = salaryStr.match(/(\d{4,})\s*[-–]\s*(\d{4,})/);
  if (numRange) {
    return { min: parseInt(numRange[1]), max: parseInt(numRange[2]) };
  }
  // Unparseable (e.g. "As per college norms") — return null
  return null;
}

/**
 * Builds a Google-valid JobPosting JSON-LD object.
 * https://developers.google.com/search/docs/appearance/structured-data/job-posting
 *
 * Key rules:
 * - `url` in JSON-LD === canonical in <head> (both from job.slug)
 * - baseSalary omitted unless numeric min/max can be parsed
 */
export function buildJobPostingJsonLd(job: any): object {
  // Use job.slug as single source of truth — matches metadata canonical exactly
  const canonical   = getJobCanonicalUrl(job);
  const jobTitle    = getJobTitle(job);
  const collegeName = job.college?.name || job.college?.college_name || "Institution";
  const location    = (job.locations || []).map((l: any) => l.city).join(", ") || "India";
  const description = job.job_description
    ? String(job.job_description).slice(0, 500)
    : `${jobTitle} position at ${collegeName}.`;
  const logo        = job.college?.college_logo || `${SITE_URL}/og-default.png`;
  const datePosted  = job.created_at
    ? new Date(job.created_at).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: jobTitle,
    description,
    datePosted,
    hiringOrganization: {
      "@type": "Organization",
      name: collegeName,
      logo,
      ...(job.college?.college_website
        ? { sameAs: job.college.college_website }
        : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: location,
        addressCountry: "IN",
      },
    },
    employmentType: "FULL_TIME",
    // url matches metadata canonical — both sourced from job.slug
    url: canonical,
  };

  // baseSalary: only include if we can extract numeric min/max values.
  // Google requires numeric value/minValue/maxValue — description-only is invalid.
  const salaryStr = job.salary_range_obj?.name ?? "";
  const parsed = salaryStr ? parseSalaryRange(salaryStr) : null;
  if (parsed) {
    jsonLd.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: {
        "@type": "QuantitativeValue",
        minValue: parsed.min,
        maxValue: parsed.max,
        unitText: "YEAR",
      },
    };
  }
  // If salary is "As per college norms" or unparseable — omit baseSalary entirely

  if (job.experiences?.name) {
    jsonLd.experienceRequirements = job.experiences.name;
  }

  if (job.department?.length > 0) {
    jsonLd.occupationalCategory = job.department
      .map((d: any) => d.name)
      .join(", ");
  }

  return jsonLd;
}
