"use client";

import { Clock, Mail, MapPin, Phone, Plus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function ContactPage() {
  const [active, setActive] = useState("01");
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
  return (
    <main className="bg-gray-50">
      {/* ================= HERO ================= */}

      <div className="bg-[#1E3786] py-[20px] md:py-[50px] px-4 ">
        <div className="max-w-7xl 0px] mx-auto text-center">
          <h1 className="!text-white text-[24px] md:text-[40px] font-medium md:font-semibold">
            Contact Us
          </h1>
        </div>
      </div>

      <section className="bg-clr1 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT CONTENT */}
            <div>
              {/* Heading */}
              <h2 className="text-2xl font-medium text-[#151515]  mb-6">
                You Will Grow, You Will <br />
                Succeed. We Promise That
              </h2>

              {/* Description */}
              <p className=" mb-10 ">
                Pellentesque arcu facilisis nunc mi proin. Dignissim mattis in
                lectus tincidunt tincidunt ultrices. Diam convallis morbi
                pellentesque adipiscing.
              </p>

              {/* Contact Grid */}
              <div className="grid sm:grid-cols-2 gap-y-8 gap-x-12">
                {/* Call */}
                <div className="flex flex-col items-start gap-3">
                  <Phone className="text-[#ffb400] mt-1" size={20} />
                  <div>
                    <h4 className="text-lg mb-2 font-semibold text-[#313131]">
                      Call for inquiry
                    </h4>
                    <p className=" text-sm">+257 388-6895</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col items-start gap-3">
                  <Mail className="text-[#ffb400] mt-1" size={20} />
                  <div>
                    <h4 className="text-lg mb-2 font-semibold text-[#313131]">
                      Send us email
                    </h4>
                    <p className=" text-sm">kramulous@sbcglobal.net</p>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex flex-col items-start gap-3">
                  <Clock className="text-[#ffb400] mt-1" size={20} />
                  <div>
                    <h4 className="text-lg mb-2 font-semibold text-[#313131]">
                      Opening hours
                    </h4>
                    <p className=" text-sm">Mon - Fri: 10AM - 10PM</p>
                  </div>
                </div>

                {/* Office */}
                <div className="flex flex-col items-start gap-3">
                  <MapPin className="text-[#ffb400] mt-1" size={20} />
                  <div>
                    <h4 className="text-lg mb-2 font-semibold text-[#313131]">
                      Office
                    </h4>
                    <p className=" text-sm">
                      19 North Road Piscataway, NY 08854
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative w-full h-[500px]">
              <Image
                src="/assets/images/contact.png" // replace with your image path
                alt="Professional Woman"
                fill
                className="object-cover rounded-sm"
              />
            </div>
          </div>
        </div>
      </section>

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
            Contact & Support
          </h1>
          <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">
            We’re here to assist faculty members and institutions every step of the way.
          </p>
        </div>
      </section> */}

      {/* ================= CONTACT INFO CARDS ================= */}
      {/* <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Get in Touch
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Email Support",
              value: "support@facultyweb.com",
              img: "https://img.icons8.com/fluency/96/email.png",
            },
            {
              title: "Phone Support",
              value: "+91 90000 00000",
              img: "https://img.icons8.com/fluency/96/phone.png",
            },
            {
              title: "Office Hours",
              value: "Mon – Fri, 9:00 AM – 6:00 PM",
              img: "https://img.icons8.com/fluency/96/time.png",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white border rounded-xl p-8 text-center hover:shadow-lg transition"
            >
              <img src={item.img} alt={item.title} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.value}</p>
            </div>
          ))}
        </div>
      </section> */}

      <section
        className="py-20 bg-cover bg-center bg-no-repeat relative my-5"
        style={{
          backgroundImage: "url('/assets/images/Rectangle-1.png')",
        }}
      >
        <div className="absolute "></div>

        <div className="section-wid w-full px-4 sm:px-6 lg:px-8 xl:px-0 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 ">
            <div className="text-center gap-2 flex flex-col justify-center items-center">
              <div className="pb-8  border-b border-white/30 w-80 flex justify-center">
                <img
                  className="w-[70px] text-center"
                  src="/assets/images/Vector.png"
                  alt=""
                />
              </div>

              {/* <div className="hidden lg:block absolute left-2/3 top-1/2 -translate-x-1/2 h-px w-80 bg-white/30"></div> */}

              <p className="text-white text-lg lg:text-2xl font-medium pt-5">
                Trusted Institutions
              </p>
              <p className="text-white">
                Only verified academic institutions are listed.
              </p>
            </div>
            <div className="text-center gap-2 flex flex-col justify-center items-center">
              <div className="pb-8  border-b border-white/30 w-80 flex justify-center">
                <img
                  className="w-[70px] text-center"
                  src="/assets/images/Vector.png"
                  alt=""
                />
              </div>

              {/* <div className="hidden lg:block absolute left-2/3 top-1/2 -translate-x-1/2 h-px w-80 bg-white/30"></div> */}

              <p className="text-white text-lg lg:text-2xl font-medium pt-5">
                Trusted Institutions
              </p>
              <p className="text-white">
                Only verified academic institutions are listed.
              </p>
            </div>

            <div className="text-center gap-2 flex flex-col justify-center items-center">
              <div className="pb-8  border-b border-white/30 w-80 flex justify-center">
                <img
                  className="w-[70px] text-center"
                  src="/assets/images/Vector.png"
                  alt=""
                />
              </div>

              {/* <div className="hidden lg:block absolute left-2/3 top-1/2 -translate-x-1/2 h-px w-80 bg-white/30"></div> */}

              <p className="text-white text-lg lg:text-2xl font-medium pt-5">
                Trusted Institutions
              </p>
              <p className="text-white">
                Only verified academic institutions are listed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wid py-16">
        <div className="lg:col-span-2">
          <h2 className="text-2xl md:text-2xl font-medium text-[#1F1F1F] mb-3">
            Frequently Asked Questions
          </h2>
          <p className=" mb-10">
            Find answers to common questions about FacultyPro and how it supports academic recruitment and career opportunities.
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
                    <span
                      className={`text-2xl font-medium ${active === item.id ? "text-[#1E3786]" : "text-[#6C757D]"}`}
                    >
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
      </section>

      {/* ================= SUPPORT CATEGORIES ================= */}
      {/* <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-12">
            How Can We Help?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Faculty Support",
                desc: "Help with profile setup, applications, and job listings.",
                img: "https://img.icons8.com/fluency/96/teacher.png",
              },
              {
                title: "Institution Support",
                desc: "Assistance with job postings and recruitment.",
                img: "https://img.icons8.com/fluency/96/university.png",
              },
              {
                title: "Technical Support",
                desc: "Website access, login issues, and system help.",
                img: "https://img.icons8.com/fluency/96/settings.png",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="border rounded-xl p-8 text-center hover:shadow-lg transition"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ================= LOCATION SECTION ================= */}
      {/* <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <img
              src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
              alt="Office location"
              className="rounded-xl shadow-lg"
            />

            <div>
              <h2 className="text-3xl font-semibold mb-4">Our Office</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Faculty Web operates remotely with support teams across India.
                Our goal is to provide reliable assistance to both faculty
                members and academic institutions nationwide.
              </p>
              <p className="text-gray-600">📍 India</p>
            </div>
          </div>
        </div>
      </section> */}
    </main>
  );
}
