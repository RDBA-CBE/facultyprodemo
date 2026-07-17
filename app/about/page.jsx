import Footer from "@/components/common-components/new_components/Footer";
import Aboutpage from "../../components/common-components/Aboutpage";

export const metadata = {
  title: "About FacultyPro – India's Academic Recruitment Platform",
  description:
    "Learn about FacultyPro, India's dedicated platform connecting qualified faculty with top colleges and universities. Our mission is to simplify academic hiring.",
  keywords: [
    "about FacultyPro",
    "academic recruitment platform India",
    "faculty hiring platform",
    "college recruitment portal",
  ],
  openGraph: {
    title: "About FacultyPro – India's Academic Recruitment Platform",
    description:
      "FacultyPro connects qualified educators with reputable colleges and institutions across India.",
    url: "https://www.facultypro.in/about",
    type: "website",
  },
  alternates: {
    canonical: "https://www.facultypro.in/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Aboutpage />
      <Footer />
    </>
  );
}
