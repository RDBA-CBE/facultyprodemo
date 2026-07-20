import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/jobs", "/jobs/", "/about", "/contact"],
        disallow: [
          "/job-detail/",
          "/profile/",
          "/saved-jobs",
          "/hr-registeration",
          "/hr-registration",
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
          "/api/",
        ],
      },
    ],
    sitemap: "https://demo.facultypro.in/sitemap.xml",
    host: "https://demo.facultypro.in",
  };
}
