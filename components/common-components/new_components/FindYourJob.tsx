"use client";

import React, { useEffect, useState } from "react";
// import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Heart,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Plus,
  Check,
  Loader2,
  Share,
  Share2,
  Clock,
  Building2,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {
  capitalizeFLetter,
  CharSlice,
  Dropdown,
  Failure,
  getAvatarColor,
  useSetState,
} from "@/utils/function.utils";
import Models from "@/imports/models.import";
import moment from "moment";
import CustomSelect from "../dropdown";
import useDebounce from "../useDebounce";
import { RWebShare } from "react-web-share";
import SkeletonLoader from "@/app/jobs/SkeletonLoader";

const categories = [
  { name: "Assistant Professor", count: 20 },
  
  { name: "Lab Technician", count: 33 },  
  { name: "Professor", count: 33 },
  { name: "Research Associate", count: 14 },
  { name: "Academic Coordinator", count: 52 },
  
  { name: "Associate Professor", count: 14 },
  { name: "Academic Coordinator", count: 52 },
  
];

const FindYourJob = ({ collegeId }: { collegeId?: any }) => {
  const router = useRouter();
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [state, setState] = useSetState({
    count: 0,
    jobList: [],
    next: null,
    prev: null,
    search: "",
    location: "",
    locationList: [],
    collegesList: [],
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    JobCatList();
  }, []);


  useEffect(() => {
    locationList();
    jobList(1);
  }, [debouncedSearch, state.location, state?.JobCat, collegeId]);

  useEffect(() => {
    jobList(state.page);
  }, [state.page]);

 const locationList = async () => {
  try {
    let page = 1;
    let allResults: any[] = [];
    let hasNext = true;
     const body = {
      has_jobs:true
    }

    while (hasNext) {
      const res: any = await Models.location.list(page, body);

      if (res?.results?.length) {
        allResults = [...allResults, ...res.results];
      }

      hasNext = !!res?.next;
      page++;
    }

    const dropdown = Dropdown(allResults, "city");

    setState({
      locationList: dropdown,
    });
  } catch (error) {
    console.log("Error fetching locations:", error);
  }
};

  const JobCatList = async () => {
    try {
      let page = 1;
      let allResults: any[] = [];
      let hasNext = true;
  
      while (hasNext) {
        const res: any = await Models.category.list(page,);
  
        if (res?.results?.length) {
          allResults = [...allResults, ...res.results];
        }
  
        hasNext = !!res?.next;
        page++;
      }
  
      const dropdown = Dropdown(allResults, "name");
  
      setState({
        jobCatList: dropdown,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

 

   

 

  // const JobCatList = async () => {
  //     try {
  //       const res: any = await Models.category.list();
  //       const dropdown: any = Dropdown(res?.results, "name");
  //       setState({
  //         jobCatList: dropdown,
  //       });
  //     } catch (error) {
  //       console.log("error fetching locations", error);
  //     }
  //   };

    

  const jobList: any = async (page = 1) => {
    if (!collegeId || !Array.isArray(collegeId) || collegeId.length === 0) return;
    try {
      setState({ loading: true });
      console.log("hello");
      const body = bodyData();

      console.log("body", body);
      

      const res: any = await Models.job.list(page, body);
      console.log(res);

      setState({
        loading: false,
        // page: state.page,
        count: res?.count,
        jobList: res?.results,
        next: res?.next,
        prev: res?.previous,
      });
    } catch (error) {
      setState({ loading: false });
      // Failure("Failed to fetch jobs");
    }
  };

  const bodyData = () => {
    const body: any = {};

    if (collegeId && Array.isArray(collegeId) && collegeId.length > 0) {
      body.college_id = collegeId;
    }

    if (debouncedSearch) {
      body.search = debouncedSearch;
    }

    if (state?.location) {
      body.location = state.location;
    }

    if (state?.JobCat) {
      body.category = state.JobCat;
    }

    return body;
  };

  const totalPages = Math.ceil(state.count / state.pageSize);

  const getVisiblePages = () => {
    const pages: number[] = [];
    const start = Math.max(1, state.page - 3);
    const end = Math.min(totalPages, state.page + 3);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <section data-tour="find-job" className="py-12 lg:py-16 bg-[#0000ff0a]">
      <div className="section-wid w-full ">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Content - Job Listings */}
          <div className="lg:col-span-9">
            {/* Header with Search in Single Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <h2 className="text-2xl md:text-2xl font-medium text-[#151515]">
                Find Your Job
              </h2>

              {/* Search Bar */}
              <div className="job-category-filters bg-white   rounded-full  border border-[#c7c7c787] p-1.5 flex items-center gap-3 max-w-[500px]">
                <div className="flex items-center flex-1 px-3 py-1.5 w-[25%]">
                  {/* <Search className="w-4 h-4 text-gray-400 mr-2" /> */}
                  {/* <input
                    type="text"
                    placeholder="Job title, Position, Keyword..."
                    className="w-full focus:outline-none text-sm placeholder:bg-none placeholder:text-[#313131]"
                    value={state.search}
                    onChange={(e) => setState({ search: e.target.value })}
                  /> */}

                  <CustomSelect
                    className="w-full placeholder:text-[#373535]  px-3 py-2 sm:px-2 xl:px-4 sm:py-3 bg-transparent text-base sm:text-base rounded-full sm:rounded-none border-none appearance-none cursor-pointer text-gray-700 overflow-hidden"
                    placeholder="Job Category"
                    options={state.jobCatList}
                    value={state?.JobCat || ""}
                    onChange={(selected) =>
                      setState({
                        ...state,
                        JobCat: selected ? selected.value : "",
                      })
                    }
                  
                  loading={state.jobCatListLoading}
                  />
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                <div className="flex items-center px-3 py-1.5 min-w-[120px]">
                  {/* <MapPin className="w-4 h-4 text-gray-400 mr-2" /> */}

                  <CustomSelect
                    placeholder="City, state"
                    options={state.locationList}
                    className="p-0 border-none focus:outline-none"
                    value={state?.location || ""}
                    onChange={(selected) =>
                      setState({
                        ...state,
                        location: selected ? selected.value : "",
                      })
                    }
                  />
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                {/* <button className="flex items-center px-3 py-1.5 text-gray-600 hover:text-gray-800">
                  <SlidersHorizontal className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Filters</span>
                </button> */}
                <button className="bg-[#1E3786] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#080f3d] transition">
                  Find Job
                </button>
              </div>
            </div>

            {/* Job Cards Grid */}
            {state.loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 !gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-3 md:p-5 border border-[#c7c7c787] bg-white h-full"
                  >
                    <div className="flex items-start gap-3">
                      <SkeletonLoader
                        type="rect"
                        width={48}
                        height={48}
                        className="rounded-lg flex-shrink-0"
                      />
                      <div className="w-full">
                        <div className="flex justify-between mb-2">
                          <div className="w-3/4">
                            <SkeletonLoader
                              type="text"
                              width="90%"
                              height={20}
                              className="mb-2"
                            />
                            <SkeletonLoader
                              type="text"
                              width="50%"
                              height={16}
                            />
                          </div>
                          <SkeletonLoader
                            type="circle"
                            width={20}
                            height={20}
                          />
                        </div>

                        <div className="flex gap-4 mb-4 mt-4">
                          <SkeletonLoader type="text" width={80} height={16} />
                          <SkeletonLoader type="text" width={80} height={16} />
                        </div>
                        <div className="flex gap-4 mb-4">
                          <SkeletonLoader type="text" width={120} height={16} />
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <SkeletonLoader
                            type="rect"
                            width={100}
                            height={32}
                            className="rounded-full"
                          />
                          <SkeletonLoader type="text" width={60} height={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : state?.jobList?.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 !gap-4 mb-6 min-h-[300px]">
                <div className="sm:col-span-2 flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="w-16 h-16 bg-[#1E3786]/10 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="w-8 h-8 text-[#1E3786]/50" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">No Jobs Found</h4>
                  <p className="text-sm text-gray-500">Try adjusting your filters or search criteria.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 !gap-4 mb-6">
                {state?.jobList.slice(0, 6)?.map((job, jobIndex) => (
                  <div
                    key={job.id}
                    className={`${jobIndex === 0 ? "find-job-card-first " : ""}p-3 md:p-5 border border-[#c7c7c787] transition-all duration-300 bg-white cursor-pointer group hover:bg-[#1E3786] hover:border-gray-400 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-500 h-full`}
                    onClick={() => router.push(`/jobs?slug=${job.slug}`)}
                  >
                    <div className="flex items-start justify-between mb-3 h-full">
                      <div className="flex  items-start gap-3 w-full h-full">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
                          {job?.college?.college_logo ? (
                            <img
                              src={job?.college?.college_logo}
                              alt={job?.college?.name}
                              width={50}
                              height={50}
                              className="object-contain"
                            />
                          ) : (
                            <div
                              className={`w-full h-full rounded-lg  flex items-center justify-center text-white bg-gray-400 font-medium  flex-shrink-0`}
                            >
                              {job?.college?.name?.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="w-full">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="sub-ti !text-[#313131] !font-medium  mb-0.5 group-hover:!text-white">
                                {capitalizeFLetter(
                                  CharSlice(job.job_title, 35),
                                )}
                              </h3>
                              <p className="text-sm text-gray-600 group-hover:!text-white">
                                {CharSlice(job.college?.name, 43)}
                              </p>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <RWebShare
                                data={{
                                  title: "Faculty Plus",
                                  text: "Check this out!",
                                  url: window.location.href,
                                }}
                              >
                                <button className="text-gray-800 hover:text-black transition h-fit group-hover:!text-white">
                                  <Share2 className="w-5 h-5" />
                                </button>
                              </RWebShare>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-4  text-xs text-gray-600 mt-4 mb-2">
                              <div className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-[#ffb400]" />
                                <span className="group-hover:!text-white">
                                  {job.experiences?.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-[#ffb400]" />
                                <span className="group-hover:!text-white">
                                  {job.locations
                                    ?.map((item) => item.city)
                                    .join(", ")}
                                </span>
                              </div>
                            </div>
                            {/* <div className="flex items-center gap-1.5 mb-4 ">
                              <Building2 className="w-4 h-4 text-[#ffb400]" />
                              <span>
                                {job.department
                                  ?.map((item) => item.name)
                                  .join(", ")}
                              </span>
                            </div> */}

                            <div className="flex items-center gap-1.5 mb-3 mt-2">
                              <Building2 className="w-4 h-4 text-[#ffb400]" />

                              <span className="flex items-center gap-3 text-sm text-[#6D6C6C] ">
                                {job?.department
                                  ?.slice(0, 1)
                                  .map((item, index) => (
                                    <span
                                      key={index}
                                      className="cursor-pointer group-hover:!text-white "
                                      // onClick={(e) => {
                                      //   e.stopPropagation();
                                      //   onDepartmentClick && onDepartmentClick(e, item.id);
                                      // }}
                                    >
                                      {item.name}
                                    </span>
                                  ))}

                                {/* If more than 2 departments */}
                                {job?.department?.length > 2 && (
                                  <div className="w-6 h-6 px-3 flex items-center justify-center rounded-full bg-[#1E3786]  text-white  group-hover:bg-[#fff] group-hover:!text-[#1E3786] text-[12px] font-medium">
                                    +{job.department.length - 2}
                                  </div>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between w-100 pt-3">
                              <button
                                onClick={() =>
                                  router.push(`/jobs?slug=${job.slug}`)
                                }
                                className="border border-[#1E3786] text-[#fff] px-5 py-1.5 rounded-full text-sm font-medium bg-[#1E3786] group-hover:bg-[#fff] group-hover:!text-[#1E3786] transition"
                              >
                                View Job
                              </button>

                              <div className="flex items-center justify-end text-end gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3 group-hover:!text-white" />
                                <span className="group-hover:!text-white">
                                  {moment(job.created_at).isValid() &&
                                  moment(job.created_at).year() > 1900
                                    ? moment(job.created_at).fromNow()
                                    : "Just now"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <div className="flex flex-col items-end justify-between h-full">
                        
                      </div> */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Job Spotlight */}
            <div data-tour="job-spotlight" className=" border ">
              <div className="bg-[#1E3786] flex items-center justify-between py-3 px-4">
                <h3 className="text-xl md:text-xl font-medium text-white">
                  Job spotlight
                </h3>
                <div className="flex gap-2">
                  <button className="swiper-spotlight-prev w-8 h-8 rounded-full border-2 border-white flex items-center justify-center hover:bg-white/10 transition">
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button className="swiper-spotlight-next w-8 h-8 rounded-full border-2 border-white flex items-center justify-center hover:bg-white/10 transition">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <Swiper
                modules={[Navigation, Autoplay]}
                navigation={{
                  prevEl: ".swiper-spotlight-prev",
                  nextEl: ".swiper-spotlight-next",
                }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                className="job-spotlight-swiper bg-white"
              >
                {state.jobList?.slice(0, 6)?.map((job: any) => (
                  <SwiperSlide key={job.id} className="w-full h-full">
                    <div className=" px-6 pb-6 pt-5 bg-[url('/assets/images/Faculty/card-bg.png')] w-full h-full bg-cover bg-center bg-no-repeat">
                      <div className="mb-4 rounded-lg overflow-hidden h-16 w-full  flex items-center justify-center  ">
                        {job?.college?.college_logo ? (
                          <img
                            src={job?.college?.college_logo}
                            alt={job?.college?.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold bg-gray-400 text-4xl`}
                          >
                            {job?.college?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <h4 className="sub-ti !font-medium !text-[#313131] mb-2 line-clamp-1">
                        {CharSlice(job.job_title, 35)}
                      </h4>
                      <p className="text-base text-gray-600 mb-4 line-clamp-1">
                        {CharSlice(job.college?.name, 43)}
                      </p>

                      <div className="space-y-2 ">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Briefcase className="w-4 h-4 text-yellow-500" />
                          <span>{job.experiences?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4  text-yellow-500" />
                          <span>
                            {job.locations
                              ?.map((item: any) => item.city)
                              .join(", ")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-5 mt-2">
                        <Building2 className="w-4 h-4 text-[#ffb400]" />

                        <span className="flex items-center gap-3 text-sm text-[#6D6C6C]">
                          {job?.department?.slice(0, 2).map((item, index) => (
                            <span
                              key={index}
                              className="cursor-pointer  "
                              // onClick={(e) => {
                              //   e.stopPropagation();
                              //   onDepartmentClick && onDepartmentClick(e, item.id);
                              // }}
                            >
                              {CharSlice(item.name, 23)}
                            </span>
                          ))}

                          {/* If more than 2 departments */}
                          {job?.department?.length > 2 && (
                            <div className="w-6 h-6 px-3  mt-[-4px] flex items-center justify-center rounded-full bg-[#1E3786] text-white text-[12px] font-medium">
                              +{job.department.length - 2}
                            </div>
                          )}
                        </span>
                      </div>

                      <div className="relative flex items-center justify-end">
                        <button
                          onClick={() => router.push(`/jobs?slug=${job.slug}`)}
                          className="relative z-10 border border-black text-[#595959] px-5 py-1 rounded-full text-base font-small hover:bg-[#1E3786] hover:text-white transition flex items-center gap-2"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Jobs By Category */}
            <div data-tour="jobs-by-category" className="bg-[#1E3786] border ">
              <div className="py-3 px-4">
                <h3 className="text-xl md:text-xl font-medium text-white">
                  Jobs By Category
                </h3>
              </div>

              <div className="bg-white px-6 pb-6 pt-5 bg-[url('/assets/images/Faculty/card-bg.png')] bg-cover bg-center bg-no-repeat">
                <div className="space-y-3 mb-6">
                  {(state.jobCatList || []).map((category, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        router.push(`/jobs?job-category=${category.value}`)
                      }
                      className="flex items-center gap-2 text-gray-800 hover:text-[#1E3786] cursor-pointer transition"
                    >
                      <ChevronRight className="w-4 h-4 text-[#1F1F1F]" />
                      <span className="text-[#1F1F1F]">{category.label}</span>
                    </div>
                  ))}
                </div>

                {/* <button className="flex items-center gap-2 text-gray-800 font-semibold hover:text-[#1E3786] transition">
                  <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-md">View All Category</span>
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FindYourJob;
