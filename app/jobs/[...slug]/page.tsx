"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FRONTEND_URL } from "@/utils/constant.utils";
import Models from "@/imports/models.import";
import JobsPageClient from "../JobsPageClient";
import SkeletonLoader from "../SkeletonLoader";

type Status = "loading" | "single" | "list" | "notfound";

function slugToText(slug: string) {
  return slug.split("-").join(" ");
}

export default function JobSlugPage() {
  const params = useParams();
  const router = useRouter();

  const rawSlugParts = Array.isArray(params.slug) ? params.slug : [params.slug];

  // Decode percent-encoded slug (e.g. %26 → &, %3D → =) then extract &id=
  const rawFirst = decodeURIComponent(rawSlugParts[0] ?? "");
  const idFromSlug = rawFirst.match(/(?:&(?:amp;)?|\?)id=([^&]+)/)?.[1] ?? null;
  const numericId = idFromSlug ? Number(idFromSlug.split("-")[0]) : null;

  // Strip &id=... part from slug segments
  const slugParts = rawSlugParts.map((s) => decodeURIComponent(s ?? "").split(/[&?]/)[0]);
  const firstSegment = slugParts[0];
  const restSegments = slugParts.slice(1);

  const [status, setStatus] = useState<Status>("loading");
  const [singleJobId, setSingleJobId] = useState<any>(null);
  const [jobUrl, setJobUrl] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (!slugParts.length) return;

    // If &id=<numeric>-... was in the URL, use details API directly
    if (numericId && !isNaN(numericId)) {
      Models.job
        .details(numericId)
        .then((res: any) => {
          if (res?.id) {
            setSingleJobId(res.id);
            setStatus("single");
          } else {
            setStatus("notfound");
          }
        })
        .catch(() => setStatus("notfound"));
      return;
    }

    // /jobs/location/coimbatore → show jobs filtered by location name as search
    if (firstSegment === "location") {
      const term = restSegments.map(slugToText).join(" ");
      setSearchTerm(term);
      setStatus("list");
      return;
    }

    // /jobs/category/assistant/professor → show jobs filtered by category as search
    if (firstSegment === "category") {
      const term = restSegments.map(slugToText).join(" ");
      setSearchTerm(term);
      setStatus("list");
      return;
    }

    // /jobs/job-by-category/engineering/anna-university → show jobs list or single
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

          if (count === 0) {
            setStatus("notfound");
          } else if (count === 1) {
            setSingleJobId(results[0].id);
            setStatus("single");
          } else {
            setStatus("list");
          }
        })
        .catch(() => setStatus("notfound"));
      return;
    }

    // All other slugs → pass full URL to API
    const fullUrl = `${FRONTEND_URL}/jobs/${slugParts.join("/")}`;
    console.log('✌️fullUrl --->', fullUrl);

    setJobUrl(fullUrl);

    Models.job
      .byUrl(fullUrl)
      .then((res: any) => {
        const count = res?.count ?? 0;
        const results = res?.results ?? [];

        if (count === 0) {
          setStatus("notfound");
        } else if (count === 1) {
          setSingleJobId(results[0].id);
          setStatus("single");
        } else {
          setStatus("list");
        }
      })
      .catch(() => setStatus("notfound"));
  }, [slugParts.join("/")]);

  useEffect(() => {
    if (status === "notfound") {
      router.replace("/jobs");
    }
  }, [status]);

  if (status === "single" && singleJobId) {
    return (
      <JobsPageClient
        jobUrl={jobUrl || undefined}
        initialSearch={searchTerm || undefined}
        initialJobId={singleJobId}
      />
    );
  }

  if (status === "notfound") {
    return null;
  }

  if (status === "list") {
    return (
      <JobsPageClient
        jobUrl={jobUrl || undefined}
        initialSearch={searchTerm || undefined}
      />
    );
  }

  return (
    <div className="section-wid py-10 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonLoader key={i} type="text" width="100%" height={24} />
      ))}
    </div>
  );
}
