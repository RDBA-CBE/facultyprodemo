"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Loader,
  Building,
  MapPin,
  Calendar,
  Mail,
  ArrowRight,
  CheckCircle,
  XCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSetState,
  Failure,
  Success,
  capitalizeFLetter,
  formatScheduleDateTime,
} from "@/utils/function.utils";
import Models from "@/imports/models.import";
import TextArea from "./textArea";
import { TextInput } from "./textInput";
import * as Yup from "yup";
import * as Validation from "@/utils/validation.utils";

const ApplicantAvailabilityForm = ({ token: propToken }) => {
  console.log("✌️propToken --->", propToken);
  const router = useRouter();

  const [state, setState] = useSetState({
    loading: true,
    token: propToken || "",
    job: null,
    round: null,
    candidate: null,
    isAvailable: true,
    availableTime: "",
    reason: "",
    btnLoading: false,
    errors: {},
    response_from_applicant: false,
    availabilityNote: "",
  });
  console.log("✌️response_from_applicant --->", state.response_from_applicant);

  useEffect(() => {
    if (propToken) {
      setState({ token: propToken });
      fetchInterviewDetails(propToken);
    }
  }, [propToken]);

  const fetchInterviewDetails = async (token) => {
    try {
      const res: any = await Models.applications.get_applicant_feedback(token);
      console.log("✌️res --->", res);
      setState({
        job: res?.applications?.length > 0 ? res?.applications?.[0] : null,
        loading: false,
        detail: res,
      });
      if (res?.applications?.length > 0) {
        if (res?.applications?.[0]?.interview_slots?.length > 0) {
          setState({
            response_from_applicant:
              res?.applications?.[0]?.interview_slots?.[0]
                ?.response_from_applicant,
            availabilityNote: "",
          });
        }
      }
    } catch (error) {
      Failure("Invalid or expired link");
      setState({ loading: false });
    }
  };

  console.log("job", state?.job);
  

  const handleSubmit = async () => {
    try {
      setState({ btnLoading: true, errors: {} });

      const validation = {
        isAvailable: state.isAvailable,
        availabilityNote: state.availabilityNote,
      };
      await Validation.applicant_feedback.validate(validation, {
        abortEarly: false,
      });

      const body = {
        is_available: state.isAvailable,
        feedback_text:
          state.isAvailable === "Yes"
            ? ""
            : state.availabilityNote,
        panel_id: state.detail?.panel_ids?.[0],
      };

      const res = await Models.applications.create_applicant_feedback(
        body,
        propToken
      );

      Success("Availability updated successfully!");
      router.push("/jobs");
      setState({ btnLoading: false, errors: {} });
    } catch (error) {
      setState({ btnLoading: false });
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ errors: validationErrors });
      } else {
        if (error?.data?.error) {
          Failure(capitalizeFLetter(error?.data?.error));
          console.log("error", error);
        }
      }
    }
  };

  const getLocationNames = () => {
    if (!state.job?.job_detail?.locations) return "";
    return state.job?.job_detail?.locations.map((loc) => loc.city).join(", ");
  };

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Loader className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-indigo-50 border rounded-xl shadow">
          <div className="text-center  mt-4">
            <h1 className="text-2xl font-bold text-[#1E3786]">
              Interview Availability
            </h1>

            <p className="text-sm text-gray-500">
              Please confirm your availability for the scheduled interview
            </p>
          </div>

          <div className="p-4 items-center flex gap-4">
            {state.job?.job_detail?.college?.college_logo && (
              <img
                src={state.job?.job_detail?.college?.college_logo}
                alt="College Logo"
                className="w-16 h-16 rounded-xl bg-white object-contain border-2 border-white shadow-md"
              />
            )}
            <div className="space-y-1 ">
              <h2 className="text-xl font-bold text-gray-800">
                {state.job?.job_title}
              </h2>
              <div className=" flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-[#ffb400]" />
                  {state.job?.job_detail?.college?.name}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#ffb400]" />
                  {state.job?.job_detail?.locations
                    ?.map((l) => l.city)
                    .join(", ")}
                </span>

                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#ffb400]" />
                  {formatScheduleDateTime(
                    state.job?.interview_slots?.[0]?.scheduled_date,
                    state.job?.interview_slots?.[0]?.scheduled_time
                  )}

                  {/* {state.job?.interview_slots?.[0]?.scheduled_date} */}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t"></div>
          {state.job?.interview_slots?.length > 0 &&
            state.job?.interview_slots?.[0] && (
              <div className=" p-4">
                <h3 className="font-semibold mb-3">Interview Schedule</h3>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Round</p>
                    <p className="font-semibold">
                      {state.job?.interview_slots?.[0]?.round_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-semibold">
                      {formatScheduleDateTime(
                        state.job?.interview_slots?.[0]?.scheduled_date,
                        state.job?.interview_slots?.[0]?.scheduled_time
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-semibold">
                      {" "}
                      {state.job?.interview_slots?.[0]?.status}
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className=" p-4 space-y-2 ">
            <h3 className="font-semibold">Your Availability</h3>

            <select
              value={state.isAvailable}
              onChange={(e) => setState({ isAvailable: e.target.value })}
              className="w-full border rounded-lg p-3 bg-white"
            >
              <option value="">Are you available for this interview?</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          {state.isAvailable == "No" && (
            <div className=" p-4 space-y-2">
              <h3 className="font-semibold">
                When are you available? <span className="text-red-500">*</span>
              </h3>

              <textarea
                rows={3}
                placeholder="Please provide your availability with reason for unavailability"
                className="w-full border rounded-lg p-3"
                value={state.availabilityNote}
                onChange={(e) =>
                  setState({ availabilityNote: e.target.value })
                }
              />
              {state.errors?.availabilityNote && (
                <p className=" pl-1 text-sm text-red-600">
                  {state.errors?.availabilityNote}{" "}
                  {/* Display the error message if it exists */}
                </p>
              )}
            </div>
          )}

          <div className=" flex items-center justify-end p-3">
            <Button
              onClick={handleSubmit}
              disabled={state.btnLoading}
              className="  py-3 bg-[#1E3786] hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
              {state.btnLoading ? (
                <Loader className="animate-spin h-4 w-4" />
              ) : (
                "Submit Response"
              )}

              {!state.btnLoading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantAvailabilityForm;
