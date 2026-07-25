


"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FRONTEND_URL } from "@/utils/constant.utils";
import Models from "@/imports/models.import";
import JobsPageClient from "../JobsPageClient";
import JobDetailPage from "@/app/job-detail/[...slug]/JobDetailClient";
import { extractJobIdFromSlug } from "@/utils/jobSeo.utils";

type Status = "loading" | "single" | "list" | "notfound";

function slugToText(slug: string) {
  return slug.split("-").join(" ");
}

export default function JobSlugClient() {
  const params = useParams();
  const router = useRouter();

  const rawSlugParts = Array.isArray(params.slug) ? params.slug : [params.slug];

  const slugParts = rawSlugParts.map((s) => decodeURIComponent(s ?? "").split(/[&?]/)[0]);
  const firstSegment = slugParts[0];
  const restSegments = slugParts.slice(1);

  const [status, setStatus] = useState<Status>("loading");
  const [singleJobId, setSingleJobId] = useState<any>(null);
  const [jobUrl, setJobUrl] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (!slugParts.length) return;

    const rawSlug = rawSlugParts.map((s) => decodeURIComponent(s ?? "")).join("/");

    // Pattern 1: &id=175  Pattern 2: trailing -180
    const directId = extractJobIdFromSlug(rawSlug.split("/")[0]);
    if (directId) {
      setSingleJobId(directId);
      setStatus("single");
      return;
    }

    if (firstSegment === "location") {
      const term = restSegments.map(slugToText).join(" ");
      setSearchTerm(term);
      setStatus("list");
      return;
    }

    if (firstSegment === "category") {
      const term = restSegments.map(slugToText).join(" ");
      setSearchTerm(term);
      setStatus("list");
      return;
    }

    if (firstSegment === "job-by-category") {
      const term = restSegments.map(slugToText).join(" ");
      setSearchTerm(term);
      const fullUrl = `${FRONTEND_URL}/jobs/${slugParts.join("/")}`;
      setJobUrl(fullUrl);

      Models.job
        .byUrl(fullUrl)
        .then((res: any) => {
          const count = res?.count ?? 0;
          const results = res?.results ?? [];
          if (count === 0) setStatus("notfound");
          else if (count === 1) { setSingleJobId(results[0].id); setStatus("single"); }
          else setStatus("list");
        })
        .catch(() => setStatus("notfound"));
      return;
    }

    const fullUrl = `${FRONTEND_URL}/jobs/${slugParts.join("/")}`;
    setJobUrl(fullUrl);

    Models.job
      .byUrl(fullUrl)
      .then((res: any) => {
        const count = res?.count ?? 0;
        const results = res?.results ?? [];
        if (count === 0) setStatus("notfound");
        else if (count === 1) { setSingleJobId(results[0].id); setStatus("single"); }
        else setStatus("list");
      })
      .catch(() => setStatus("notfound"));
  }, [slugParts.join("/")]);

  useEffect(() => {
    if (status === "notfound") router.replace("/jobs");
  }, [status]);

  if (status === "notfound") return null;

  if (status === "list") {
    return <JobsPageClient jobUrl={jobUrl || undefined} initialSearch={searchTerm || undefined} />;
  }

  // Render job detail inline — URL stays unchanged
  if (status === "single" && singleJobId) {
    return <JobDetailPage params={Promise.resolve({ slug: [String(singleJobId)] })} />;
  }

  return <JobsPageClient />;
}
