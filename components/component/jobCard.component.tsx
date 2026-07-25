import Models from "@/imports/models.import";
import {
  capitalizeFLetter,
  CharSlice,
  Failure,
  getAvatarColor,
  Success,
} from "@/utils/function.utils";
import {
  MapPin,
  Briefcase,
  Clock,
  Bookmark,
  Share2,
  DollarSign,
  IndianRupee,
  BookmarkCheck,
  Building2,
  Star,
  StarIcon,
  CrownIcon,
  BellRing,
  GraduationCapIcon,
} from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { RWebShare } from "react-web-share";

interface JobCardProps {
  job: {
    id: number;
    job_title: string;
    job_type_obj: any;
    salary_range_obj: any;
    company: string;
    locations: any;
    experiences: any;
    created_at: string;
    company_logo: string | null;
    college: any;
    job_description: any;
    is_saved: boolean;
    department?: any;
    roles?: any;
    application_status?: any;
    matches_user_location?: boolean;
    immediate_join?: boolean;
    categories?: any;
  };
  isProfile?: boolean;
  onClick?: () => void;
  updateList?: (jobId: number, isSaved: boolean) => void;
  onCollegeClick?: (e: React.MouseEvent, id: number) => void;
  onDepartmentClick?: (e: React.MouseEvent, id: number) => void;
}

