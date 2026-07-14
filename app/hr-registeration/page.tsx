"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSetState, Success, Failure } from "@/utils/function.utils";
import CustomPhoneInput from "@/components/common-components/phoneInput";
import * as Yup from "yup";
import * as Validation from "@/utils/validation.utils";
import Models from "@/imports/models.import";
import { Input } from "@/components/ui/input";
import Modal from "@/components/common-components/modal";
import Footer from "@/components/common-components/new_components/Footer";

const HRRegistrationPage = () => {
  const router = useRouter();

  const [state, setState] = useSetState({
    username: "",
    email: "",
    institution: "",
    college: "",
    phone: "",
    submitting: false,
    successRegistraion: false,
    apiError: "",
    errors: {} as Record<string, string>,
  });

  // ✅ Correct state update (NO functional setState)
  const handleFormChange = (field: string, value: any) => {
    setState({
      [field]: value,
      apiError: "",
      errors: {
        ...state.errors,
        [field]: "",
      },
    });
  };

  // ✅ Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setState({ submitting: true });

      const body = {
        username: state.username,
        email: state.email,
        phone: state.phone,
        institution: state.institution,
        college: state.college,
        role: "hr",
      };

      // ✅ Yup validation
      await Validation.hrRegistrationSchema.validate(body, {
        abortEarly: false,
      });

      console.log("body", body);

      await Models.auth.hr_user(body);

      setState({
        username: "",
        email: "",
        institution: "",
        college: "",
        phone: "",
        errors: {},
        successRegistraion: true,
        apiError: ""
      });
      // router.push("/");
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: Record<string, string> = {};

        error.inner.forEach((err: any) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });

        // ✅ Correct state update
        setState({
          errors: validationErrors,
        });

        return;
      }

      // Failure("Registration failed");
      console.log("API error:", error);
      const msg = error?.response?.data?.error || error?.error || "Registration failed. Please try again.";
      setState({ apiError: msg });
    } finally {
      setState({ submitting: false });
    }
  };

  return (
    <>
      {" "}
      <div className="bg-[#1E3786] py-[10px] md:py-[10px] px-4 ">
          <div className="max-w-7xl 0px] mx-auto text-center">
            <h1 className="!text-white text-[24px] md:text-[35px] font-medium md:font-semibold">
              HR Registration Enquiry
            </h1>
          </div>
        </div>
      <section className="bg-gray-50  flex items-center justify-center py-8 pt-15 md:py-6 md:pt-20">
         
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-medium text-[#151515]">
                HR Registration Enquiry
              </h1>
              <p className="text-gray-600 mt-2">
                Fill the form to open an HR account to start managing
                recruitments.
              </p>
            </div>

            {/* ✅ Disable browser validation */}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter your Username"
                  value={state.username}
                  onChange={(e) => handleFormChange("username", e.target.value)}
                  className={state.errors.username ? "border-red-500" : ""}
                />
                {state.errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {state.errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={state.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  className={state.errors.email ? "border-red-500" : ""}
                />
                {state.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {state.errors.email}
                  </p>
                )}
              </div>

              {/* Institution */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Institution Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter institution"
                  value={state.institution}
                  onChange={(e) =>
                    handleFormChange("institution", e.target.value)
                  }
                  className={state.errors.institution ? "border-red-500" : ""}
                />
                {state.errors.institution && (
                  <p className="text-red-500 text-sm mt-1">
                    {state.errors.institution}
                  </p>
                )}
              </div>

              {/* College */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  College Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter college"
                  value={state.college}
                  onChange={(e) => handleFormChange("college", e.target.value)}
                  className={state.errors.college ? "border-red-500" : ""}
                />
                {state.errors.college && (
                  <p className="text-red-500 text-sm mt-1">
                    {state.errors.college}
                  </p>
                )}
              </div>

              {/* Phone */}
              <CustomPhoneInput
                title="Phone Number"
                value={state.phone}
                onChange={(value) => handleFormChange("phone", value)}
                error={state.errors.phone}
              />

              {/* API Error */}
              {state.apiError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {state.apiError}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={state.submitting}
                className="w-full bg-[#1E3786] text-white py-3 rounded-lg font-semibold hover:bg-[#162a69] transition disabled:opacity-50"
              >
                {state.submitting ? "Submitting..." : "Submit Your Interest"}
              </button>
            </form>
          </div>
        </div>
        <Modal
          isOpen={state.successRegistraion}
          setIsOpen={() => {
            setState({ errors: {}, successRegistraion: false });
          }}
          title="HR Enquiry Form"
          width="auto"
          hideHeader={true}
          renderComponent={() => (
            <div className="relative h-fit bg-[#f3f4f6] flex flex-col items-center justify-center text-center p-8 overflow-hidden">
              <h2 className="text-xl font-bold text-green-500 mb-6 z-10">
                Enquiry Form Submitted
              </h2>

              <p className="text-gray-600  max-w-lg text-sm leading-relaxed z-10">
                Thanks for your interest. We will contact you soon.
              </p>
            </div>
          )}
        />
        ;
      </section>
      <Footer />
    </>
  );
};

export default HRRegistrationPage;
