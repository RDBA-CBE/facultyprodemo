"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  capitalizeFLetter,
  Failure,
  Success,
  useSetState,
} from "@/utils/function.utils";
import Models from "@/imports/models.import";

import { Eye, EyeOff, Loader, ArrowRight } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import * as Yup from "yup";
import * as Validation from "@/utils/validation.utils";
import { Textarea } from "../ui/textarea";

const RemoveAccount = () => {
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
    deleteAccountErrors: {},
    deleteAccountLoading: false,
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

  const submitDeleteAccountRequest = async () => {
    try {
      const body = {
        email: (state.deleteAccountEmail || "").trim(),
        phone: (state.deleteAccountPhone || "").trim(),
        reason_text: (
          capitalizeFLetter(state.deleteAccountReason) || ""
        ).trim(),
      };
      try {
        await Validation.deleteAccountSchema.validate(body, {
          abortEarly: false,
        });
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          const validationErrors = {};
          error.inner.forEach((err) => {
            validationErrors[err.path] = err.message;
          });
          setState({ deleteAccountErrors: validationErrors });
          return;
        }
        throw error;
      }

      setState({ deleteAccountLoading: true, deleteAccountErrors: {} });

      await Models.profile.delete_account(body);

      setState({
        deleteAccountLoading: false,
        showDeleteAccountModal: false,
      });
      Success("Account delete request submitted successfully");
      router.push("/");
    } catch (error) {
      if(error?.data?.error){
        Failure(error?.data?.error);
      }else{
        Failure(error?.error || "Failed to submit account delete request");
      }
      setState({ deleteAccountLoading: false });
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
            Delete Account Form
          </h2>
          <p className="text-gray-600 text-sm">
            Fill your details to delete your account.
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Input
              type="email"
              name="deleteAccountEmail"
              title="Email"
              value={state.deleteAccountEmail || ""}
              onChange={(e) =>
                setState({
                  deleteAccountEmail: e.target.value,
                  deleteAccountErrors: {
                    ...state.deleteAccountErrors,
                    email: "",
                  },
                })
              }
              placeholder="Enter email"
              className="mt-1"
              required
              bg="ffffff"
              error={state.deleteAccountErrors?.email}
            />
          </div>

          <div className="relative">
            <Input
              title="Phone Number"
              value={state.deleteAccountPhone || ""}
              onChange={(e) =>
                setState({
                  deleteAccountPhone: e.target.value,
                  deleteAccountErrors: {
                    ...state.deleteAccountErrors,
                    phone: "",
                  },
                })
              }
              placeholder="Enter phone number"
              className="mt-1"
              required
              bg="ffffff"
              error={state.deleteAccountErrors?.phone}
            />
            {/* <Input
              type="password"
              placeholder="New Password"
              value={state.new_password || ""}
              onChange={(e) => handleFormChange("new_password", e.target.value)}
              required
              bg="ffffff"
              error={state.errors?.new_password}
            /> */}
          </div>

          <div className="relative">
            <Textarea
              title="Reason"
              value={state.deleteAccountReason || ""}
              onChange={(e) =>
                setState({
                  deleteAccountReason: e.target.value,
                  deleteAccountErrors: {
                    ...state.deleteAccountErrors,
                    reason_text: "",
                  },
                })
              }
              placeholder="Tell us why you want to delete this account"
              className="mt-1 min-h-[80px]"
              required
              bg="ffffff"
              error={state.deleteAccountErrors?.reason_text}
            />
          </div>
        </div>

        <Button
          onClick={submitDeleteAccountRequest}
          type="button"
          className="w-full py-3 bg-[#1E3786] hover:bg-amber-500 text-white font-bold rounded-3xl flex items-center justify-center gap-2"
          disabled={state.deleteAccountLoading}
        >
          {state.deleteAccountLoading ? (
            <Loader className="animate-spin" />
          ) : (
            "Submit"
          )}
          {!state.deleteAccountLoading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default RemoveAccount;
