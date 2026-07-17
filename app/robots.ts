import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/jobs", "/about", "/contact", "/job-detail/"],
        disallow: [
          "/profile/",
          "/saved-jobs",
          "/hr-registeration",
          "/change-password",
          "/forget-password",
          "/reset-password",
          "/verify-email",
          "/remove-account",
          "/old-profile",
          "/profile1",
          "/home1",
          "/test",
          "/api/",
        ],
      },
    ],
    sitemap: "https://www.facultypro.in/sitemap.xml",
    host: "https://www.facultypro.in",
  };
}
