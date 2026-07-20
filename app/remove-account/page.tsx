import RemoveAccount from "@/components/common-components/RemoveAccount";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const ChangePasswordPage = () => {
  return (
    <main>
      <RemoveAccount />
    </main>
  );
};

export default ChangePasswordPage;