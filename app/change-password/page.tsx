import ChangePasswordForm from "@/components/common-components/ChangePasswordForm";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const ChangePasswordPage = () => {
  return (
    <main>
      <ChangePasswordForm />
    </main>
  );
};

export default ChangePasswordPage;