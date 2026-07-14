"use client";

import { Check } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="bg-gray-50">
      {/* ================= HERO SECTION ================= */}

      <div className="bg-[#1E3786] py-[20px] md:py-[50px] px-4 ">
        <div className="max-w-7xl 0px] mx-auto text-center">
          <h1 className="!text-white text-[24px] md:text-[40px] font-medium md:font-semibold">
            About Us
          </h1>
        </div>
      </div>

      {/* <section
        className="relative h-[50vh] flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366216548-37526070297c')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            About Faculty Web
          </h1>
          <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">
            Connecting faculty members with the right academic opportunities.
          </p>
        </div>
      </section> */}

      <section className="bg-clr1 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* LEFT COLUMN */}
            <div className="order-2 lg:order-1">
              {/* Top Image */}
              <div className="w-full">
                <Image
                  src="/assets/images/about-1.png"
                  alt="About Image"
                  width={800}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bottom Paragraph */}
              <div className="mt-8">
                <p>
                 Institutions can efficiently publish vacancies, review applications, and manage recruitment through a
structured system. At the same time, educators can explore opportunities, apply for positions, and track
their application progress in one centralized platform.
FacultyPro aims to support institutions in identifying the right academic talent while enabling educators
to advance their professional careers.
                </p>
                {/* <p className="mt-4">
                  Excepteur sint occaecat cupidatat non proident doloremque aliquam! Iure quis ut amet natus eius cumque optio.
                </p> */}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="order-1 lg:order-2">
              {/* Small Label */}
              {/* <p className="uppercase text-xs tracking-widest font-medium text-[#6C757D] mb-3">
                About Us
              </p> */}

              {/* Heading */}
              <h2 className="text-2xl  font-medium text-[#151515] leading-snug">
                About FacultyPro
              </h2>

              {/* Description */}
              <p className="mt-5 max-w-xl">
                FacultyPro is a specialized academic recruitment platform that connects qualified educators with
