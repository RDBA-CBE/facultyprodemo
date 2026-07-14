import React, { useState } from "react";
import { Plus, X, Upload } from "lucide-react";

const faqData = [
  {
    id: "01",
    question: "What is FacultyPro?",
    answer:
      "FacultyPro is an academic recruitment platform designed to connect qualified educators with colleges and institutions seeking faculty members and academic professionals.",
  },
  {
    id: "02",
    question: "Who can use the FacultyPro platform?",
    answer: "FacultyPro can be used by academic professionals such as lecturers, professors, researchers, andadministrators seeking opportunities, as well as educational institutions looking to recruit qualified faculty",
  },
  {
    id: "03",
    question: "How can I apply for a faculty position?",
    answer: "Candidates can create a profile, upload their resume, and apply directly to available faculty positions through the FacultyPro portal.",
  },
  {
    id: "04",
    question: "How can institutions post job vacancies?",
    answer: "Institutions can register on the platform, create an institutional profile, and publish faculty job openings to attract qualified candidates.",
  },
  {
    id: "05",
    question:
      "Is there a verification process for institutions and candidates?",
    answer: "Yes. FacultyPro verifies registered institutions and reviews user registrations to ensure credibility and maintain the quality of the recruitment process.",
  },
];

const FaqResumeSection = () => {
  const [active, setActive] = useState("01");

  return (
    <section  className="section-wid pt-12 pb-16 ">
      <div className=" grid lg:grid-cols-3 " style={{columnGap:"40px"}}>
        {/* LEFT SIDE - FAQ (WIDER) */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl md:text-2xl font-medium text-[#1F1F1F] mb-3">
            Frequently Asked Questions
          </h2>
          <p className=" mb-10">
            Find answers to common questions about FacultyPro and how it supports academic recruitment and
career opportunities. 
          </p>

          <div className="space-y-8">
            {faqData.map((item) => (
              <div
                key={item.id}
                className={` p-6 transition ${
                  active === item.id
                    ? "rounded-2xl bg-[#1E37860D] shadow-md"
                    : "border-b border-gray-300"
                }`}
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setActive(active === item.id ? "" : item.id)}
                >
                  <div className="flex gap-5 items-center">
                    <span className={`text-2xl font-medium ${active === item.id ? "text-[#1E3786]" : "text-[#6C757D]"}`}>
                      {item.id}
                    </span>
                    <h4 className="sub-ti !font-medium !text-[#1F1F1F]">
                      {item.question}
                    </h4>
                  </div>

                  {active === item.id ? (
                    <div className="bg-[#1E3786] rounded-full p-1">
                      <X className="text-white h-5 w-5" />
                    </div>
                  ) : (
                    <div className="border border-[#1E3786] rounded-full p-1">
                      <Plus className="h-5 w-5 text-[#1E3786]" />
                    </div>
                  )}
                </div>

                {active === item.id && (
                  <p className=" mt-4 pl-14">{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE - SMALLER FORM */}
        <div
          className="relative  overflow-hidden min-h-[400px] md:min-h-[650px]"
          style={{
            backgroundImage: "url('/assets/images/FAQ.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width:"100%",
            height:"100%",
          }}
        >
          {/* Dark Overlay */}

          {/* <div className="relative p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Drop Your Resume Here</h3>
            <p className="text-gray-300 mb-8 text-sm">
              Submit your resume and grow with us
            </p>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-transparent border border-white/30 p-3 rounded-md placeholder-gray-300 focus:outline-none"
              />

              <input
                type="email"
                placeholder="Email ID"
                className="w-full bg-transparent border border-white/30 p-3 rounded-md placeholder-gray-300 focus:outline-none"
              />

              <input
                type="text"
                placeholder="Phone Number"
                className="w-full bg-transparent border border-white/30 p-3 rounded-md placeholder-gray-300 focus:outline-none"
              />

              <select className="w-full bg-transparent border border-white/30 p-3 rounded-md text-gray-200 focus:outline-none">
                <option className="text-black">Select Job Position</option>
              </select>

              <div className="relative">
                <input
                  type="file"
                  className="w-full bg-transparent border border-white/30 p-3 rounded-md text-gray-300 file:hidden"
                />
                <Upload className="absolute right-3 top-3 text-gray-300 w-5 h-5" />
              </div>

              <textarea
                rows="4"
                placeholder="Message"
                className="w-full bg-transparent border border-white/30 p-3 rounded-md placeholder-gray-300 focus:outline-none"
              ></textarea>

              <button
                type="submit"
                className="bg-[#F2B31D] hover:bg-[#F2B31D] text-black font-semibold px-6 py-2 rounded-full mt-4 transition"
              >
                Send application
              </button>
            </form>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default FaqResumeSection;
