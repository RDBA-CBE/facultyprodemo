"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader,
  Building,
  MapPin,
  Calendar,
  Mail,
  ArrowRight,
  User,
  FileText,
  School,
  Briefcase,
  BrainCircuit,
  MessageSquare,
  Smile,
  Award,
  CheckCircle2,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  useSetState,
  Failure,
  Success,
  capitalizeFLetter,
  formatScheduleDateTime,
} from "@/utils/function.utils";

import Models from "@/imports/models.import";
import Link from "next/link";
import Modal from "./modal";

const ratingOptions = [
  "Strongly Recommended",
  "Recommended",
  "Not Recommended",
  "Strongly Not Recommended",
];

const RatingField = ({
  label,
  icon: Icon,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
}) => (
  <div className=" py-1 transition-all ">
    <div className="mb-2 flex items-center gap-2">
      <div className="rounded-md bg-white p-1.5 shadow-sm ring-1 ring-slate-100">
        {Icon && <Icon className="h-4 w-4 text-indigo-600" />}
      </div>
      <h4 className="font-semibold text-gray-900 text-sm">{label}</h4>
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1">
        <select
          value={rating}
          onChange={(e) => onRatingChange(e.target.value)}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-shadow"
        >
          <option value="">Select Level</option>
          {ratingOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <textarea
          rows={1}
          placeholder="Add details..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-shadow resize-none"
        />
      </div>
    </div>
  </div>
);

const feedbackFields: [string, (fb: any) => string][] = [
  ["Same As Applicant", (fb) => (fb.is_same_as_applicant ? "Yes" : "No")],
  ["Academic Record", (fb) => fb.academic_record_remark],
  ["Experience", (fb) => fb.experience_remark],
  ["Knowledge Rating", (fb) => fb.knowledge_rating],
  ["Knowledge Detail", (fb) => fb.knowledge_detail],
  ["Communication Rating", (fb) => fb.communication_skills_rating],
  ["Communication Comment", (fb) => fb.communication_skills_comment],
  ["Attitude Rating", (fb) => fb.attitude_rating],
  ["Attitude Comment", (fb) => fb.attitude_comment],
  ["Overall Assessment", (fb) => fb.overall_assessment_rating],
  ["Overall Remark", (fb) => fb.overall_assessment_remark],
  ["Position Recommendation", (fb) => fb.position_recommendation],
  ["Recommendation Comment", (fb) => fb.recommendation_comments],
];

const PanelAccordionList = ({ feedbacks, panels }: { feedbacks: any[]; panels: any[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!feedbacks?.length)
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No feedback submitted for this round yet.
      </div>
    );

  return (
    <div className="space-y-2 min-h-[50vh] max-h-[80vh] overflow-y-auto p-1 py-3">
      {feedbacks.map((fb: any, i: number) => {
        const isOpen = openIndex === i;
        const name = fb.panel_name || fb.panel?.name || `Panel Member ${i + 1}`;
        const designation = fb.panel?.designation;
        const panelInfo = panels?.find((p: any) => p.id === (fb.panel_id || fb.panel?.id));
        const isDecisionMaker = panelInfo?.decision_maker === true;

        return (
          <div
            key={i}
            className={`rounded-lg overflow-hidden border ${
              // isDecisionMaker ? "border-[#1E3786] ring-1 ring-[#1E3786]/20" : 
              "border-gray-200"
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left ${
                isDecisionMaker ? "bg-indigo-50 hover:bg-indigo-100" : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  isDecisionMaker ? "bg-[#1E3786] text-white" : "bg-indigo-100 text-indigo-700"
                }`}>
                  {name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${isDecisionMaker ? "text-[#1E3786]" : "text-gray-900"}`}>
                      {name}
                    </p>
                    {isDecisionMaker && (
                      <span className="px-2 pt-1 pb-0.5 rounded text-[10px] bg-[#1E3786] text-white  tracking-wide">
                        Decision Maker
                      </span>
                    )}
                  </div>
                  {designation && <p className="text-xs text-gray-500">{designation}</p>}
                </div>
              </div>
              <ArrowRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""} ${
                isDecisionMaker ? "text-[#1E3786]" : "text-gray-400"
              }`} />
            </button>

            {isOpen && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-2 !gap-2">
                  {feedbackFields.map(([label, getValue]) => (
                    <div key={label} className="bg-gray-50 border rounded p-2">
                      <p className="text-xs text-gray-500 font-medium">{label}</p>
                      <p className="text-gray-800 font-semibold text-xs mt-0.5">{getValue(fb) || "—"}</p>
                    </div>
                  ))}
                </div>
                {fb.submitted_at && (
                  <p className="text-[10px] text-gray-400 mt-3 text-right">
                    Submitted: {new Date(fb.submitted_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const FeedbackAccordion = ({ allSlots, panels }: { allSlots: any[]; panels: any[] }) => {
  const [activeRound, setActiveRound] = useState(0);

  if (!allSlots?.length)
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No feedback available from other panel members yet.
      </div>
    );

  const currentSlot = allSlots[activeRound];

  return (
    <div className="max-h-[75vh] overflow-y-auto">
      {/* Round Tabs */}
      <div className="flex gap-2 mb-4 border-b py-3">
        {allSlots.map((slot: any, i: number) => (
          <button
            key={slot.id}
            onClick={() => setActiveRound(i)}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
              activeRound === i
                ? "bg-[#1E3786] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {slot.round_name}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activeRound === i ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {slot.decision_maker_feedbacks?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Feedbacks for active round */}
      <PanelAccordionList
        feedbacks={currentSlot?.decision_maker_feedbacks || []}
        panels={panels}
      />
    </div>
  );
};

const FeedbackForm = ({ token }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const panelId = searchParams.get("panel_id");
  console.log("panelId", panelId);
  

  const [state, setState] = useSetState({
    loading: false,
    btnLoading: false,

    job: null,
    candidate: null,
    round: null,
    interview_slot: null,

    evaluator_name: "",
    email: "",
    position: "",

    is_same_as_applicant: "",

    academic_record_remark: "",
    experience_remark: "",

    knowledge_rating: "",
    knowledge_detail: "",

    communication_skills_rating: "",
    communication_skills_comment: "",

    attitude_rating: "",
    attitude_comment: "",

    overall_assessment_rating: "",
    overall_assessment_remark: "",

    position_recommendation: "",
    recommendation_comments: "",

    showFeedbackModal: false,
    feedbacks: [],
    errors: {},
  });

  /* ---------------- FETCH INTERVIEW DETAILS ---------------- */

  useEffect(() => {
    if (token) fetchInterviewDetails();
  }, [token]);

  const fetchInterviewDetails = async () => {
    try {
      setState({ loading: true });

      const res: any = await Models.applications.interview_feedback(token);

      const app = res?.applications?.[0];
      const allSlots = app?.all_slots || [];
      const slotData = app?.interview_slots?.[0];

      setState({
        job: res?.applications?.[0],
        round: res?.round,
        candidate: res?.candidate,
        interview_slot: slotData,
        position: res?.panel?.designation,
        loading: false,
        panels: res?.panels?.find((p: any) => p.id === Number(panelId)) || null,
        panels_all: res?.panels || [],
        all_slots: allSlots,
        feedbacks: allSlots.flatMap((s: any) => s.decision_maker_feedbacks || []),
      });
    } catch (error) {
      setState({ loading: false });

      if (error?.data?.error) {
        Failure(capitalizeFLetter(error.data.error));
      }
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    try {
      setState({ btnLoading: true });

      const body = {
        interview_slot_id: state.interview_slot?.id,
        panel_id: Number(panelId),
        application_id: state.interview_slot?.application_ids?.[0],

        is_same_as_applicant:
          state.is_same_as_applicant == "Yes" ? true : false,

        academic_record_remark: state.academic_record_remark,
        experience_remark: state.experience_remark,

        knowledge_rating: state.knowledge_rating,
        knowledge_detail: state.knowledge_detail,

        communication_skills_rating: state.communication_skills_rating,
        communication_skills_comment: state.communication_skills_comment,

        attitude_rating: state.attitude_rating,
        attitude_comment: state.attitude_comment,

        overall_assessment_rating: state.overall_assessment_rating,
        overall_assessment_remark: state.overall_assessment_remark,

        position_recommendation: state.position_recommendation,
        recommendation_comments: state.recommendation_comments,
      };
      console.log("✌️body --->", body);

      await Models.applications.create_interview_feedback(body);
      setState({ btnLoading: false });

      Success("Feedback submitted successfully");

      router.push("/jobs");
    } catch (error) {
      setState({ btnLoading: false });

      if (error?.data?.error) {
        Failure(capitalizeFLetter(error.data.error));
      }
    }
  };

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-4">
      <div className="section-wid mx-auto">
        {/* Header Section */}
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-2xl font-bold text-[#1E3786] tracking-tight">
            Interview Feedback
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            Please review the candidate&apos;s performance and provide your
            detailed assessment below.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 !gap-2 items-start">
          {/* Left Column - Evaluation Form */}
          <div className="lg:col-span-2 order-2 lg:order-1 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto scrollbar-hide hover:scrollbar-default border">
            {/* Main Feedback Form */}
            <Card className=" !rounded-none shadow-md border-0 ring-1 ring-gray-200">
              <CardHeader className="bg-gray-50/50 border-b pb-3 py-3">
                <CardTitle className="text-lg text-[#1E3786]">
                  Evaluation Form
                </CardTitle>
                <CardDescription className="text-xs">
                  Fill in the details below based on the interview performance.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Verification */}
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <label className="block text-sm font-bold text-amber-900 mb-2">
                    Applicant Verification
                  </label>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-amber-800">
                      Is the candidate same as the applicant?
                    </p>
                    <select
                      value={state.is_same_as_applicant}
                      onChange={(e) =>
                        setState({ is_same_as_applicant: e.target.value })
                      }
                      className="rounded-md border-amber-200 text-sm py-1.5 pl-3 pr-8 focus:ring-amber-500 focus:border-amber-500 bg-white"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <Separator />

                {/* General Remarks */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <School className="h-4 w-4 text-indigo-600" />
                      <h4 className="font-semibold text-gray-800">
                        Academic Record
                      </h4>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Remarks on academic background..."
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-shadow resize-none"
                      value={state.academic_record_remark}
                      onChange={(e) =>
                        setState({ academic_record_remark: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="h-4 w-4 text-indigo-600" />
                      <h4 className="font-semibold text-gray-800">
                        Experience
                      </h4>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Remarks on work experience..."
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-shadow resize-none"
                      value={state.experience_remark}
                      onChange={(e) =>
                        setState({ experience_remark: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Detailed Ratings */}
                <div className="space-y-3">
                  <RatingField
                    label="Knowledge & Technical Skills"
                    icon={BrainCircuit}
                    rating={state.knowledge_rating}
                    onRatingChange={(v) => setState({ knowledge_rating: v })}
                    comment={state.knowledge_detail}
                    onCommentChange={(v) => setState({ knowledge_detail: v })}
                  />

                  <Separator />

                  <RatingField
                    label="Communication Skills"
                    icon={MessageSquare}
                    rating={state.communication_skills_rating}
                    onRatingChange={(v) =>
                      setState({ communication_skills_rating: v })
                    }
                    comment={state.communication_skills_comment}
                    onCommentChange={(v) =>
                      setState({ communication_skills_comment: v })
                    }
                  />

                  <Separator />

                  <RatingField
                    label="Attitude & Behavior"
                    icon={Smile}
                    rating={state.attitude_rating}
                    onRatingChange={(v) => setState({ attitude_rating: v })}
                    comment={state.attitude_comment}
                    onCommentChange={(v) => setState({ attitude_comment: v })}
                  />

                  <Separator />

                  <RatingField
                    label="Overall Assessment"
                    icon={Target}
                    rating={state.overall_assessment_rating}
                    onRatingChange={(v) =>
                      setState({ overall_assessment_rating: v })
                    }
                    comment={state.overall_assessment_remark}
                    onCommentChange={(v) =>
                      setState({ overall_assessment_remark: v })
                    }
                  />
                </div>

                <Separator />

                {/* Final Recommendation */}
                <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-4 text-[#1E3786]">
                    <Award className="h-6 w-6" />
                    <h3 className="text-lg font-bold">Final Recommendation</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Position Recommendation
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Recommended position or level..."
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        value={state.position_recommendation}
                        onChange={(e) =>
                          setState({ position_recommendation: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Supporting Comments
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Additional comments justifying the recommendation..."
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        value={state.recommendation_comments}
                        onChange={(e) =>
                          setState({ recommendation_comments: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={state.btnLoading}
                    className="px-3 py-1 bg-[#1E3786] hover:bg-[#152861] text-white rounded-md shadow-lg transition-all  flex items-center gap-2  text-sm"
                  >
                    {state.btnLoading ? (
                      <Loader className="animate-spin h-5 w-5" />
                    ) : (
                      <>
                        Submit Feedback
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-1 order-1 lg:order-2 space-y-2 ">
            {/* Job & Interview Card */}
            <Card className="border !rounded-none shadow-sm px-1">
              <CardContent className="py-3 ">
                <div className="flex flex-col gap-4 items-start">
                  {state.job?.job_detail?.college?.college_logo && (
                    <div className="flex-shrink-0">
                      <img
                        src={state.job?.job_detail?.college?.college_logo}
                        alt="College Logo"
                        className="w-16 h-16 rounded-xl bg-white object-contain border border-gray-100 shadow-sm p-1"
                      />
                    </div>
                  )}
                  <div className="flex-grow space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {state.job?.job_title}
                      </h2>
                      <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                        {state.interview_slot?.round_name} Round
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-indigo-500" />
                        {state.job?.job_detail?.college?.name}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-indigo-500" />
                        {state.job?.job_detail?.locations
                          ?.map((l) => l.city)
                          .join(", ")}
                      </span>
                      <span className="flex items-center gap-2 text-gray-900 font-medium bg-gray-50 px-2 py-0.5 rounded">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        {formatScheduleDateTime(
                          state.interview_slot?.scheduled_date,
                          state.interview_slot?.scheduled_time
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Card */}
            <Card className=" border !rounded-none shadow-sm p-0">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-base flex items-center gap-2 text-gray-800 pt-0">
                  <User className="h-5 w-5 text-indigo-600 " />
                  Candidate Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg ring-2 ring-white shadow-sm">
                      {state.job?.applicant_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base leading-tight">
                        {state.job?.applicant_name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="h-3.5 w-3.5" />
                        {state.job?.email}
                      </p>
                    </div>
                  </div>
                </div>
                {state.job?.resume && (
                  <Link
                    href={state.job?.resume}
                    target="_blank"
                    className="inline-flex items-center justify-center w-fit !mt-4 px-3 py-2 text-xs  text-white bg-[#1E3786] rounded-lg hover:bg-indigo-800 transition-colors gap-2 shadow-sm"
                  >
                    <FileText className="h-4 w-4" />
                    View Resume
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Evaluator Card */}
            <Card className="border !rounded-none shadow-sm p-0">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                  Evaluator Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </p>
                    <p className="font-medium text-gray-900">
                      {state.panels?.name || "N/A"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 !gap-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Designation
                      </p>
                      <p className="font-medium text-gray-900 text-sm">
                        {state.panels?.designation || "N/A"}
                      </p>
                    </div>
                    {/* {state.job?.email} */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email
                      </p>
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {state.panels?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {state.panels?.decision_maker && (
              <div
                className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
                onClick={() => setState({ showFeedbackModal: true })}
              >
                <div className="flex items-center justify-between text-[#1E3786]">
                  <p className="font-semibold text-sm">
                    View Fellow Panel Members Feedback
                  </p>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={state.showFeedbackModal}
        setIsOpen={(v) => setState({ showFeedbackModal: v })}
        title="Fellow Panel Members Feedback"
        width="700px"
        renderComponent={() => <FeedbackAccordion allSlots={state.all_slots} panels={state.panels_all} />}
      />
    </div>
  );
};

export default FeedbackForm;
