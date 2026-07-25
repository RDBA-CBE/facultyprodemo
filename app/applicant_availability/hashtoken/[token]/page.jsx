import ApplicantAvailabilityForm from "@/components/common-components/applicantAvailabilityForm";
import React from "react";

const ApplicantAvailabilityPage = ({ params }) => {
  return (
    <main>
      <ApplicantAvailabilityForm token={params?.token} />
    </main>
  );
};

export default ApplicantAvailabilityPage;
