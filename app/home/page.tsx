
'use client';

import { motion } from 'framer-motion';
import BannerSection from '@/components/common-components/HeroSection';
import About from '@/components/common-components/about';
import Discover from '@/components/common-components/discover';
import TopCategory from '@/components/common-components/top_category';
import Banner from '@/components/common-components/home_banner';
import InstitutionPartners from '@/components/common-components/InstitutionPartners';
import Testimonials from '@/components/common-components/Testimonials';
import Footer from '@/components/common-components/Footer';

// ---------------- PAGE ----------------
export default function HomePage() {
  
  return (
    <div className='min-h-screen'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <BannerSection />
        <About />
        <div>
          <Discover />
          <TopCategory />
          <Banner />
          <InstitutionPartners />
          <Testimonials />
        </div>
        
        <Footer />
      </motion.div>
    </div>
  );
}