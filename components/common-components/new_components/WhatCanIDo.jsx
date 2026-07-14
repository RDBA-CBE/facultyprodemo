"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAvatarColor, useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import SkeletonLoader from "@/app/jobs/SkeletonLoader";

const WhatCanIDo = () => {
  const router = useRouter();

  const [state, setState] = useSetState({
    // Profile Data
    loading: false,
    collegesList: [],
  });

  useEffect(() => {
    collegeList();
  }, []);

  const collegeList = async () => {
  try {
    setState({ loading: true });

    let allColleges = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const res = await Models.colleges.collegeList({
        page,
        page_size: 10,
      });

      // Filter colleges where total_jobs > 0
      const filtered = res?.results?.filter(
        (college) => college?.total_jobs > 0
      );

      allColleges = [...allColleges, ...filtered];

      // stop when no next page
      if (!res?.next) {
        hasNext = false;
      } else {
        page++;
      }

      // 🔥 safety guard
      if (page > 20) break;
    }

    setState({
      loading: false,
      collegesList: allColleges,
    });
  } catch (error) {
    setState({ loading: false });
  }
};

  console.log("collegesList", state?.collegesList);

  return (
    <section className="pb-12 pt-8 lg:py-16  ">
      <div className="section-wid w-full px-4 sm:px-6 lg:px-8 xl:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Content - Job Listings */}
          <div className="lg:col-span-9 ">
            <h2 className="text-2xl md:text-2xl  font-medium  mb-3 text-[#151515]">
              Platform for Academic Careers and Institutional Hiring 
            </h2>
            <p className="text-gray-600 mb-8">
             FacultyPro is a specialized platform connecting academic talent with leading educational institutions
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
              {/* Image */}
              <div className="overflow-hidden">
                <Image
                  src="/assets/images/Faculty/group.png"
                  alt="Faculty Team"
                  width={500}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Features */}
              <div className="space-y-10">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center">
                      <Check className="w-5 h-5 text-black" strokeWidth={3} />
                    </div>
                  </div>
                  <div>
                    <h3 className="sub-ti !font-medium !text-[#1E1E1E] mb-1">
                      Explore and Apply for Faculty Positions
                    </h3>
                    <p className="text-gray-600 text-md">
                      Access verified faculty opportunities across reputable colleges and universities that match your
qualifications.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center">
                      <Check className="w-5 h-5 text-black" strokeWidth={3} />
                    </div>
                  </div>
                  <div>
                    <h3 className="sub-ti !font-medium !text-[#1E1E1E] mb-1">
                      Recruit Qualified Academic Professionals Efficiently
                    </h3>
                    <p className="text-gray-600 text-md">
                      Institutions can post vacancies, review applications, and identify suitable candidates through a
streamlined process.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center">
                      <Check className="w-5 h-5 text-black" strokeWidth={3} />
                    </div>
                  </div>
                  <div>
                    <h3 className="sub-ti !font-medium !text-[#1E1E1E] mb-1">
                      Manage Recruitment from a Single Platform
                    </h3>
                    <p className="text-gray-600 text-md">
                      Track applications, review candidates, and communicate with applicants through a centralized system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* Jobs By Location */}
            <div className="bg-[#1E3786] border ">
              <div className="py-3 px-4">
                <h3 className="text-xl md:text-xl font-medium text-white">
                  Jobs By Colleges
                </h3>
              </div>

              <div className="bg-white px-6 pb-6 pt-4 bg-[url('/assets/images/Faculty/card-bg.png')] bg-cover bg-center bg-no-repeat">
                <div className=" mb-6">
                  {state.loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <SkeletonLoader
                            type="circle"
                            width={32}
                            height={32}
                          />
                          <div className="flex-1">
                            <SkeletonLoader
                              type="text"
                              width="70%"
                              height={16}
                              className="mb-1"
                            />
                            <SkeletonLoader
                              type="text"
                              width="40%"
                              height={12}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    state?.collegesList?.slice(0, 4)?.map((college, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer transition"
                        onClick={() =>
                          router.push(`/jobs?college=${college.id}`)
                        }
                      >
                        <div className="w-8 h-8 rounded-full  flex-shrink-0">
                          {college.college_logo ? (
                            <img
                              className="rounded-full"
                              src={college.college_logo}
                              alt={college.college_name}
                            />
                          ) : (
                            <div
                              className={`w-6 h-6 rounded-lg  flex items-center justify-center text-white bg-gray-400  font-semibold flex-shrink-0`}
                            >
                              {college.college_name?.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-md font-medium text-gray-800">
                            {college.college_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {college.total_jobs} Jobs
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  className="flex items-center gap-2 text-gray-800 font-semibold hover:text-[#1E3786] transition"
                  onClick={() => router.push(`/jobs`)}
                >
                  <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-md">View All Job</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatCanIDo;
