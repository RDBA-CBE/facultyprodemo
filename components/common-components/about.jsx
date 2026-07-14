import React from "react";
import Image from "next/image";

const About = () => {
  return (
    <section className="py-16 bg-white ">
      <div className=" section-wid">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Image */}
          <div className="relative">
            <Image
              src="/assets/images/about.png"
              alt="About Us"
              width={400}
              height={400}
              className="w-[90%] h-auto rounded-2xl"
            />
          </div>

          {/* Right Content */}
          <div className="space-y-4">
            {/* Badge */}
            <div className="inline-block">
              <span className="bg-gradient-to-r from-[#F2B31D] to-transparent  px-6 py-2 rounded-full text-base font-medium">
                Finding Job
              </span>
            </div>

            {/* Heading */}
            <h2 className="  leading-normal section-ti">
              About Us
            </h2>

            {/* Content */}
            <div className="space-y-4">
              <p className="  leading-relaxed">
                Lorem Ipsum Dolor Sit Amet Consectetur. Turpis Sed Diam Id Leo.
                Nunc Pellentesque Ipsum Amet Orci Enim. Iaculis Mauris Euismod
                Velit Tincidunt Lorem Aliquam Ullamcorper Vivamus. At
                Suspendisse Cras Vulputate Risus Ac Ante Orci. Etiam Mattis
                Porta Sagittis Viverra Sapien Vitae Fringilla. Scelerisque
                Auctor Urna Urna Lectus.
              </p>
              <p className="  leading-relaxed">
                Lorem Ipsum Dolor Sit Amet Consectetur. Turpis Sed Diam Id Leo.
                Nunc Pellentesque Ipsum Amet Orci Enim. Iaculis Mauris Euismod
                Velit Tincidunt Lorem Aliquam Ullamcorper Vivamus. At
                Suspendisse Cras Vulputate Risus Ac Ante Orci. Etiam Mattis
                Porta Sagittis Viverra Sapien Vitae Fringilla. Scelerisque
                Auctor Urna Urna Lectus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
