"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Joyride, STATUS, EVENTS, ACTIONS } from "react-joyride";
import type { Step, EventData } from "react-joyride";

const TOUR_KEY = "facultypro_tour_completed";

export const tourSteps: Record<string, Step[]> = {
  "/": [
    {
      target: ".auth-buttons",
      title: "Register or Login",
      content: "Create a free account to apply for jobs, save opportunities, upload your resume, and track all your applications in one place.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: ".profile-buttons",
      title: "Your Profile",
      content: "Click here to view your profile, Change password or logout.",
      placement: "bottom",
      skipBeacon: true,
    },

    {
      target: ".search-filters",
      title: "Search & Discover Jobs",
      content: "Use the Location, Department, and Job Role filters to find academic openings perfectly tailored to your specialization.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: ".colleges-section-title",
      title: "Leading Institutions Hiring",
      content: "Discover top colleges and universities actively hiring faculty right now. Click any institution card to view all their open positions.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: ".job-category-filters",
      title: "Browse by Category & City",
      content: "Filter jobs by category (Arts, Engineering, Nursing, etc.) and city to narrow down the most relevant opportunities for you.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: ".find-job-card-first",
      title: "Job Listing Card",
      content: "Each card shows the role, institution, experience level, and location. Click 'View Job' for full details and to apply directly.",
      placement: "right",
      skipBeacon: true,
      skipScroll: true,
    },
    {
      target: ".hr-register-btn",
      title: "Are You an Institutional HR?",
      content: "If you're an HR from a college or university, register here to post vacancies, manage applications, and schedule interviews — all in one place.",
      placement: "top",
      skipBeacon: true,
      skipScroll: true,
    },
    
    {
      target: ".newsletter-input",
      title: "Stay Informed About Academic Opportunities",
      content: "Subscribe with your email to receive timely updates on the latest faculty openings, institutional announcements, and academic career opportunities.",
      placement: "top",
      skipBeacon: true,
    },
  ],
  // Add steps for other pages here
  "/profile": [
    {
      target: ".profile-edit-btn",
      title: "Edit Profile",
      content: "Click here to edit your basic details — name, email, phone, location, experience, and more.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: ".profile-tab-profile",
      title: "Profile Tab",
      content: "View and manage your complete profile — resume, experience, education, skills, projects, publications, and achievements.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: ".profile-tab-qualifications",
      title: "Qualifications Tab",
      content: "Manage your academic qualifications — PhD, NET, SET, SLET status to improve your profile visibility.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: ".profile-tab-preferences",
      title: "Preferences Tab",
      content: "Set your job preferences — preferred colleges, locations, and job seeker status to get personalized job recommendations.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: ".profile-tab-applications",
      title: "My Applications Tab",
      content: "Track all your job applications in one place — view status, interview schedules, and application history.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: ".profile-tab-hr-requests",
      title: "HR Requests Tab",
      content: "View and respond to direct interview requests from institutional HR managers.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: ".profile-tab-saved",
      title: "Saved Jobs Tab",
      content: "Access all the jobs you've bookmarked for later. Apply when you're ready.",
      placement: "bottom",
      skipBeacon: true,
    },
  ],
  "/jobs": [
    {
      target: ".jobs-search-bar",
      title: "Search Jobs",
      content: "Search by job title, position, or keyword to quickly find relevant faculty openings.",
      placement: "bottom",
      skipBeacon: true,
    },
     {
      target: ".jobs-preferred-btn",
      title: "Preferred Jobs",
      content: "Toggle this to see only jobs that match your profile preferences — personalized just for you.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: ".jobs-filter-sidebar",
      title: "Filter Jobs",
      content: "Narrow down results by location, department, category, experience, college, and more using these filters.",
      placement: "right",
      skipBeacon: true,
    },
    {
      target: ".jobs-card-first",
      title: "Job Card",
      content: "Each card shows the role, institution, experience, and location. Click a card to view full details and apply.",
      placement: "top",
      skipBeacon: true,
      skipScroll: true,
    },
   
  ],
};

