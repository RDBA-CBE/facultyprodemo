"use client";

import { useRouter } from "next/navigation";
import { Failure, Success, useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";

import { Loader, ArrowRight } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import * as Yup from "yup";
import * as Validation from "@/utils/validation.utils";
import Modal from "./modal";

const ForgotPasswordForm = () => {
  const router = useRouter();

  const [state, setState] = useSetState({
    email: "",
    btnLoading: false,
    errors: {},
    successOpen: false,
  });

  const handleFormChange = (field: string, value: string) => {
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
        email: state.email,
      };

      // Assuming Validation.forgotPassword exists
      await Validation.forgotPassword.validate(body, { abortEarly: false });

      const res: any = await Models.auth.forget_password(body);

      setState({
        btnLoading: false,
        email: "",
        errors: {},
      });

      // Success(
      //   res?.message ||
      //     "Password reset link sent successfully! Please check your email."
      // );

      setState({ successOpen: true });

    } catch (error) {
      setState({ btnLoading: false });
      if (error instanceof Yup.ValidationError) {
        const validationErrors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setState({ errors: validationErrors });
      } else {
        console.log("error", error);
        Failure((error as any).error || "An error occurred. Please try again.");
      }
    }
  };

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-clr1">
      <div className="w-full max-w-md space-y-6 bg-[#FFFCF3] py-8 px-10 rounded-xl shadow-2xl">
        <div className="flex items-center justify-center w-full mb-6">
          <img
            src="/assets/images/login.png"
            height={200}
            width={100}
            alt="Forgot Password Illustration"
            className="object-contain"
          />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password
          </h2>
          <p className="text-gray-600 text-sm">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Input
              type="email"
              placeholder="Email Address"
              value={state.email || ""}
              onChange={(e) => handleFormChange("email", e.target.value)}
              required
              bg="ffffff"
              error={state.errors?.email}
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          type="button"
          className="w-full py-3 bg-[#1E3786]  hover:bg-amber-500 text-white font-bold rounded-3xl flex items-center justify-center gap-2"
          disabled={state.btnLoading}
        >
          {state.btnLoading ? (
            <Loader className="animate-spin" />
          ) : (
            "Send Reset Link"
          )}
          {!state.btnLoading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>

     <Modal
            isOpen={state.successOpen}
            setIsOpen={() => {
              setState({ errors: {}, successOpen: false });
              router.push("/");
            }}
            title="Password reset"
            width="auto"
            hideHeader={true}
            renderComponent={() => (
              <div className="relative h-fit bg-[#f3f4f6] flex flex-col items-center justify-center text-center p-8 overflow-hidden">
                <h2 className="text-xl font-bold text-green-500 mb-6 z-10">
                    Submited!
                </h2>
    
                <p className="text-gray-600  max-w-lg text-sm leading-relaxed z-10">
                  Password reset link sent successfully! Please check your email.
                </p>
              </div>
            )}
          />
          </>
  );
};

export default ForgotPasswordForm;
