import VerifyEmailForm from "@/components/common-components/VerifyEmailForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const VerifyEmailPage = () => {
  return <VerifyEmailForm />;
};

export default VerifyEmailPage;