const getStatusStyle = (status: string) => {
  const s = status?.toLowerCase() || "";
  if (s.includes("interview")) return "bg-purple-100 text-purple-700";
  if (s.includes("selected")) return "bg-green-100 text-green-700";
  if (s.includes("waitlist")) return "bg-yellow-100 text-yellow-700";
  if (s.includes("reject")) return "bg-red-100 text-red-700";
  if (s.includes("applied")) return "bg-blue-100 text-blue-700";
  return "bg-[#1E3786] text-white";
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isProfile,
  onClick,
  updateList,
  onCollegeClick,
  onDepartmentClick,
}) => {
  const [isSaving, setIsSaving] = useState<number | null>(null);

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    const profile = JSON.parse(localStorage.getItem("user") || "null");
    if (!profile?.id) {
      Failure("Please log in to save jobs.");
      return;
    }

    setIsSaving(job.id);
    try {
      // if (isSaved) {
      //   if (!saveId) {
      //     console.error("Cannot unsave job without a save_id.");
      //     Failure("Could not unsave job. Please refresh and try again.");
      //     setIsSaving(null);
      //     return;
      //   }
      //   await Models.save.delete(saveId);
      //   Success("Job removed from saved list.");
      // }
      // else {

      const body = {
        job_id: job?.id,
        user_id: profile.id,
      };
      if (job?.is_saved) {
        await Models.save.delete(profile.id, job.id);
        Success("Job removed from saved list.");
      } else {
        await Models.save.create(body);
        Success("Job saved successfully.");
      }
      updateList(job.id, !job.is_saved);
      // }

      // Refetch job list to get the latest saved status and save_id
    } catch (error) {
      console.error("Failed to save/unsave job", error);
      Failure("An error occurred. Please try again.");
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div
      className="border border-[#c7c7c787] bg-white py-2 px-3 md:p-5 hover:shadow-md transition-all duration-200 cursor-pointer group h-full flex flex-col"
      onClick={onClick}
    >
      <div className="flex flex-wrap gap-2 mb-3">
        {isProfile && (
          <div className={`w-fit rounded-3xl px-3 py-1 text-[12px] flex items-center gap-2 ${getStatusStyle(job?.application_status)}`}>
            <StarIcon size={14} />
            {capitalizeFLetter(job?.application_status)}
          </div>
        )}
      </div>

      {/* Header with Title and Company Logo on Right */}
      <div className="flex justify-between items-start mb-2 gap-3">
        {/* Company Logo/Initials on Right */}
        <div
          className="flex-shrink-0 mt-1"
          onClick={(e) => onCollegeClick(e, job?.college?.id)}
        >
          {job?.college?.college_logo ? (
            <img
              src={job?.college?.college_logo}
              alt="company logo"
              style={{ objectFit: "contain" }}
              className="w-10 h-10 rounded-lg object-cover border border-gray-300"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-lg bg-gray-500 flex items-center justify-center text-white font-semibold text-sm`}
            >
              {job?.college?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3
            className="font-bold text-gray-900 text-base text-md md:text-lg flex gap-2 items-center"
            title={
              job?.job_title
                ? job?.job_title
                : job?.roles?.length > 0
                  ? job?.roles?.[0]?.role_name
                  : ""
            }
          >
            {capitalizeFLetter(
              CharSlice(
                job?.job_title
                  ? job?.job_title
                  : job?.roles?.length > 0
                    ? job?.roles?.[0]?.role_name
                    : "",
                28,
              ),
            )}{" "}
            {job?.matches_user_location && (
              <div className="w-fit !h-fit md:bg-[#1E3786] rounded-3xl p-2 md:px-2 md:py-[1.8px] text-[10px] text-[#fff] font-normal flex items-center gap-2 leading-loose">
                <CrownIcon className="w-4 h-4 md:w-3 md:h-3 text-[#1E3786] fill-[#1E3786] -mt-1 md:text-white md:fill-none"/>
                <span className="hidden md:block text-white text-[10px] pt-0.1">Preferred Job</span> 
              </div>
            )}
          </h3>
          <p
            className="font-medium font-normal text-[#848282] text-sm md:text-md hover:underline w-fit"
            title={job?.college?.name}
            onClick={(e) => onCollegeClick(e, job?.college?.id)}
          >
            {capitalizeFLetter(CharSlice(job?.college?.name, 43))}
          </p>
        </div>

        {/* Immediate Hiring icon - top right */}
        {job?.immediate_join && (
          <div className="relative group/tip flex-shrink-0 mt-1">
            <BellRing className="w-4 h-4 text-green-600 fill-green-500 cursor-pointer" />
            <div className="absolute top-full right-0 mt-1 px-2 py-0.5 bg-green-600 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10">
              Immediate Hiring
            </div>
          </div>
        )}
      </div>

      {/* Experience and Location */}
      <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
        <div className="flex items-center gap-3">
          <Briefcase className="w-4 h-4 text-[#ffb400]" />
          <span className="text-sm text-[#6D6C6C]">
            {job?.experiences?.name}
          </span>
        </div>
        <span className="text-gray-400">|</span>
        {job?.locations?.length > 0 && (
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#ffb400]" />
            <span className="text-sm text-[#6D6C6C]">
              {" "}
              {job?.locations?.map((item) => item.city).join(", ")}
              {/* {job?.college?.address} */}
          </span>
        </div>)}
         <span className="text-gray-400">|</span>

          {job?.categories.length == 1 &&
              
          <div className="flex items-center gap-3  ">
            <GraduationCapIcon className="w-4 h-4 text-[#ffb400]" />
            <span className="text-sm text-[#6D6C6C]">
              {" "}
              {job?.categories?.map((item) => item.name).join(", ")}
              {/* {job?.college?.address} */}
          </span>
        </div>}
      </div>

      <div className="flex items-center gap-3 mb-3 mt-2">
        <Building2 className="w-4 h-4 text-[#ffb400]" />

        <span className="flex items-center gap-3 text-sm text-[#6D6C6C]">
          {/* <span className="text-sm text-[#6D6C6C]"> */}
            {job?.department
              ?.slice(0, 2)
              .map((item) => item.name)
              .join(", ")}
          </span>

          {/* If more than 2 departments */}
          {job?.department?.length > 2 && (
            <div className="w-6 h-6 px-3 flex items-center justify-center rounded-full bg-[#1E3786] text-white text-[12px] font-medium">
              +{job.department.length - 2}
            </div>
          )}
        {/* </span> */}
      </div>
      {/* Job Description */}
      <div className="flex-1">
        {job?.job_description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {job?.job_description}
          </p>
        )}
      </div>
      {/* Footer with Posted Date and Save Button */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          {moment(job?.created_at).isValid() &&
          moment(job?.created_at).year() > 1900
            ? moment(job?.created_at).fromNow()
            : "Just now"}
        </div>

        <button
          disabled={isSaving === job?.id}
          onClick={(e) => handleSaveToggle(e)}
          className=" flex  gap-1 items-center text-sm  font-medium hover:text-blue-700 transition-colors disabled:opacity-50"
        >
          {job?.is_saved ? (
            <div className="flex items-center ">
              <BookmarkCheck className="w-7 h-7 fill-[#1E3786] text-white" />
              <div className="text-[#1E3786] font-medium text-sm">Saved</div>
            </div>
          ) : (
            <>
              <Bookmark className="w-5 h-5 " />
              Save
            </>
          )}
        </button>
      </div>
    </div>
  );
};