
'use client';

import { motion } from 'framer-motion';
import BannerSection from '@/components/common-components/HeroSection';
import About from '@/components/common-components/about';
import Discover from '@/components/common-components/discover';
import TopCategory from '@/components/common-components/top_category';
import Banner from '@/components/common-components/home_banner';
import InstitutionPartners from '@/components/common-components/InstitutionPartners';
import Testimonials from '@/components/common-components/Testimonials';
import Footer from '@/components/common-components/new_components/Footer';
import TopHiringColleges from '@/components/common-components/new_components/TopHiringColleges';
import WhatCanIDo from '@/components/common-components/new_components/WhatCanIDo';
import StatsSection from '@/components/common-components/new_components/StatsSection';
import DownloadAppSection from '@/components/common-components/new_components/DownloadApp';
import FaqResumeSection from '@/components/common-components/new_components/FaqSection';
import FindYourJob from '@/components/common-components/new_components/FindYourJob';
import NewHeroSection from '@/components/common-components/new_components/NewHeroSection';
import SplitBanner from '@/components/common-components/new_components/SplitBanner';
import HRSection from '@/components/common-components/new_components/HRSection';




// ---------------- PAGE ----------------
export default function Home1Page() {
  
  return (
    <div className='min-h-screen bg-[#f9fafb]'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* <BannerSection /> */}
        {/* <NewHeroSection /> */}
        <SplitBanner/>
        <TopHiringColleges />
         <StatsSection />
        <FindYourJob />
        <div id="institutionalHR">
          {/* <WhatCanIDo /> */}
          <HRSection/>
        </div>
       
        <InstitutionPartners />
        {/* <DownloadAppSection /> */}
        <FaqResumeSection />

        {/* <div>
          <Discover />
          <TopCategory />
          <Banner />
          <Testimonials />
        </div> */}
        
        <Footer />
      </motion.div>
    </div>
  );
}
