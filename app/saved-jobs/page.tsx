"use client";

import React, { useEffect, useState } from "react";
import { useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import { JobCard } from "@/components/component/jobCard.component";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import PaginationCom from "@/components/component/PaginationCom";
import Footer from "@/components/common-components/new_components/Footer";
import SkeletonLoader from "../jobs/SkeletonLoader";

export default function SavedJobsPage() {
  const router = useRouter();
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const [state, setState] = useSetState({
    loading: true,
    jobList: [],
    page: 1,
    count: 0,
    next: null,
    prev: null,
    userId: null,
  });
  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  /**
   * Load user from localStorage ONCE
   */
  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("user") || "null");
    if (profile?.id) {
      setState({ userId: profile.id });
    } else {
      // If no user, stop loading and show empty state
      setState({ loading: false });
    }
  }, []);

  /**
   * Fetch saved jobs only AFTER userId is available
   */
  useEffect(() => {
    if (state.userId) {
      getSavedJobs(1);
    }
  }, [state.userId]);

  const getSavedJobs = async (page = 1) => {
    try {
      setState({ loading: true });

      const res: any = await Models.save.list(page, state.userId);

      setState({
        loading: false,
        jobList: res?.results || [],
        count: res?.count || 0,
        next: res?.next ?? null,
        prev: res?.previous ?? null,
        page,
      });
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      setState({ loading: false });
    }
  };

  console.log("jobList", state?.jobList);

  const handleNext = () => {
    if (state.next) {
      getSavedJobs(state.page + 1);
    }
  };

  const handlePrev = () => {
    if (state.prev) {
      getSavedJobs(state.page - 1);
    }
  };

  return (
    <div className="bg-clr1 min-h-screen flex flex-col">
      {/* HEADER */}
      {/* <div className="bg-[#1E3786] py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="section-ti !text-white">Saved Jobs</h1>
        </div>
      </div> */}

      <div className="bg-[#1E3786] py-[20px] md:py-[50px] px-4 ">
        <div className="max-w-7xl 0px] mx-auto text-center">
          <h1 className="!text-white text-[24px] md:text-[40px] font-medium md:font-semibold">
            Saved Jobs
          </h1>
        </div>
      </div>

      <main className="section-wid py-8 lg:py-12 flex-grow w-full">
        {/* BACK BUTTON */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        {/* LOADING */}
        {state.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-slate-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 w-full">
                    <SkeletonLoader type="circle" width={48} height={48} />
                    <div className="flex-1">
                      <SkeletonLoader
                        type="text"
                        width="60%"
                        height={20}
                        style={{ marginBottom: 8 }}
                      />
                      <SkeletonLoader type="text" width="40%" height={16} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <SkeletonLoader
                    type="rect"
                    width={80}
                    height={24}
                    className="rounded-full"
                  />
                  <SkeletonLoader
                    type="rect"
                    width={80}
                    height={24}
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <SkeletonLoader type="text" width="100%" />
                  <SkeletonLoader type="text" width="80%" />
                </div>
              </div>
            ))}
          </div>
        ) : state.jobList.length > 0 ? (
          <>
            {/* JOB LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 !gap-4">
              {state.jobList?.map((item: any) => {
                return (
                  <div
                    key={item.id || item.id}
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() =>
                      router.push(`/jobs?slug=${item.slug}`)
                    }
                    
                  >
                    <JobCard
                      job={item?.job}
                      updateList={() => getSavedJobs(state.page)}
                    />
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {(state.next || state.prev) && (
              <div className="flex justify-center items-center mt-10">
                <PaginationCom
                  page={state.page}
                  next={state.next}
                  prev={state.prev}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              </div>
            )}
          </>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              No saved jobs found
            </h3>
            <p className="text-slate-500 text-sm">
              Jobs you save will appear here.
            </p>

            <button
              onClick={() => router.push("/jobs")}
              className="mt-6 text-amber-600 font-bold hover:underline"
            >
              Browse Jobs
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
