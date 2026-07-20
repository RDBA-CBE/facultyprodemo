import Home1Page from "./home1/page";

export const metadata = {
  title: "FacultyPro – Academic Job Portal for Faculty Recruitment",
  description:
    "FacultyPro connects qualified educators with top colleges and universities across India. Browse faculty, professor, and academic job openings today.",
  alternates: {
    canonical: "https://demo.facultypro.in",
  },
  openGraph: {
    title: "FacultyPro – Academic Job Portal for Faculty Recruitment",
    description:
      "Browse faculty and academic job openings at top colleges and universities across India.",
    url: "https://demo.facultypro.in",
    type: "website",
  },
};

export default function App() {
  return (
    <div>
      <Home1Page />
    </div>
  );
}
