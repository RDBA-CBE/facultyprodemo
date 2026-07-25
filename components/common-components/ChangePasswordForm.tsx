"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Failure, Success, useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";

import { Eye, EyeOff, Loader, ArrowRight } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import * as Yup from "yup";
import * as Validation from "@/utils/validation.utils";

const ChangePasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [id, setId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const idFromSearchParams = searchParams.get("id");
      const tokenFromSearchParams = searchParams.get("token");

      if (idFromSearchParams) {
        setId(idFromSearchParams);
      }
      if (tokenFromSearchParams) {
        setToken(tokenFromSearchParams);
      }
    }
  }, [searchParams]);

  const [state, setState] = useSetState({
    new_password: "",
    confirm_password: "",
    btnLoading: false,
    showConfirmPassword: false,
    showNewPassword: false,
    errors: {},
  });

  const handleFormChange = (field, value) => {
    setState({
      [field]: value,
      errors: {
        ...state.errors,
        [field]: "",
      },
    });
  };

  const handleSubmit = async () => {
    try {
      setState({ btnLoading: true, errors: {} });
      const body = {
        current_password: state.current_password,
        new_password: state.new_password,
        confirm_password: state.confirm_password,
      };

      // Assuming Validation.resetPassword exists and is similar to register validation
      await Validation.changePassword.validate(body, { abortEarly: false });

      const res: any = await Models.auth.change_password(body);

      setState({
        btnLoading: false,
        current_password: "",
        new_password: "",
        confirm_password: "",
        errors: {},
      });

      Success(res?.message || "Password changed successfully!");

      // window.dispatchEvent(new CustomEvent("openLoginModal"));
      router.push("/");
    } catch (error) {
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

  return (
    <div className="flex items-center justify-center min-h-screen  bg-clr1">
      <div className="w-full max-w-md space-y-6 bg-[#FFFCF3] py-8 px-10 rounded-xl shadow-2xl">
        <div className="flex items-center justify-center w-full mb-6">
          <img
            src="/assets/images/login.png"
            height={200}
            width={100}
            alt="Reset Password Illustration"
            className="object-contain"
          />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-600 text-sm">
            Create a new password for your account.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Input
              type="password"
              placeholder="Current Password"
              value={state.current_password || ""}
              onChange={(e) =>
                handleFormChange("current_password", e.target.value)
              }
              required
              bg="ffffff"
              error={state.errors?.current_password}
            />
          </div>

          <div className="relative">
            <Input
              type="password"
              placeholder="New Password"
              value={state.new_password || ""}
              onChange={(e) => handleFormChange("new_password", e.target.value)}
              required
              bg="ffffff"
              error={state.errors?.new_password}
            />
          </div>

          <div className="relative">
            <Input
              type="password"
              placeholder="Confirm Password"
              value={state.confirm_password || ""}
              onChange={(e) =>
                handleFormChange("confirm_password", e.target.value)
              }
              required
              bg="ffffff"
              error={state.errors?.confirm_password}
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          type="button"
          className="w-full py-3 bg-[#1E3786] hover:bg-amber-500 text-white font-bold rounded-3xl flex items-center justify-center gap-2"
          disabled={state.btnLoading}
        >
          {state.btnLoading ? (
            <Loader className="animate-spin" />
          ) : (
            "Reset Password"
          )}
          {!state.btnLoading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
