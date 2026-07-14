"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader, CheckCircle } from "lucide-react";
import Models from "@/imports/models.import";
import { Failure, InfinitySuccess } from "./toast";

const VerifyEmailForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token"); // ✅ fetch token directly
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async () => {
    if (!token) {
      Failure("Invalid or missing verification token.");
      return;
    }

    try {
      setLoading(true);

      // If backend only needs token
      const res: any = await Models.auth.verify_email(token);

      setIsVerified(true);
      InfinitySuccess(res?.message || "Your email has been successfully verified.", handleLogin);

    } catch (error: any) {
      console.log("Verification error:", error);
      Failure(error?.error || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    sessionStorage.setItem("from_login_btn", "true");
    router.push("/");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("openLoginModal"));
    }, 300);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-clr1">
      <Card className="md:w-[400px] w-[320px] p-6">
        <CardHeader className="p-0 mb-4 flex flex-col items-center text-center">
          {isVerified && (
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          )}
          <CardTitle className="text-2xl">
            {isVerified ? "Verification Successful" : "Verify Email"}
          </CardTitle>
          <CardDescription className="text-center">
            {isVerified
              ? "Your email has been successfully verified."
              : "Click the button below to verify your email address."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {!isVerified && (
            <Button
              onClick={handleVerify}
              className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin" /> : "Verify Email"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailForm;
