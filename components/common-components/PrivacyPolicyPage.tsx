"use client";

import Footer from "./new_components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <main className="bg-white">
        {/* HEADER */}
        <section className="section-wid border-b">
          <div className="mx-auto px-6 py-4 md:py-10 text-center">
            <h1 className="text-xl md:text-4xl font-medium text-gray-900">
              Privacy Policy
            </h1>
            <p className="mt-2 text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="section-wid mx-auto px-0  py-5 md:py-16 text-gray-700 leading-relaxed">
          <div className="space-y-8">
            <div>
              <h2 className="sub-ti font-semibold text-black mb-3">
                1. Introduction
              </h2>
              <ul className="list-disc space-y-2">
                <p>
                  FacultyPro is committed to protecting the privacy and personal
                  information of users who access and use the FacultyPro portal.
                  This Privacy Policy explains how we collect, use, store, and
                  protect your information when you interact with our platform.
                </p>
                <p>
                  By accessing or using the FacultyPro portal, you agree to the
                  collection and use of information in accordance with this
                  Privacy Policy.
                </p>
              </ul>
            </div>

            <div>
              <h2 className="sub-ti font-semibold text-black mb-3">
                2. Information We Collect
              </h2>
              <ul className="list-disc space-y-2">
                <p>
                  FacultyPro may collect personal and professional information
                  from users during registration and while using the platform.
                  This may include:
                </p>
                <p>
                  Personal identification information such as name, email
                  address, phone number, and contact details.
                </p>
                <p>
                  Professional information such as qualifications, experience,
                  resume details, academic specialization, and employment
                  history.
                </p>
                <p>
                  Institutional information provided by colleges or
                  organizations registering on the platform.
                </p>
                <p>
                  Technical information such as IP address, browser type, device
                  information, and usage data.
                </p>
              </ul>
            </div>

            <div>
              <h2 className="sub-ti font-semibold text-black mb-3">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc  space-y-2 mb-3">
                <p>
                  The information collected may be used for the following
                  purposes:
                </p>
              </ul>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  To create and manage user accounts on the FacultyPro portal.
                </li>
                <li>
                  To facilitate academic recruitment by connecting candidates
                  with institutions.
                </li>
                <li>
                  To allow institutions to review candidate profiles and
                  applications.
                </li>
                <li>
                  {" "}
                  To provide updates regarding job opportunities, recruitment
                  status, and platform notifications.{" "}
                </li>
                <li>
                  {" "}
                  To improve the functionality, performance, and user experience
                  of the platform{" "}
                </li>
                <li>
                  {" "}
                  To communicate important announcements, support responses, and
                  service updates.{" "}
                </li>
              </ul>
            </div>

            <div>
              <h2 className="sub-ti font-semibold text-black mb-3">
                4. Information Sharing
              </h2>
              <ul className="list-disc  space-y-2 mb-3">
                <p>
                  FacultyPro does not sell or rent personal information to third
                  parties. However, information may be shared in the following
                  circumstances:
                </p>
              </ul>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  With registered institutions for recruitment and job
                  application purposes.
                </li>
                <li>
                  With service providers who assist in maintaining and operating
                  the platform.
                </li>
                <li>When required by law, regulation, or legal process.</li>

                <li>
                  To protect the rights, safety, and security of the platform
                  and its users.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="sub-ti font-semibold text-black mb-3">
                5. Data Security
              </h2>
              <ul className="list-disc  space-y-2 mb-3">
                <p>
                  FacultyPro implements appropriate technical and organizational
                  measures to safeguard personal information from unauthorized
                  access, misuse, alteration, or disclosure. While we strive to
                  protect user information, no internet-based system can
                  guarantee complete security.
                </p>
              </ul>
            </div>

            <div>
              <h2 className="sub-ti font-semibold text-black mb-3">
                6. User Responsibilities
              </h2>
              <ul className="list-disc space-y-2">
                <p>
                  Users are responsible for ensuring that the information they
                  provide on the platform is accurate and up to date. Users
                  should also maintain the confidentiality of their login
                  credentials and account access.
                </p>
              </ul>
            </div>

            <div>
              <h2 className="sub-ti font-semibold text-black mb-3">
                7. Cookies and Usage Data
              </h2>
              <ul className="list-disc space-y-2">
                <p>
                  The FacultyPro portal may use cookies and similar technologies
                  to enhance user experience, analyze website traffic, and
                  improve platform performance.
                </p>
                <p>
                  Users may choose to disable cookies through their browser
                  settings; however, certain features of the platform may not
                  function properly.
                </p>
              </ul>
            </div>

            <div>
              <h2 className="sub-ti font-semibold text-black mb-3">
                8. Third Party Links
              </h2>
              <ul className="list-disc  space-y-2 mb-3">
                <p>
                  The FacultyPro portal may contain links to external websites
                  or services. FacultyPro is not responsible for the privacy
                  practices or content of such third party websites.
                </p>
              </ul>
            </div>

            <div>
              <h2 className="sub-ti font-semibold text-black mb-3">
                9. Changes to This Privacy Policy
              </h2>
              <ul className="list-disc space-y-2">
                <p>
                  FacultyPro reserves the right to update or modify this Privacy
                  Policy from time to time. Any changes will be posted on this
                  page, and users are encouraged to review the policy
                  periodically.
                </p>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
