"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, X, Youtube } from "lucide-react";
import {
  Dropdown,
  Failure,
  Success,
  useSetState,
} from "@/utils/function.utils";
import Models from "@/imports/models.import";
import { useRouter, usePathname } from "next/navigation";
import Modal from "../modal";
import { Mail } from "lucide-react";
import Link from "next/link";
import { FaPinterestP } from "react-icons/fa";

const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();
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
    email: "",
  });
  useEffect(() => {
    jobList(1);
    JobCatList();
    locationList()
  }, []);

  const jobList = async (page = 1) => {
    try {
      setState({ loading: true });
      const body = {};
      const res = await Models.job.list(page, body);

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

  const handleSubscribe = async () => {
    try {
      if (!state?.email) {
        Failure("Please enter your email address");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(state.email)) {
        Failure("Please enter a valid email address");
        return;
      }

      const body = {
        email: state.email,
      };

      const res = await Models.auth.newsletter(body);
      // Success("Subscribed successfully! Thank you for joining our newsletter.");
      setState({ email: "" , successSubscription: true});
    } catch (error) {
      if (error?.response?.data?.error) {
        Failure(error?.response?.data?.error);
        setState({ email: "" });
      }
    }
  };

  const locationList = async () => {
    try {
      let page = 1;
      let allResults = [];
      let hasNext = true;
       const body = {
        has_jobs:true
      }
  
      while (hasNext) {
        const res = await Models.location.list(page, body);
  
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
  console.log("locationList", state.locationList);
  

  const JobCatList = async () => {
    try {
      let page = 1;
      let allResults = [];
      let hasNext = true;

      while (hasNext) {
        const res = await Models.category.list(page);

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

  return (
    <>
      <footer className="relative w-full bg-clr1">
        {/* 1. Subscribe Section - This container centers the narrow yellow card */}
        <div className="sm:container mx-auto  relative z-20">
          <div className="max-w-5xl mx-auto bg-[#F2B31D] flex flex-col md:flex-row items-center justify-between  p-6 md:p-10 min-h-[180px] relative shadow-xl md:translate-y-[30%]">
            {/* Text & Input Content */}
            <div className="w-full md:w-1/2 text-black z-10">
              <h2 className="text-2xl md:text-2xl font-medium text-[#1C1C1C] mb-2">
                Stay Informed About Academic Opportunities
              </h2>
              <p className="text-sm opacity-90 mb-6 max-w-md leading-tight">
                Receive timely updates on the latest faculty openings,
                institutional recruitment announcements, and academic career
                opportunities.
              </p>

              {/* Input Group */}
              <div className="newsletter-input flex bg-white rounded-full p-1 shadow-md w-full max-w-md">
                <input
                  type="email"
                  value={state?.email}
                  onChange={(e) => setState({ email: e.target.value })}
                  placeholder="Enter Your Email Address..."
                  className=" flex-grow px-4 py-2 rounded-full outline-none text-[#373535] text-sm bg-transparent placeholder:text-[#373535]"
                />
                <button
                  onClick={() => handleSubscribe()}
                  className="bg-[#F2B31D] hover:bg-black hover:text-white transition-all text-black font-semibold px-5 md:px-6 py-2 rounded-full text-sm"
                >
                  Subscribe
                </button>
              </div>
            </div>

            {/* Group Image - Overlapping the top */}
            <div className="hidden md:block absolute bottom-0 right-4 w-[45%] h-[140%] pointer-events-none">
              <Image
                src="/assets/images/group.png"
                alt="Faculty Group"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>
        </div>

        {/* 2. Main Footer Section - This takes the full screen width */}
        <div
          className="w-full bg-[#1E3786] text-white pt-16 md:pt-[180px] pb-12 mt-[-10px]"
          // style={{
          //   backgroundImage: `url('/assets/images/Faculty/footer_bg.png')`,
          //   backgroundSize: "cover",
          //   backgroundPosition: "center",
          // }}
        >
          <div className="section-wid ">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-white/10 pb-12">
              {/* Logo Column */}
              <div className="md:col-span-4 space-y-4">
                <div className="relative w-[180px] h-9">
                  <Image
                    src="/assets/images/footer_logo.png"
                    alt="Faculty Group"
                    fill
                    className="h-full  w-full"
                    priority
                  />
                </div>
                <p className="text-md text-white leading-relaxed max-w-sm">
                  FacultyPro is a specialized academic recruitment platform
                  connecting qualified educators with reputable colleges and
                  institutions seeking excellence in teaching, research, and
                  academic leadership.
                </p>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-[#fffefe33] p-3"><Mail className="text-[#F2B31D] text-[15px] "/></div>
                  <div className="text-[#fff]">support@facultypro.in</div>
                </div>
              </div>

              {/* Links Columns */}
              <div className="md:col-span-2">
                <h3 className="text-md md:text-lg font-medium mb-6 border-l-2 border-[#F2B31D] pl-3 uppercase tracking-wider text-[#fff]">
                  Useful links
                </h3>
                <ul className="space-y-3 text-xs text-gray-400">
                  <li>
                    <a
                      href="/about"
                      className="text-white hover:text-gray-400 transition-colors"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="/jobs"
                      className="text-white hover:text-gray-400 transition-colors"
                    >
                      Jobs
                    </a>
                  </li>
                  {/* <li>
                  <a
                    href="/contact"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Contact Us
                  </a>
                </li> */}
                </ul>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-md md:text-lg text-[#fff] font-medium mb-6 border-l-2 border-[#F2B31D] pl-3 uppercase tracking-wider">
                  Regions
                </h3>
                <div
                  className="grid   gap-y-2 text-md text-gray-400"
                  style={{ rowGap: "10px" }}
                >
                  {state?.locationList?.slice(0, 4)?.map((item, index) => (
                    <p
                      key={index}
                      onClick={() => {
                        router.push(`/jobs?location=${item.value}`);
                        if (pathname === "/jobs") {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      className="text-white hover:text-gray-400 transition-colors cursor-pointer"
                    >
                      {item?.label}
                    </p>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-md md:text-lg text-[#fff] font-medium mb-6 border-l-2 border-[#F2B31D] pl-3 uppercase tracking-wider">
                  Job Category
                </h3>
                <ul className="space-y-3 text-md text-gray-400">
                  {state?.jobCatList?.slice(0, 4)?.map((item) => (
                    <li key={item.value}>
                      <p
                        href={`/jobs?category=${item.value}`}
                        className="text-white hover:text-gray-400 transition-colors cursor-pointer"
                        onClick={() => {
                          router.push(`/jobs?job-category=${item.value}`);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        {item.label}
                      </p>
                    </li>
                  ))}
                  {/* <li>
                  <a
                    href="/privacy-policy"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms-conditions"
                    className="text-white hover:text-gray-400 transition-colors"
                  >
                    Terms & Conditions
                  </a>
                </li> */}
                </ul>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-md md:text-lg text-[#fff] font-medium mb-6 border-l-2 border-[#F2B31D] pl-3 uppercase tracking-wider">
                  Official links
                </h3>
                <ul className="space-y-3 text-md text-gray-400">
                  <li>
                    <a
                      href="/privacy-policy"
                      className="text-white hover:text-gray-400 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/terms-conditions"
                      className="text-white hover:text-gray-400 transition-colors"
                    >
                      Terms & Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      href="/remove-account"
                      className="text-white hover:text-gray-400 transition-colors"
                    >
                      Delete Account
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Socials and Copyright */}
            <div className="mt-8 flex flex-col items-center gap-6">
              <div className="flex gap-4">
              
              <a
               
                href="https://www.facebook.com/thefacultypro"
                target="_blank"
                className="w-10 h-10 md:w-12 md:h-12  flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white hover:text-[#1E3786] transition-all"
              >
                <Facebook className="w-5 h-5 md:w-15 md:h-15" />
              </a>

              <a
                
                href="https://x.com/thefacultypro"
                target="_blank"
                className="w-10 h-10 md:w-12 md:h-12  flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white hover:text-[#1E3786] transition-all"
              >
                {" "}
                𝕏
               
              </a>

              <a
                
                href="https://www.instagram.com/thefacultypro/"
                target="_blank"
                className="w-10 h-10 md:w-12 md:h-12  flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white hover:text-[#1E3786] transition-all"
              >
                <Instagram className="w-5 h-5 md:w-15 md:h-15" />
              </a>

              <a
               
                href="https://www.linkedin.com/company/thefacultypro/"
                target="_blank"
                className="w-10 h-10 md:w-12 md:h-12  flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white hover:text-[#1E3786] transition-all"
              >
                <Linkedin className="w-5 h-5 md:w-15 md:h-15" />
              </a>
              <a
               
                href="https://www.youtube.com/@thefacultypro"
                target="_blank"
                className="w-10 h-10 md:w-12 md:h-12  flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white hover:text-[#1E3786] transition-all"
              >
                <Youtube className="w-5 h-5 md:w-15 md:h-15" />
              </a>
              <a
               
                href="https://www.pinterest.com/thefacultypro/"
                target="_blank"
                className="w-10 h-10 md:w-12 md:h-12  flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white hover:text-[#1E3786] transition-all"
              >
                <FaPinterestP className="w-5 h-5 md:w-15 md:h-15" />
              </a>
            </div>
              <p className="text-xs md:text-[14px] text-white/80  tracking-widest">
                Copyright 2026 © Sree Vidhya E-Learning Solutions

                 {/* Concept by{" "}
                <a
                  href="http://irepute.in/"
                  target="_blank"
                  className="text-underline"
                >
                  repute
                </a> */}
              </p>
            </div>
          </div>
        </div>
      </footer>

      <Modal
        isOpen={state.successSubscription}
        setIsOpen={() => {
          setState({ errors: {}, successSubscription: false });
        }}
        title="User Subscription"
        width="auto"
        hideHeader={true}
        renderComponent={() => (
          <div className="relative h-fit bg-[#f3f4f6] flex flex-col items-center justify-center text-center p-8 overflow-hidden">
            <h2 className="text-xl font-bold text-green-500 mb-6 z-10">
              Subscription Successfull. 
            </h2>

            <p className="text-gray-600  max-w-lg text-sm leading-relaxed z-10">
               Thank you for joining our newsletter.
            </p>
          </div>
        )}
      />
    </>
  );
};

export default Footer;
