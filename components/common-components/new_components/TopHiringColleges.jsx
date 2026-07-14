"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useRouter } from "next/navigation";
import { getAvatarColor, useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import SkeletonLoader from "@/app/jobs/SkeletonLoader";

const colleges = [
  {
    id: 1,
    name: "Kumaraguru College of Technology",
    location: "Coimbatore",
    logo: "/assets/images/Faculty/favicon.png",
    openings: 10,
  },
  {
    id: 2,
    name: "karpagam College of Engineering",
    location: "Coimbatore",
    logo: "/assets/images/Faculty/favicon.png",
    openings: 10,
  },
  {
    id: 3,
    name: "PSG College of Technology",
    location: "Coimbatore",
    logo: "/assets/images/Faculty/favicon.png",
    openings: 10,
  },
  {
    id: 4,
    name: "Sri Kirishna Institutions",
    location: "Coimbatore",
    logo: "/assets/images/Faculty/favicon.png",
    openings: 10,
  },
];

const TopHiringColleges = () => {
  const router = useRouter();

  const [state, setState] = useSetState({
    // Profile Data
    loading: false,
    collegesList: [],
    token: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    setState({ token });
  }, []);

  useEffect(() => {
    collgeList();
  }, []);

  // const collgeList = async () => {
  //   try {
  //     setState({ loading: true });

  //     const res = await Models.colleges.collegeList();

  //     console.log("res", res);

  //     // Filter colleges where total_jobs > 0
  //     const filteredColleges = res?.results?.filter(
  //       (college) => college?.total_jobs > 0,
  //     );

  //     setState({
  //       loading: false,
  //       collegesList: filteredColleges,
  //     });
  //   } catch (error) {
  //     setState({ loading: false });
  //     // Failure("Failed to fetch jobs");
  //   }
  // };

  const collgeList = async () => {
  try {
    setState({ loading: true });

    let allColleges = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const res = await Models.colleges.collegeList({
        page,
        page_size: 10,
        is_legacy:true
      });

      console.log("PAGE:", page, "NEXT:", res?.next);

      const filtered = res?.results?.filter(
        (college) => college?.total_jobs > 0
      );

      allColleges = [...allColleges, ...filtered];

      if (!res?.next) {
        hasNext = false;
      } else {
        page++;
      }

      // safety break
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
    <section className="py-12 lg:py-20 bg-gray-50">
      <div className="section-wid w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Content */}
          <div className="lg:col-span-9">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="colleges-section-title text-2xl md:text-2xl  font-medium text-[#151515]">
                Leading Institutions Currently Hiring
              </h2>

              {/* Navigation Buttons - Desktop */}
              <div className="hidden lg:flex items-center gap-3">
                <button className="swiper-button-prev-custom w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button className="swiper-button-next-custom w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Swiper */}
            {state.loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[300px] border border-[#c7c7c787] p-6 flex flex-col items-center justify-between bg-white rounded-lg"
                  >
                    <SkeletonLoader
                      type="circle"
                      width={80}
                      height={80}
                      className="mb-3"
                    />
                    <div className="w-full flex flex-col items-center gap-2">
                      <SkeletonLoader type="text" width="80%" height={24} />
                      <SkeletonLoader type="text" width="60%" height={16} />
                    </div>
                    <SkeletonLoader
                      type="rect"
                      width={120}
                      height={36}
                      className="rounded-full"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                pagination={false}
                navigation={{
                  prevEl: ".swiper-button-prev-custom",
                  nextEl: ".swiper-button-next-custom",
                }}
                // pagination={{ clickable: false }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                  },
                }}
                className="colleges-swiper"
              >
                {state?.collegesList.map((college) => (
                  <SwiperSlide key={college.id}>
                    <div
                      className="cursor-pointer group py-6 px-3 flex flex-col items-center text-center h-[300px] justify-between border border-[#c7c7c787] hover:scale-[0.94]  hover:bg-[#1E3786] transition-all duration-500 "
                      onClick={() => router.push(`/jobs?college=${college.id}`)}
                    >
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-3 border border-gray-100 group-hover:scale-115">
                        {college.college_logo ? (
                          <img
                            src={college.college_logo}
                            alt={college.college_name}
                            className="w-14 h-14 object-contain"
                          />
                        ) : (
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-white bg-gray-400  font-semibold flex-shrink-0`}
                          >
                            {college?.college_name?.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-center px-2">
                        <h3 className="sub-ti !font-medium mb-1 leading-tight line-clamp-2 !text-[#313131] group-hover:!text-white transition-colors">
                          {college.college_name}
                        </h3>
                        <p className="text-sm mb-5 mt-3 text-gray-500 group-hover:text-white/70 transition-colors">
                          {college.college_address}
                        </p>
                      </div>

                      <button className="px-6 py-2 rounded-full text-sm font-medium transition-colors bg-[#1E3786] text-white group-hover:bg-[#F2B31D] group-hover:text-black">
                        {college.total_jobs} Openings
                      </button>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* Right CTA Card */}
          <div className="lg:col-span-3 relative h-[380px] ">
            <div className="absolute inset-0 z-0  overflow-hidden">
              <Image
                src="/assets/images/Faculty/faculty_pro_bg.png"
                alt="Background"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="relative z-10 rounded-xl p-6 text-center text-white overflow-hidden h-full flex flex-col items-center justify-center">
              <div className="relative z-10 ">
                <div className="mb-4 flex items-center justify-center gap-2 py-1 pt-3">
                  <div className=" flex items-center justify-center ">
                    <img
                      src="/assets/images/footer_logo.png"
                      alt="Logo"
                      className="w-[160px] h-8"
                      // priority
                      height={40}
                      width={40}
                    />
                  </div>
                  {/* <h3 className="text-2xl  font-medium text-white">
                    Faculty Pro
                  </h3> */}
                </div>

                {state?.token ? (
                  <>
                    <h4 className="text-lg  font-normal text-white mb-4 ">
                      Create your profile and upload your resume to stay
                      informed about the latest faculty openings.
                    </h4>
                    {/* <p className="text-sm mb-4 py-4 text-white">
                      Add Resume Now!
                    </p> */}

                    <button
                      className="bg-[#F2B31D] text-black px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#e0a519] transition"
                      onClick={() => router.push(`/profile`)}
                    >
                      Add your Resume
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg  font-normal text-white mb-4 ">
                      Receive the Most Relevant Job Opportunities Directly in
                      Your Inbox
                    </h4>
                    {/* <p className="text-sm mb-4 py-4 text-white">
                      Create your profile and upload your resume to stay
                      informed about the latest faculty openings
                    </p> */}
                    <button
                      className="bg-[#F2B31D] text-black px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#e0a519] transition"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("openRegisterModal"),
                        )
                      }
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .colleges-swiper .swiper-pagination {
          position: relative;
          margin-top: 2rem;
        }
        .colleges-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #d1d5db;
          opacity: 1;
        }
        .colleges-swiper .swiper-pagination-bullet-active {
          background: #1a1f5c;
        }
      `}</style>
    </section>
  );
};

export default TopHiringColleges;
