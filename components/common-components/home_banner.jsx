import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="w-full  mb-16">
      <div className="section-wid">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900">
          <div className="grid grid-cols-1 items-center gap-10 px-10 py-1 md:grid-cols-2 md:px-14 ">
            
            {/* LEFT CONTENT */}
            <div className="text-white">
              <h1 className="text-4xl font-bold leading-tight md:text-[40px]">
                Create A Better <br />
                Future For Yourself
              </h1>

              <p className="mt-5 max-w-lg text-sm text-neutral-300 md:text-base">
                At eu lobortis pretium tincidunt amet lacus ut aenean aliquet.
                Blandit a massa elementum id scelerisque rhoncus.
              </p>

              <button className="mt-8 inline-flex items-center justify-center rounded-full bg-[#F2B31D] px-8 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300">
                Search Job
              </button>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative flex justify-center md:justify-end">
              <Image
                src="/assets/images/group.png"
                alt="Professional Team"
                width={520}
                height={520}
                className="object-contain w-full"
                priority
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
