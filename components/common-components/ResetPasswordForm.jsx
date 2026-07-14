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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import { Failure, Success } from "../common-components/toast";
import * as Yup from "yup";
import { Eye, EyeOff, Loader } from "lucide-react";

import * as Validation from "@/utils/validation.utils";

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [id, setId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Ensure that searchParams are read only on the client side
    if (typeof window !== "undefined") {
      const idFromUrl = searchParams.get("id");
      const tokenFromUrl = searchParams.get("token");

      if (idFromUrl) {
        setId(idFromUrl);
      }
      if (tokenFromUrl) {
        setToken(tokenFromUrl);
      }
    }
  }, [searchParams]);

  const [isMounted, setIsMounted] = useState(false);

  const [state, setState] = useSetState({
    new_password: "",
    confirm_password: "",
    btnLoading: false,
  });

  useEffect(() => {
    setIsMounted(true); // Ensure component is only rendered on client
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setState({ btnLoading: true, errors: {} });
      const body = {
        reset_token: token,
        new_password: state.new_password,
        confirm_password: state.confirm_password,
      };

      await Validation.resetPassword.validate(body, { abortEarly: false });

      if (!token) {
        Failure("Invalid or expired password reset link.");
        setState({ btnLoading: false });
        return;
      }

      const res = await Models.auth.reset_password(body, token);

      Success(res?.message || "Password has been reset successfully.");
      window.dispatchEvent(new CustomEvent("openLoginModal"));
      router.push("/");

      setState({
        btnLoading: false,
        new_password: "",
        confirm_password: "",
      });

    } catch (error) {
      console.log("error: ", error);
      setState({ btnLoading: false });
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        setState({ errors: validationErrors });
      } else {
        console.log("error", error);

        Failure(error.error || "An error occurred. Please try again.");
      }
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-clr1">
      <Card className="md:w-[400px] w-[320px] p-6">
        <CardHeader className="p-0">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent className="mx-0 mt-4 pb-2">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="relative">
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="Enter Your New Password"
                    required
                    value={state.new_password}
                    onChange={(e) =>
                      setState({
                        new_password: e.target.value,
                        errors: { ...state.errors, new_password: "" },
                      })
                    }
                    error={state.errors?.new_password}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Enter Your Confirm Password"
                    required
                    value={state.confirm_password}
                    onChange={(e) =>
                      setState({
                        confirm_password: e.target.value,
                        errors: { ...state.errors, confirm_password: "" },
                      })
                    }
                    error={state.errors?.confirm_password}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  className="w-full py-3 bg-[#1E3786] hover:bg-amber-500 text-white font-bold rounded-3xl flex items-center justify-center gap-2"
                  disabled={state.btnLoading}
                >
                  {state.btnLoading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordForm;
