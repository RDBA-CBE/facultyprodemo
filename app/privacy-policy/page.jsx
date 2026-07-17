
import Footer from "@/components/common-components/new_components/Footer";
import PrivacyPolicyPage from "../../components/common-components/PrivacyPolicyPage";

export const metadata = {
  title: "Privacy Policy – FacultyPro",
  description:
    "Read FacultyPro's privacy policy to understand how we collect, use, and protect your personal data on our academic recruitment platform.",
  alternates: {
    canonical: "https://www.facultypro.in/privacy-policy",
  },
  robots: { index: true, follow: true },
};

export default function page() {
  return (
    <>
      <PrivacyPolicyPage />
       <Footer/>
    </>
  );
}
