import React from "react";
import FeedbackForm from "@/components/common-components/feedbackForm";


const ApplicantAvailabilityPage = ({ params }) => {
  return (
    <main>
      <FeedbackForm token={params.token}/>

    </main>
  );
};

export default ApplicantAvailabilityPage;
