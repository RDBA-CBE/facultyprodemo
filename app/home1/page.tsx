
'use client';

import { motion } from 'framer-motion';
import InstitutionPartners from '@/components/common-components/InstitutionPartners';
import Footer from '@/components/common-components/new_components/Footer';
import TopHiringColleges from '@/components/common-components/new_components/TopHiringColleges';
import StatsSection from '@/components/common-components/new_components/StatsSection';
import DownloadAppSection from '@/components/common-components/new_components/DownloadApp';
import FaqResumeSection from '@/components/common-components/new_components/FaqSection';
import FindYourJob from '@/components/common-components/new_components/FindYourJob';
import SplitBanner from '@/components/common-components/new_components/SplitBanner';
import HRSection from '@/components/common-components/new_components/HRSection';
import { useEffect, useState } from 'react';
import Models from '@/imports/models.import';

export default function Home1Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [collegeId, setCollegeId] = useState<any>(null);

  useEffect(() => {
    const loggedIn = !!localStorage.getItem('token');
    setIsLoggedIn(loggedIn);
    if (!loggedIn) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openLoginModal'));
      }, 300);
    } else {
      fetchUserDetail();
    }
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handleLoginSuccess = () => {
      document.body.style.overflow = '';
      setIsLoggedIn(true);
      fetchUserDetail();
    };
    window.addEventListener('loginSuccess', handleLoginSuccess);
    return () => window.removeEventListener('loginSuccess', handleLoginSuccess);
  }, []);

  const fetchUserDetail = async () => {
    const profileStr = localStorage.getItem('user');
    if (!profileStr) return;
    const profile = JSON.parse(profileStr);
    try {
      const res: any = await Models.profile.details(profile.id);
      setCollegeId(res.college_ids);
    } catch {}
  };

  return (
    <div className='min-h-screen bg-[#f9fafb]'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SplitBanner/>
        <TopHiringColleges />
        <StatsSection />
        <FindYourJob collegeId={collegeId} />
        <div id="institutionalHR">
          <HRSection/>
        </div>
        <InstitutionPartners />
        <FaqResumeSection />
        <Footer />
      </motion.div>
    </div>
  );
}