export default function TourComponent() {
  const pathname = usePathname();
  // const router = useRouter();
  const searchParams = useSearchParams();
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  // Auto-start on first visit — runs after isLoggedIn is resolved
  useEffect(() => {
    if (!mounted || steps.length === 0) return;
    const completed = localStorage.getItem(`${TOUR_KEY}_${pathname}`) === "true";
    if (!completed) {
      // Reset then start so Joyride picks up the updated steps
      setRun(false);
      setTimeout(() => setRun(true), 1000);
    }
  }, [mounted, isLoggedIn]);

  const steps: Step[] = useMemo(() => {
    const base = tourSteps[pathname] ?? [];
    if (pathname !== "/") return base;
    const authStep: Step = isLoggedIn
      ? base[1] // .profile-buttons step
      : base[0]; // .auth-buttons step
    return [authStep, ...base.slice(2)];
  }, [pathname, isLoggedIn]);
  const isCompleted = mounted && localStorage.getItem(`${TOUR_KEY}_${pathname}`) === "true";

  // Selectors that need manual pre-scroll before Joyride renders the tooltip
  const manualScrollTargets: Record<number, string> = {
    // home page
    4: "[data-tour='find-job']",
    5: "#institutionalHR",
  };

  const handleEvent = (data: EventData) => {
    const { status, type, index } = data;

    if (type === EVENTS.STEP_BEFORE && manualScrollTargets[index]) {
      const el = document.querySelector(manualScrollTargets[index]);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem(`${TOUR_KEY}_${pathname}`, "true");
    }
  };

  const startTour = () => {
    setRun(false);
    setTimeout(() => setRun(true), 100);
  };

  // Auto-start tour if navigated from another page
  useEffect(() => {
    if (!mounted) return;
    if (sessionStorage.getItem("autoStartTour") === "true") {
      sessionStorage.removeItem("autoStartTour");
      setTimeout(() => setRun(true), 800);
    }
  }, [mounted]);

  // Hide button on /jobs?slug= (job detail view)
  const isJobDetailView = pathname === "/jobs" && !!searchParams.get("slug");

  if (!mounted || steps.length === 0 || isJobDetailView) return null;

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous
        scrollToFirstStep
        onEvent={handleEvent}
        options={{
          primaryColor: "#1E3786",
          overlayColor: "rgba(0,0,0,0.55)",
          zIndex: 10000,
          scrollOffset: 100,
          scrollDuration: 600,
          showProgress: true,
          buttons: ["back", "skip", "primary"],
          overlayClickAction: false,
          dismissKeyAction: false,
        }}
        styles={{
          tooltip: {
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 8px 32px rgba(30,55,134,0.15)",
          },
          tooltipTitle: {
            fontSize: "16px",
            fontWeight: 700,
            color: "#1E3786",
            marginBottom: "6px",
          },
          tooltipContent: {
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#374151",
          },
          buttonPrimary: {
            backgroundColor: "#1E3786",
            borderRadius: "999px",
            padding: "8px 20px",
            fontSize: "13px",
            fontWeight: 600,
          },
          buttonBack: {
            color: "#1E3786",
            fontSize: "13px",
            fontWeight: 600,
          },
          buttonSkip: {
            color: "#6b7280",
            fontSize: "13px",
          },
        }}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish",
          next: "Next",
          skip: "Skip Tour",
        }}
      />

      <button
        onClick={startTour}
        // title="Start Tour"
        className="fixed bottom-[70px] right-4 z-[9998] w-11 h-11 rounded-full bg-[#f2b31d] text-black shadow-lg hover:bg-[#f2b31f] transition-all duration-200 flex items-center justify-center group"
        aria-label="Start product tour"
      >
        {/* <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7l9-4 9 4v14M9 21V12h6v9" />
        </svg> */}

        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M12 2a7 7 0 0 0-4 12c.5.5 1 1.5 1 2h6c0-.5.5-1.5 1-2a7 7 0 0 0-4-12z" />
        </svg>
        
        <span className="absolute right-16 bg-[#f2b31d] text-black text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow">
          {/* {isCompleted ? "Restart Tour" : "Start Tour"} */}
          User Guide
        </span>
      </button>
    </>
  );
}
