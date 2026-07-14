import React from "react";
import { CheckCircle } from "lucide-react";

const DownloadAppSection = () => {
  return (
    <section className="section-wid  py-16">
      <div className=" grid lg:grid-cols-2 gap-12 items-center justify-center">
        {/* Left Side - Mobile Image */}
        <div className="flex justify-center ">
          <img
            src="/assets/images/Faculty/mobile.png"
            alt="Mobile App"
            className=" drop-shadow-2xl"
          />
        </div>

        {/* Right Side - Content */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl lg:text-4xl font-semibold text-[#1F1F1F] mb-12">
            Download Our Mobile App!
          </h2>

          <div className="space-y-8 ">
            <div className="flex items-start gap-4 ">
              <CheckCircle className="text-[#1E3786] w-6 h-6 mt-1 text-bold" />
              <div>
                <h4 className="sub-ti !font-medium !text-[#1E1E1E]">
                  Download Faculty Pro App
                </h4>
                <p className="">
                  Apply and hire faculty anytime, anywhere.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="text-[#1E3786] w-6 h-6 mt-1" />
              <div>
                <h4 className="sub-ti !font-medium !text-[#1E1E1E]">
                  Get Started on Mobile
                </h4>
                <p className="">
                  Manage applications and job postings with ease.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="text-[#1E3786] w-6 h-6 mt-1" />
              <div>
                <h4 className="sub-ti !font-medium !text-[#1E1E1E]">
                  Smart Hiring at Your Fingertips
                </h4>
                <p className="">
                  Connect institutions and educators instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Store Buttons */}
          <div className="flex flex-wrap gap-6 mt-16">
            <img
              src="/assets/images/Faculty/app_store.png"
              alt="App Store"
              className="h-14 cursor-pointer hover:scale-105 transition"
            />
            <img
              src="/assets/images/Faculty/play_store.png"
              alt="Google Play"
              className="h-14 cursor-pointer hover:scale-105 transition"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;
