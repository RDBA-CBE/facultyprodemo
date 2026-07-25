"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

const faqs = [
  {
    id: "01",
    question: "Can I upload a CV?",
    answer:
      "Nunc sed a nisl purus. Nibh dis faucibus proin lacus tristique. Sit congue non vitae odio sit erat in. Felis eu ultrices a sed massa. Commodo fringilla sed tempor risus laoreet ultricies ipsum. Habitant morbi faucibus in iaculis lectus.",
  },
  {
    id: "02",
    question: "How long will the recruitment process take?",
    answer:
      "The recruitment process duration may vary depending on the role, number of applicants, and interview stages involved.",
  },
  {
    id: "04",
    question: "Do you recruit for Graduates, Apprentices and Students?",
    answer:
      "Yes, we actively recruit graduates, apprentices, and students across various departments.",
  },
  {
    id: "03",
    question: "What does the recruitment and selection process involve?",
    answer:
      "It includes application screening, interviews, assessments, and final selection based on role requirements.",
  },
  {
    id: "05",
    question:
      "Can I receive notifications for any future jobs that may interest me?",
    answer:
      "Yes, you can subscribe to job alerts and receive notifications for future opportunities.",
  },
];

export default function FaqSection() {
  const [active, setActive] = useState("01");

  return (
    <section className="bg-white py-16">
      <div className="section-wid text-center">
        {/* HEADER */}

        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-[#F2B31D] to-transparent text-black px-6 py-2 rounded-full text-base font-medium">
              FAQ
            </span>
          </div>
          <h2 className="section-ti mb-4">
            Frequently Asked Questions
          </h2>
          <p className=" ">
            There Are Many Variations Of Passages Of Lorem Ipsum AvailableThere
          </p>
        </div>

        {/* FAQ LIST */}
        <div className="mt-14 space-y-4 text-left">
          {faqs.map((item) => {
            const isOpen = active === item.id;

            return (
              <div
                key={item.id}
                className={` transition-all
                ${
                  isOpen ? "bg-[#FFFBF1] p-6" : "border-b border-teal-200 py-3"
                }`}
              >
                <button
                  onClick={() => setActive(isOpen ? null : item.id)}
                  className="flex w-full items-start justify-between gap-6"
                >
                  <div className="flex gap-4">
                    <span className=" font-bold text-yellow-600">
                      {item.id}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900">
                      {item.question}
                    </h3>
                  </div>

                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-yellow-500 text-yellow-600">
                    {isOpen ? <X size={16} /> : <Plus size={16} />}
                  </span>
                </button>

                {/* ANSWER */}
                <div
                  className={`grid transition-all duration-300 ease-in-out
                  ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-4"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden pl-10  text-gray-600">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
