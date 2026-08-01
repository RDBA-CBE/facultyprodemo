import "./globals.css";
import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import Providers from "./providers";
import ScrollToTop from "../ScrollToTop";

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
  metadataBase: new URL("https://demo.facultypro.in/"),
  title: {
    default: "FacultyPro | Academic Recruitment Platform",
    template: "%s | FacultyPro",
  },
  description:
    "FacultyPro is an academic recruitment platform that connects qualified educators, faculty members, researchers, and academic professionals with colleges and institutions hiring for verified teaching and academic roles.",
  applicationName: "FacultyPro",
  openGraph: {
    title: "FacultyPro | Academic Recruitment Platform",
    description:
      "Find verified faculty jobs, create an academic profile, apply to colleges, and help institutions recruit qualified educators through FacultyPro.",
    siteName: "FacultyPro",
    url: "https://demo.facultypro.in/",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FacultyPro | Academic Recruitment Platform",
    description:
      "FacultyPro connects academic professionals with colleges and institutions hiring for verified faculty and academic roles.",
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
