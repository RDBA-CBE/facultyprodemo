// app/contact/page.js

import Footer from "@/components/common-components/new_components/Footer";
import ContactPage from "../../components/common-components/ContactPage";

export const metadata = {
  title: "Contact FacultyPro – Get in Touch",
  description:
    "Have questions or need support? Contact the FacultyPro team. We're here to help colleges and faculty candidates with their academic recruitment needs.",
  keywords: ["contact FacultyPro", "faculty recruitment support", "academic jobs helpdesk"],
  openGraph: {
    title: "Contact FacultyPro – Get in Touch",
    description: "Reach out to FacultyPro for support with academic recruitment and faculty job listings.",
    url: "https://www.facultypro.in/contact",
    type: "website",
  },
  alternates: {
    canonical: "https://www.facultypro.in/contact",
  },
};

export default function page() {
  return (
    <>
      <ContactPage />
      <Footer />
    </>
  );
}