reputable colleges and educational institutions. The platform is designed to simplify the faculty hiring
process while providing academic professionals with access to verified career opportunities.
              </p>

              {/* Bottom Image */}
              <div className="mt-10">
                <Image
                  src="/assets/images/about-2.png"
                  alt="Handshake"
                  width={800}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHO WE ARE ================= */}
      {/* <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <img
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655"
            alt="Faculty discussion"
            className="rounded-xl shadow-lg"
          />

          <div>
            <h2 className="text-3xl font-semibold mb-4">Who We Are</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Faculty Web is a dedicated academic job platform designed
              specifically for faculty members and educational institutions.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our goal is to simplify recruitment by providing verified job
              listings, clear job details, and a transparent hiring process.
            </p>
          </div>
        </div>
      </section> */}

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-white pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-7xl 0px] mx-auto text-center">
            {/* <p className="uppercase text-xs tracking-widest font-medium text-[#6C757D] mb-5">
              What we do
            </p> */}
          </div>
          <h2 className="text-2xl font-medium text-[#151515] text-center mb-12">
            What We Do
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect Educators with Opportunities",
                desc: "Discover and apply for verified faculty positions across colleges and institutions.",
                img: "/assets/images/user-1.png",
                imghover: "/assets/images/userico-white.png",
              },
              {
                step: "02",
                title: "Simplify Institutional Recruitment",
                desc: "Institutions can publish vacancies and review applications efficiently.",
                img: "/assets/images/opportunity-1.png",
                imghover: "/assets/images/case-white.png",
              },
              {
                step: "03",
                title: "Streamline Hiring Management",
                desc: "Manage applications, track progress, and communicate with candidates in one platform.",
                img: "/assets/images/hand-shake-1.png",
                imghover: "/assets/images/hand-shake-white.png",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="border border-[#C4C4C4] p-8 text-center hover:shadow-lg transition bg-[url('/assets/images/Faculty/card-bg.png')] bg-cover bg-center bg-no-repeat"
              >
                {/* <span className="text-indigo-600 font-bold text-lg">
                  {item.step}
                </span> */}

                <img src={item.img} alt={item.title} className="mx-auto my-4" />

                <h3 className="text-xl font-semibold mb-2 text-[#313131]">
                  {item.title}
                </h3>
                <p className="">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      {/* <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
              alt="Why choose faculty web"
              className="rounded-xl shadow-lg"
            />

            <div>
              <h2 className="text-3xl font-semibold mb-6">
                Why Choose Faculty Web
              </h2>

              <ul className="space-y-4 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-indigo-600 font-bold">✔</span>
                  Verified institutions and authentic job listings
                </li>
                <li className="flex gap-3">
                  <span className="text-indigo-600 font-bold">✔</span>
                  Faculty-focused platform built for academics
                </li>
                <li className="flex gap-3">
                  <span className="text-indigo-600 font-bold">✔</span>
                  Transparent and simple application process
                </li>
                <li className="flex gap-3">
                  <span className="text-indigo-600 font-bold">✔</span>
                  Saves time for both faculty and institutions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section> */}

      {/* ================= FEATURE CARDS ================= */}
      {/* <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Trusted Institutions",
                img: "https://img.icons8.com/fluency/96/university.png",
                desc: "Only verified academic institutions are listed.",
              },
              {
                title: "Qualified Faculty",
                img: "https://img.icons8.com/fluency/96/teacher.png",
                desc: "Connect with experienced and skilled educators.",
              },
              {
                title: "Easy Hiring",
                img: "https://img.icons8.com/fluency/96/handshake.png",
                desc: "Smooth and efficient recruitment process.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="border rounded-xl p-8 text-center hover:shadow-lg transition"
              >
                <img src={item.img} alt={item.title} className="mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <section
        className="py-20 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: "url('/assets/images/Rectangle-1.png')",
        }}
      >
        <div className="absolute "></div>

        <div className="section-wid w-full px-4 sm:px-6 lg:px-8 xl:px-0 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 ">
            <div className="text-center gap-2 flex flex-col justify-center items-center">
              <div className="pb-6  border-b border-white/30 w-80 flex justify-center">
                <img
                  className="w-[90px] text-center"
                  src="/assets/images/trust.png"
                  alt=""
                />
              </div>

              {/* <div className="hidden lg:block absolute left-2/3 top-1/2 -translate-x-1/2 h-px w-80 bg-white/30"></div> */}

              <p className="text-white text-lg lg:text-2xl font-medium pt-5">
                Trusted Institutions
              </p>
              <p className="text-white">
               Only genuine and authenticated colleges and universities are listed for trusted opportunities.
              </p>
            </div>
            <div className="text-center gap-2 flex flex-col justify-center items-center">
              <div className=" pb-3 border-b border-white/30 w-80 flex justify-center">
                <img
                  className="w-[100px] text-center"
                  src="/assets/images/participant.png"
                  alt=""
                />
              </div>

              {/* <div className="hidden lg:block absolute left-2/3 top-1/2 -translate-x-1/2 h-px w-80 bg-white/30"></div> */}

              <p className="text-white text-lg lg:text-2xl font-medium pt-5">
                Nationwide Reach
              </p>
              <p className="text-white">
               Explore faculty openings from institutions across multiple regions and academic disciplines.
              </p>
            </div>

            <div className="text-center gap-2 flex flex-col justify-center items-center">
              <div className="pb-6  border-b border-white/30 w-80 flex justify-center">
                <img
                  className="w-[90px] text-center"
                  src="/assets/images/career-opportunity.png"
                  alt=""
                />
              </div>

              {/* <div className="hidden lg:block absolute left-2/3 top-1/2 -translate-x-1/2 h-px w-80 bg-white/30"></div> */}

              <p className="text-white text-lg lg:text-2xl font-medium pt-5">
                Career Growth
              </p>
              <p className="text-white">
                Discover opportunities that help you advance your academic career with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wid pt-20 pb-16">
        <div className="lg:col-span-9 ">
          <h2 className="text-2xl md:text-2xl  font-medium  mb-3 text-[#151515]">
            What can I do With Faculty Pro?
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
                    Find and Apply for Faculty Jobs
                  </h3>
                  <p className="text-gray-600 text-md">
                    Explore verified academic openings across institutions.
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
                    Hire Qualified Teaching Professionals Easily
                  </h3>
                  <p className="text-gray-600 text-md">
                    Post vacancies and shortlist candidates effortlessly.
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
                    Manage Applications in One Platform
                  </h3>
                  <p className="text-gray-600 text-md">
                    Track, review, and communicate with applicants.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
