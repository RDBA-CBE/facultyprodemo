import React from "react";
import Image from "next/image";
import { Search } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-gray-50 min-h-[650px] flex items-center">
      <div className="section-wid w-full px-4 sm:px-6 lg:px-0 pt-[80px] lg:pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          {/* Left Content */}
          <div className="space-y-6 flex flex-col justify-center">
            
            {/* Badge */}
            <div>
              <span className="inline-block bg-gradient-to-r from-[#F2B31D] to-transparent text-[#111111] px-5 py-2 rounded-full text-sm sm:text-base font-medium">
                Finding Job
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-[28px] sm:text-[36px] lg:text-[50px] leading-[38px] sm:leading-[48px] lg:leading-[60px] font-medium text-black">
                Find Your Dream Job <br className="hidden sm:block" />
                Today!
              </h1>
              <p className="text-black-600 max-w-lg text-sm sm:text-base">
                Ultrices purus dolor viverra mi laoreet at cursus justo.
                Ultrices purus diam egestas amet faucibus tempor blandit.
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row sm:flex-wrap xl:flex-nowrap max-w-full lg:max-w-2xl">
              <input
                type="text"
                placeholder="Job Title or College"
                className="w-full sm:flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none text-base"
              />

              <select className="w-full sm:w-auto px-4 py-3 border border-gray-200 rounded-lg bg-transparent text-base min-w-[160px]">
                <option>Select Location</option>
              </select>

              <select className="w-full sm:w-auto px-4 py-3 border border-gray-200 rounded-lg bg-transparent text-base min-w-[160px]">
                <option>Select Category</option>
              </select>

              <button className="w-full sm:w-auto bg-gray-800 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-700 transition text-base font-medium">
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-8 pt-6">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-black">125K+</div>
                <div className="text-black-600 text-sm">People joined</div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-bold text-black">9.99%</div>
                <div className="text-black-600 text-sm">Success Probability</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-2xl sm:text-3xl font-bold text-black">5.0</div>
                <div className="flex text-lg">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#F2B31D]">★</span>
                  ))}
                </div>

                <div className="flex -space-x-2 ml-2">
                  {["image_1", "image_2", "image_3"].map((img, i) => (
                    <div key={i} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white overflow-hidden">
                      <Image
                        src={`/assets/images/${img}.png`}
                        alt="user"
                        width={40}
                        height={40}
                      />
                    </div>
                  ))}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 text-white rounded-full border-2 border-white flex items-center justify-center text-sm font-bold">
                    +
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center lg:justify-end">
            <Image
              src="/assets/images/home_banner.png"
              alt="Hero Banner"
              width={960}
              height={860}
              className="w-full max-w-xs sm:max-w-md lg:max-w-lg h-auto"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
