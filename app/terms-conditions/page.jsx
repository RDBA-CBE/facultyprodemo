import Footer from "../../components/common-components/new_components/Footer";
import TermsConditionsPage from "../../components/common-components/TermsConditionsPage";

export const metadata = {
  title: "Terms & Conditions – FacultyPro",
  description:
    "Review the terms and conditions governing the use of FacultyPro, India's academic job portal for faculty recruitment.",
  alternates: {
    canonical: "https://www.facultypro.in/terms-conditions",
  },
  robots: { index: true, follow: true },
};

export default function page() {
  return (
    <>
    <TermsConditionsPage />
     <Footer/>
    </>
  );
}