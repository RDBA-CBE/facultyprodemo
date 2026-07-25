"use client";
import React, { useState } from "react";

const TopCategory = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      title: "Login Or Register",
      description:
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
      list: [
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
      ],
      active: activeStep === 0,
    },
    {
      number: "02",
      title: "Fill Your Personal Data",
      description:
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
      list: [
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
      ],
      active: activeStep === 1,
    },
    {
      number: "03",
      title: "Upload Your Resume",
      description:
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
      list: [
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
      ],
      active: activeStep === 2,
    },
    {
      number: "04",
      title: "Find The Match Job",
      description:
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
      list: [
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
        "Classical Latin Literature From 45 BC, Making It Over 2000 Years Old. Richard McClintock, A Latin Professor At Hampden Sydney College In Virginia.",
      ],
      active: activeStep === 3,
    },
  ];

  const activeStepData = steps[activeStep];

  return (
    <section className="py-16 bg-white">
      <div className="section-wid">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-[#F2B31D] to-transparent text-black px-6 py-2 rounded-full text-base font-medium">
              Finding Job
            </span>
          </div>
          <h2 className="section-ti mb-4">Top Categories</h2>
          <p className="">
            There Are Many Variations Of Passages Of Lorem Ipsum Available
          </p>
        </div>

        <div
          className="grid lg:grid-cols-2 items-start mb-12"
          style={{ gap: "60px" }}
        >
          {/* Left Side - Mobile App Mockup */}
          <div className="relative">
            <div className="bg-gradient-to-br from-[#F2B31D] to-[#E5A519] rounded-3xl  pt-[40px]">
              <div className="bg-white rounded-t-[40px] px-6 py-3 shadow-xl max-w-sm mx-auto relative overflow-hidden">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#F2B31D] rounded-b-2xl"></div>

                {/* Phone Header */}
                <div className="flex items-center justify-between mb-6 ">
                  <span className="text-lg">18:01</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-3 bg-gray-800 rounded-sm"></div>
                    <div className="w-6 h-3 bg-gray-800 rounded border border-gray-800">
                      <div className="w-full h-full bg-white rounded-sm"></div>
                    </div>
                  </div>
                </div>

                {/* Profile Section */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">Robert Ross</h3>
                    <p className="text-gray-500 text-xs">29 years</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-12 h-1 bg-gray-200 rounded">
                        <div className="w-3/4 h-full bg-green-500 rounded"></div>
                      </div>
                      <span className="text-green-500 text-xs">+18%</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                    <div className="w-3 h-0.5 bg-orange-500"></div>
                  </div>
                </div>

                {/* <div className="space-y-2 mb-6">
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span>Weight :</span>
                    <span>Height:</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span>Your gender :</span>
                  </div>
                </div> */}

                {/* Navigation Tabs */}
                <div className="flex gap-1 mb-6">
                  <button className="px-3 py-2 text-gray-600 text-xs bg-gray-100 rounded-full">
                    TRANSFER
                  </button>
                  <button className="px-3 py-2 bg-[#F2B31D] text-white rounded-full text-xs font-medium">
                    STATISTICS
                  </button>
                  <button className="px-3 py-2 text-gray-600 text-xs bg-gray-100 rounded-full">
                    HISTORY
                  </button>
                  <button className="px-2 py-2 text-gray-600 text-xs bg-gray-100 rounded-full">
                    DEP
                  </button>
                </div>

                {/* Card */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 right-2 w-12 h-12 border border-white/30 rounded-full"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 border border-white/30 rounded-full"></div>
                    <div className="absolute top-4 left-8 w-1 h-1 bg-white/30 rounded-full"></div>
                    <div className="absolute top-8 left-12 w-1 h-1 bg-white/30 rounded-full"></div>
                    <div className="absolute top-12 left-6 w-1 h-1 bg-white/30 rounded-full"></div>
                    <div className="absolute top-6 left-16 w-1 h-1 bg-white/30 rounded-full"></div>
                    <div className="absolute top-10 left-10 w-1 h-1 bg-white/30 rounded-full"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-end mb-6">
                      <div className="flex gap-1">
                        <span className="bg-white/20 px-2 py-1 rounded text-xs">
                          EUR
                        </span>
                        <span className="bg-white px-2 py-1 rounded text-xs text-blue-800">
                          USD
                        </span>
                        <span className="bg-white/20 px-2 py-1 rounded text-xs">
                          RUR
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-mono">
                        XXXX XXXX XXXX XXXX
                      </div>
                      <div className="text-sm font-medium">NAME SURNAME</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Active Step Detail */}
          <div className="flex-flex-col pt-5">
            <div className="space-y-3 ">
              <div className="text-[#F2B31D] text-xl font-bold">
                {activeStepData.number}
              </div>
              <h3 className="main-ti">{activeStepData.title}</h3>
              <p className=" leading-relaxed">{activeStepData.description}</p>

              {/* Sub-steps */}
              <div className="space-y-4">
                {activeStepData.list.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-[#F2B31D] rounded-sm flex items-center justify-center mt-1 flex-shrink-0 relative">
                      <div className="absolute inset-0 bg-[#F2B31D] opacity-20 rounded-sm transform translate-x-1 translate-y-1"></div>
                      <span className="text-black text-lg font-bold relative z-10">
                        ›
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Steps Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative cursor-pointer"
              onClick={() => setActiveStep(index)}
            >
              <div
                className={`h-1 rounded-full mb-4 ${
                  step.active ? "bg-[#F2B31D]" : "bg-gray-200"
                }`}
              ></div>

              <div className="text-gray-400 text-sm mb-2">{step.number}</div>
              <h4
                className={`sub-ti mb-3 ${
                  step.active ? "!text-[#F2B31D]" : "text-gray-900"
                }`}
              >
                {step.title}
              </h4>
              <p className="text-gray-600  leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopCategory;
