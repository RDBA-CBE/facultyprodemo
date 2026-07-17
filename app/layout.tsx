import "./globals.css";
import { Poppins, Roboto } from "next/font/google";
import Providers from "./providers";
import ScrollToTop from "../ScrollToTop";
import type { Metadata } from "next";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.facultypro.in"),
  title: {
    default: "FacultyPro – Academic Job Portal for Faculty Recruitment",
    template: "%s | FacultyPro",
  },
  description:
    "FacultyPro is a specialized academic recruitment platform connecting qualified educators with reputable colleges and institutions seeking excellence in teaching, research, and academic leadership.",
  keywords: [
    "faculty jobs",
    "professor jobs",
    "academic jobs",
    "college recruitment",
    "assistant professor",
    "associate professor",
    "teaching jobs India",
    "faculty recruitment",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.facultypro.in",
    siteName: "FacultyPro",
    title: "FacultyPro – Academic Job Portal for Faculty Recruitment",
    description:
      "Find faculty and academic jobs at top colleges and universities across India.",
    images: [
      {
        url: "/assets/images/footer_logo.png",
        width: 1200,
        height: 630,
        alt: "FacultyPro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FacultyPro – Academic Job Portal",
    description:
      "Find faculty and academic jobs at top colleges and universities across India.",
    images: ["/assets/images/footer_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${roboto.variable}`}>
      <body className="font-sans antialiased bg-white">
        <Providers>
          <ScrollToTop />
          {children}
        </Providers>
      </body>
    </html>
  );
}
