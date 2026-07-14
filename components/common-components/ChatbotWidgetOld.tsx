"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type MouseEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageCircle,
  X,
  ChevronLeft,
  ChevronDown,
  Send,
  Bot,
  RotateCcw,
  Search,
  GraduationCap,
  FlaskConical,
  Building2,
  BookOpen,
  Keyboard,
  FileText,
  HelpCircle,
  Headset,
  User,
  ClipboardList,
  Star,
  House,
  Briefcase,
  type LucideIcon,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Models from "@/imports/models.import";

// Set in `.env.local`: NEXT_PUBLIC_CHAT_API_URL=https://your-api.com/chat
// Optional: NEXT_PUBLIC_CHAT_API_KEY (sent as Authorization: Bearer …)

// ─── Types ──────────────────────────────────────────────────────────────────

type MessageRole = "bot" | "user";

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  searchPath?: string;
  linkSuggestions?: { label: string; href: string }[];
}

interface QuickReply {
  label: string;
  value: string;
  icon?: string;
}

interface FlowStep {
  id: string;
  message: string;
  quickReplies?: QuickReply[];
  link?: { label: string; href: string };
  next?: (value: string) => string;
  isEnd?: boolean;
}

type FlowMap = Record<string, FlowStep>;
type JobFilterType =
  | "location"
  | "category"
  | "department"
  | "jobRole"
  | "college";

type JobFilterOption = {
  id: string | number;
  label: string;
  value: string | number;
};
type RecentFilterSearch = {
  label: string;
  path: string;
};

// Colours: Tailwind `primary` (see `app/globals.css` + `tailwind.config.ts`).

// ─── Conversation flows ───────────────────────────────────────────────────────

const FLOWS: FlowMap = {
  // ── ROOT (guest vs signed-in) ─────────────────────────────────────────────
  root_guest: {
    id: "root_guest",
    message:
      "Hi! I'm FacultyBot 🎓\nYou're browsing as a guest — view every listing; sign in to apply and track applications.\nWhat would you like to do?",
    quickReplies: [
      { label: "🔍 Job search (menu)", value: "job_search_start" },
      // { label: "⌨️ Type my own search", value: "manual_search_hint" },
      { label: "📝 How to register & apply", value: "register_help" },
      { label: "❓ FAQ", value: "faq_start" },
      { label: "📞 Support", value: "support_start" },
    ],
  },
  root_auth: {
    id: "root_auth",
    message:
      "Hi! I'm FacultyBot 🎓\nYou're signed in — you can apply, track applications, and use saved jobs.\nWhat do you need?",
    quickReplies: [
      { label: "🔍 Job search (menu)", value: "job_search_start" },
      // { label: "⌨️ Type my own search", value: "manual_search_hint" },
      { label: "👤 Profile & resume", value: "profile_start" },
      { label: "❓ FAQ", value: "faq_start" },
      { label: "📞 Support", value: "support_start" },
    ],
  },
  manual_search_hint: {
    id: "manual_search_hint",
    message:
      "Use the **search box** at the bottom. Type a job title, city, department, or college — then press **Search**.\nYour message is sent to the chat service API and the reply is shown here.",
    quickReplies: [{ label: "🏠 Main menu", value: "root" }],
  },
  register_help: {
    id: "register_help",
    message:
      "To apply on FacultyPro (free for faculty):\n1️⃣ Create an account from the site header (Sign in / Register)\n2️⃣ Complete your profile: resume, education, experience\n3️⃣ Open any job and click **Apply**",
    link: { label: "Browse jobs →", href: "/jobs" },
    quickReplies: [
      { label: "📝 Full apply help", value: "apply_start" },
      { label: "🏠 Main menu", value: "root" },
    ],
    isEnd: true,
  },
  saved_jobs_link: {
    id: "saved_jobs_link",
    message:
      "Your bookmarked positions are listed on **Saved Jobs** (also a tab in your profile).",
    link: { label: "Open Saved Jobs →", href: "/saved-jobs" },
    quickReplies: [{ label: "🏠 Main menu", value: "root" }],
    isEnd: true,
  },
  after_manual: {
    id: "after_manual",
    message: "",
    quickReplies: [
      { label: "🏠 Main menu", value: "root" },
      { label: "⌨️ Another search", value: "manual_search_hint" },
    ],
  },

  // ── JOB SEARCH ────────────────────────────────────────────────────────────
  job_search_start: {
    id: "job_search_start",
    message: "Great! What type of position are you looking for?",
    quickReplies: [
      { label: "🎓 Teaching", value: "job_teaching" },
      { label: "🔬 Research", value: "job_research" },
      { label: "🏛️ Administrative", value: "job_admin" },
      { label: "📚 Any / Browse All", value: "job_browse_all" },
    ],
  },
  job_teaching: {
    id: "job_teaching",
    message: "Which department / stream?",
    quickReplies: [
      { label: "Engineering & Technology", value: "job_browse_all" },
      { label: "Arts & Science", value: "job_browse_all" },
      { label: "Management / MBA", value: "job_browse_all" },
      { label: "Medical / Pharmacy", value: "job_browse_all" },
      { label: "Law", value: "job_browse_all" },
    ],
  },
  job_research: {
    id: "job_research",
    message: "Which research area interests you?",
    quickReplies: [
      { label: "STEM", value: "job_browse_all" },
      { label: "Humanities & Social Sciences", value: "job_browse_all" },
      { label: "Applied Sciences", value: "job_browse_all" },
      { label: "Show all research jobs", value: "job_browse_all" },
    ],
  },
  job_admin: {
    id: "job_admin",
    message: "Select administrative role:",
    quickReplies: [
      { label: "HOD / Dean", value: "job_browse_all" },
      { label: "Registrar / Admin Officer", value: "job_browse_all" },
      { label: "Library / IT Staff", value: "job_browse_all" },
    ],
  },
  job_browse_all: {
    id: "job_browse_all",
    message:
      "Perfect! I'll take you to the jobs listing. You can apply filters there to narrow down your search. 🚀",
    link: { label: "Browse Jobs →", href: "/jobs" },
    quickReplies: [{ label: "🏠 Back to Menu", value: "root" }],
    isEnd: true,
  },

  // ── PROFILE HELP ──────────────────────────────────────────────────────────
  profile_start: {
    id: "profile_start",
    message: "Which profile section do you need help with?",
    quickReplies: [
      { label: "📄 Resume Upload", value: "profile_resume" },
      { label: "🧾 Profile Summary", value: "profile_summary" },
      { label: "🏫 Academic Responsibility", value: "profile_academic" },
      { label: "💼 Experience", value: "profile_experience" },
      { label: "🎓 Education", value: "profile_education" },
      { label: "🗂️ Projects", value: "profile_projects" },
      { label: "🛠️ Skills", value: "profile_skills" },
      { label: "📖 Publications", value: "profile_publications" },
      { label: "🏆 Achievements", value: "profile_achievements" },
      { label: "📋 My Applications", value: "profile_my_applications" },
      { label: "⭐ Saved Jobs", value: "profile_saved_jobs" },
      { label: "🎓 Qualifications", value: "profile_qualifications" },
      { label: "⚙️ Preference", value: "profile_preferences" },
      { label: "⬅️ Back to Main Menu", value: "root" },
    ],
  },
  profile_resume: {
    id: "profile_resume",
    message:
      "To upload your resume:\n1️⃣ Go to Profile page\n2️⃣ Click the 'Resume' section\n3️⃣ Click 'Upload Resume' button\n4️⃣ Choose PDF / DOC file (max 5 MB)\n5️⃣ Click Save ✅",
    link: { label: "Go to Resume →", href: "/profile?tab=Profile#resume-section" },
    quickReplies: [
      { label: "🔙 More Profile Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  profile_summary: {
    id: "profile_summary",
    message:
      "To update Profile Summary:\n1️⃣ Profile page → Profile Summary section\n2️⃣ Click edit icon\n3️⃣ Add your summary/highlights\n4️⃣ Save ✅",
    link: {
      label: "Go to Profile Summary →",
      href: "/profile?tab=Profile#headline-section",
    },
    quickReplies: [
      { label: "🔙 More Profile Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  profile_academic: {
    id: "profile_academic",
    message:
      "To add Academic Responsibility:\n1️⃣ Profile page → Academic Responsibility section\n2️⃣ Choose responsibilities from list\n3️⃣ Save ✅",
    link: {
      label: "Go to Academic Responsibility →",
      href: "/profile?tab=Profile#academic-section",
    },
    quickReplies: [
      { label: "🔙 More Profile Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  profile_experience: {
    id: "profile_experience",
    message:
      "To add Experience:\n1️⃣ Profile page → Experience section\n2️⃣ Click '+ Add Experience'\n3️⃣ Fill in College name, Designation, Duration\n4️⃣ Click Save ✅\n\nTip: Add all previous academic roles to increase visibility! 💡",
    link: { label: "Go to Experience →", href: "/profile?tab=Profile#employment-section" },
    quickReplies: [
      { label: "🔙 More Profile Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  profile_education: {
    id: "profile_education",
    message:
      "To add Education:\n1️⃣ Profile → Education section\n2️⃣ Click '+ Add Education'\n3️⃣ Enter Degree, Institution, Year, CGPA\n4️⃣ Save ✅\n\nAdd all degrees from UG to PhD for better matching! 🎓",
    link: { label: "Go to Education →", href: "/profile?tab=Profile#education-section" },
    quickReplies: [
      { label: "🔙 More Profile Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  profile_projects: {
    id: "profile_projects",
    message:
      "To add Projects:\n1️⃣ Profile page → Projects section\n2️⃣ Click '+ Add Project'\n3️⃣ Enter title, details, duration/link\n4️⃣ Save ✅",
    link: { label: "Go to Projects →", href: "/profile?tab=Profile#projects-section" },
    quickReplies: [
      { label: "🔙 More Profile Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  profile_skills: {
    id: "profile_skills",
    message:
      "To add Skills:\n1️⃣ Profile → Skills section\n2️⃣ Type skill name and select from dropdown\n3️⃣ Choose proficiency level\n4️⃣ Save ✅\n\nAdd subject expertise, software tools, and soft skills! 💡",
    link: { label: "Go to Skills →", href: "/profile?tab=Profile#skills-section" },
    quickReplies: [
      { label: "🔙 More Profile Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  profile_publications: {
    id: "profile_publications",
    message:
      "To add Publications:\n1️⃣ Profile → Publications section\n2️⃣ Click '+ Add Publication'\n3️⃣ Enter Title, Journal/Conference, Year, DOI\n4️⃣ Save ✅\n\nPublications boost your research profile significantly! 📖",
    link: {
      label: "Go to Publications →",
      href: "/profile?tab=Profile#publications-section",
    },
    quickReplies: [
      { label: "🔙 More Profile Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  profile_achievements: {
    id: "profile_achievements",
    message:
      "To add Achievements:\n1️⃣ Profile → Achievements section\n2️⃣ Click '+ Add Achievement'\n3️⃣ Enter award name, issuing body, year\n4️⃣ Save ✅\n\nAwards, certifications, and recognition all count! 🏆",
    link: {
      label: "Go to Achievements →",
      href: "/profile?tab=Profile#achievements-section",
    },
    quickReplies: [
      { label: "🔙 More Profile Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  profile_my_applications: {
    id: "profile_my_applications",
    message:
      "To track your applications:\n1️⃣ Go to Profile page\n2️⃣ Open the 'My Applications' tab\n3️⃣ Check statuses and updates ✅",
    link: { label: "Open My Applications →", href: "/profile?tab=My+Applications" },
    quickReplies: [
      { label: "🔙 More Profile Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  profile_saved_jobs: {
    id: "profile_saved_jobs",
    message:
      "Your bookmarked jobs are available in Profile under the Saved Jobs tab.",
    link: { label: "Open Saved Jobs →", href: "/profile?tab=Saved+Jobs" },
    quickReplies: [
      { label: "🔙 More Profile Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  profile_qualifications: {
    id: "profile_qualifications",
    message:
      "To update qualifications:\n1️⃣ Go to Profile page\n2️⃣ Open 'Qualifications' tab\n3️⃣ Add or edit your academic qualifications\n4️⃣ Save ✅",
    link: { label: "Open Qualifications →", href: "/profile?tab=Qualifications" },
    quickReplies: [
      { label: "🔙 More Profile Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  profile_preferences: {
    id: "profile_preferences",
    message:
      "To set your job preferences:\n1️⃣ Go to Profile page\n2️⃣ Open 'Preferrences' tab\n3️⃣ Select preferred location/college\n4️⃣ Save ✅",
    link: { label: "Open Preference →", href: "/profile?tab=Preferrences" },
    quickReplies: [
      { label: "🔙 More Profile Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },

  // ── APPLY FOR JOB ─────────────────────────────────────────────────────────
  apply_start: {
    id: "apply_start",
    message: "Do you already have a FacultyPro account?",
    quickReplies: [
      { label: "✅ Yes, I'm registered", value: "apply_logged_in" },
      { label: "❌ No, new user", value: "apply_new_user" },
    ],
  },
  apply_logged_in: {
    id: "apply_logged_in",
    message:
      "Great! Here's how to apply:\n1️⃣ Go to Jobs listing\n2️⃣ Find a job you like\n3️⃣ Click on job card → 'Apply Now'\n4️⃣ Confirm application ✅\n\nYou can track status in Profile → My Applications 📋",
    link: { label: "Browse & Apply →", href: "/jobs" },
    quickReplies: [
      { label: "📋 My Applications", value: "apply_track" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  apply_new_user: {
    id: "apply_new_user",
    message:
      "Welcome! To apply for jobs:\n1️⃣ Register / Sign Up on FacultyPro\n2️⃣ Complete your profile (Resume, Experience, Education)\n3️⃣ Browse jobs and click 'Apply Now'\n\nRegistration is FREE! 🎉",
    link: { label: "Browse Jobs →", href: "/jobs" },
    quickReplies: [
      { label: "👤 Profile Setup Help", value: "profile_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  apply_track: {
    id: "apply_track",
    message:
      "To track your applications:\n1️⃣ Go to Profile page\n2️⃣ Click 'My Applications' tab\n3️⃣ See status: Pending / Shortlisted / Rejected\n\nHR Requests also show in the 'HR Requests' tab! 📬",
    link: { label: "My Applications →", href: "/profile?tab=My+Applications" },
    quickReplies: [{ label: "🏠 Main Menu", value: "root" }],
    isEnd: true,
  },

  // ── FAQ ───────────────────────────────────────────────────────────────────
  faq_start: {
    id: "faq_start",
    message: "Choose your question:",
    quickReplies: [
      { label: "What is FacultyPro?", value: "faq_what_is" },
      { label: "Who can use FacultyPro platform?", value: "faq_who_can_use" },
      { label: "How can I apply for a faculty position?", value: "faq_apply_position" },
      { label: "How can institutions post job vacancies?", value: "faq_post_vacancy" },
      { label: "Is there a verification process?", value: "faq_verification" },
      { label: "⬅️ Back to Main Menu", value: "root" },
    ],
  },
  faq_what_is: {
    id: "faq_what_is",
    message:
      "FacultyPro is an academic recruitment platform designed to connect qualified educators with colleges and institutions seeking faculty members and academic professionals.",
    quickReplies: [
      { label: "🔙 More FAQs", value: "faq_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  faq_who_can_use: {
    id: "faq_who_can_use",
    message:
      "FacultyPro can be used by academic professionals such as lecturers, professors, researchers, and administrators seeking opportunities, as well as educational institutions looking to recruit qualified faculty.",
    quickReplies: [
      { label: "🔙 More FAQs", value: "faq_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  faq_apply_position: {
    id: "faq_apply_position",
    message:
      "Candidates can create a profile, upload their resume, and apply directly to available faculty positions through the FacultyPro portal.",
    quickReplies: [
      { label: "🔙 More FAQs", value: "faq_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  faq_post_vacancy: {
    id: "faq_post_vacancy",
    message:
      "Institutions can register on the platform, create an institutional profile, and publish faculty job openings to attract qualified candidates.",
    quickReplies: [
      { label: "🔙 More FAQs", value: "faq_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },
  faq_verification: {
    id: "faq_verification",
    message:
      "Yes. FacultyPro verifies registered institutions and reviews user registrations to ensure credibility and maintain the quality of the recruitment process.",
    quickReplies: [
      { label: "🔙 More FAQs", value: "faq_start" },
      { label: "🏠 Main Menu", value: "root" },
    ],
    isEnd: true,
  },

  // ── SUPPORT ───────────────────────────────────────────────────────────────
  support_start: {
    id: "support_start",
    message: "What kind of issue are you facing?",
    quickReplies: [
      { label: "🔐 Login / Account issue", value: "support_account" },
      { label: "⚙️ Technical / Bug", value: "support_technical" },
      { label: "📋 Application issue", value: "support_application" },
      { label: "💬 Other", value: "support_other" },
    ],
  },
  support_account: {
    id: "support_account",
    message:
      "For account issues:\n\n• Forgot password → Use 'Forgot Password' on login page\n• Email not verified → Check spam folder\n• Account locked → Contact support\n\n📧 Email us: support@facultypro.in\n📞 Call: +91-XXXXXXXXXX",
    link: { label: "Contact Us →", href: "/contact" },
    quickReplies: [{ label: "🏠 Main Menu", value: "root" }],
    isEnd: true,
  },
  support_technical: {
    id: "support_technical",
    message:
      "For technical issues, please try:\n1️⃣ Refresh the page\n2️⃣ Clear browser cache\n3️⃣ Try a different browser\n\nStill facing issues?\n📧 Email: support@facultypro.in\nInclude screenshots for faster resolution! 📸",
    link: { label: "Contact Us →", href: "/contact" },
    quickReplies: [{ label: "🏠 Main Menu", value: "root" }],
    isEnd: true,
  },
  support_application: {
    id: "support_application",
    message:
      "For application-related issues:\n• Check 'My Applications' tab in your profile\n• If an application is missing, it may still be processing\n\n📧 Email: support@facultypro.in with your Application ID",
    link: { label: "My Applications →", href: "/profile?tab=My+Applications" },
    quickReplies: [{ label: "🏠 Main Menu", value: "root" }],
    isEnd: true,
  },
  support_other: {
    id: "support_other",
    message:
      "We're here to help! 😊\n\n📧 Email: support@facultypro.in\n🌐 Contact page: facultypro.in/contact\n\nOur team responds within 24 hours on working days.",
    link: { label: "Contact Us →", href: "/contact" },
    quickReplies: [{ label: "🏠 Main Menu", value: "root" }],
    isEnd: true,
  },
};

const JOB_FILTER_MENU: { id: JobFilterType; label: string; icon: LucideIcon }[] = [
  { id: "location", label: "Location", icon: House },
  { id: "category", label: "Category", icon: BookOpen },
  { id: "department", label: "Department", icon: Building2 },
  { id: "jobRole", label: "Job Role", icon: Briefcase },
  { id: "college", label: "College", icon: GraduationCap },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function getAuthState(): {
  isLoggedIn: boolean;
  displayName: string | null;
  user: Record<string, unknown> | null;
} {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, displayName: null, user: null };
  }
  const token = localStorage.getItem("token");
  if (!token) {
    return { isLoggedIn: false, displayName: null, user: null };
  }
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (u && typeof u === "object") {
      const o = u as { name?: string; first_name?: string };
      const name = o.name || o.first_name || localStorage.getItem("name");
      return { isLoggedIn: true, displayName: name || "there", user: u as Record<string, unknown> };
    }
  } catch {
    /* ignore */
  }
  return {
    isLoggedIn: true,
    displayName: localStorage.getItem("name"),
    user: null,
  };
}

function makeBotMessage(
  text: string,
  extra?: {
    searchPath?: string;
    linkSuggestions?: { label: string; href: string }[];
  }
): ChatMessage {
  return {
    id: uid(),
    role: "bot",
    text,
    timestamp: new Date(),
    ...extra,
  };
}

function makeUserMessage(text: string): ChatMessage {
  return { id: uid(), role: "user", text, timestamp: new Date() };
}

function rootFlowKey(authenticated: boolean) {
  return authenticated ? "root_auth" : "root_guest";
}

function stripLeadingEmoji(text: string): string {
  return text.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

function getQuickReplyIcon(value: string): LucideIcon | null {
  const iconMap: Record<string, LucideIcon> = {
    job_search_start: Search,
    manual_search_hint: Keyboard,
    register_help: FileText,
    faq_start: HelpCircle,
    support_start: Headset,
    profile_start: User,
    profile_direct: User,
    profile_resume: FileText,
    profile_summary: User,
    profile_academic: Building2,
    profile_experience: Briefcase,
    profile_education: GraduationCap,
    profile_projects: BookOpen,
    profile_my_applications: ClipboardList,
    profile_saved_jobs: Star,
    profile_qualifications: GraduationCap,
    profile_preferences: Building2,
    profile_skills: FlaskConical,
    profile_publications: BookOpen,
    profile_achievements: Star,
    apply_track: ClipboardList,
    saved_jobs_link: Star,
    root: House,
    job_teaching: GraduationCap,
    job_research: FlaskConical,
    job_admin: Building2,
    job_browse_all: BookOpen,
  };
  return iconMap[value] || null;
}

function getAccordionSectionIcon(
  id: "teaching" | "research" | "admin"
): LucideIcon {
  if (id === "teaching") return GraduationCap;
  if (id === "research") return FlaskConical;
  return Building2;
}

function extractResults(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.results)) return raw.results;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

function toLabel(item: any, filter: JobFilterType): string {
  if (filter === "location") return String(item?.city ?? item?.name ?? "");
  if (filter === "category") return String(item?.name ?? "");
  if (filter === "department") return String(item?.name ?? item?.short_name ?? "");
  if (filter === "jobRole") return String(item?.role_name ?? item?.name ?? "");
  return String(item?.college_name ?? item?.name ?? "");
}

function buildJobsPath(filter: JobFilterType, value: string | number): string {
  const queryKeyMap: Record<JobFilterType, string> = {
    location: "location",
    category: "job-category",
    department: "department",
    jobRole: "job-role",
    college: "college",
  };
  const p = new URLSearchParams();
  p.set(queryKeyMap[filter], String(value));
  return `/jobs?${p.toString()}`;
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]*\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\*\*([^*]*)\*\*$/);
        if (m) {
          return (
            <strong key={i} className="font-semibold text-gray-900">
              {m[1]}
            </strong>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

type RemoteChatResponse = {
  reply: string;
  suggestions?: { label: string; href: string }[];
  search_path?: string | null;
};

type ChatbotApiSearchResponse = {
  reply?: string;
  location?: string | number;
  category?: string | number;
  department?: string | number;
  college?: string | number;
  jobRole?: string | number;
  job_role?: string | number;
  "job-role"?: string | number;
  "job-category"?: string | number;
};

const API_FILTER_KEY_TO_TYPE: Record<string, JobFilterType> = {
  location: "location",
  category: "category",
  department: "department",
  college: "college",
  jobRole: "jobRole",
  job_role: "jobRole",
  "job-role": "jobRole",
  "job-category": "category",
};

function normalizeSearchText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function findMenuQuickReply(query: string): QuickReply | null {
  const q = normalizeSearchText(query);
  if (!q) return null;

  if (
    q === "hi" ||
    q === "hey" ||
    q === "hello" ||
    q === "hii" ||
    q === "helo" ||
    q === "vanakkam"
  ) {
    return { label: "🏠 Main menu", value: "root" };
  }

  if (q.includes("main menu") || q.includes("back to main")) {
    return { label: "🏠 Main menu", value: "root" };
  }
  if (q.includes("profile")) {
    return { label: "👤 Profile & resume", value: "profile_start" };
  }
  if (q.includes("job search") || q.includes("search jobs") || q === "jobs") {
    return { label: "🔍 Job search (menu)", value: "job_search_start" };
  }

  const allReplies = Object.values(FLOWS).flatMap((step) => step.quickReplies ?? []);
  const match = allReplies.find((reply) => {
    const label = normalizeSearchText(stripLeadingEmoji(reply.label));
    return label.length > 2 && (q.includes(label) || label.includes(q));
  });
  return match ?? null;
}

function extractApiFilter(
  raw: ChatbotApiSearchResponse | null | undefined
): { filter: JobFilterType; value: string | number } | null {
  if (!raw || typeof raw !== "object") return null;
  for (const [key, filter] of Object.entries(API_FILTER_KEY_TO_TYPE)) {
    const value = raw[key as keyof ChatbotApiSearchResponse];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return { filter, value };
    }
  }
  return null;
}

function shouldOfferContactRedirect(reply: string): boolean {
  const text = reply.toLowerCase();
  return [
    "no matching jobs found",
    "no matching jobs",
    "no jobs found",
    "could not",
    "unable",
    "not sure",
    "don't understand",
    "do not understand",
    "didn't understand",
    "please rephrase",
    "try again",
  ].some((needle) => text.includes(needle));
}

function localSearchFallback(
  message: string,
  isAuthed: boolean
): { reply: string; searchPath?: string } {
  const q = message.trim();
  if (!q) {
    return {
      reply: isAuthed
        ? "Type a job keyword or location — I’ll help you find matching listings."
        : "Type what you’re looking for (e.g. Assistant Professor, city name). You can browse jobs without logging in, but sign in to apply.",
    };
  }
  return {
    reply: `Open jobs for: “${q}” (set NEXT_PUBLIC_CHAT_API_URL for a full AI answer).`,
    searchPath: `/jobs?search=${encodeURIComponent(q)}`,
  };
}

async function fetchRemoteChat(input: {
  message: string;
  is_authenticated: boolean;
  user: Record<string, unknown> | null;
}): Promise<RemoteChatResponse> {
  const url = process.env.NEXT_PUBLIC_CHAT_API_URL?.trim();
  if (!url) {
    throw new Error("NO_CHAT_URL");
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const key = process.env.NEXT_PUBLIC_CHAT_API_KEY?.trim();
  if (key) {
    headers["Authorization"] = `Bearer ${key}`;
  }
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: input.message,
      is_authenticated: input.is_authenticated,
      user: input.user,
    }),
  });
  const data = (await res.json()) as RemoteChatResponse;
  if (!res.ok || typeof data?.reply !== "string") {
    throw new Error("CHAT_API_ERROR");
  }
  return data;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ChatbotWidgetOld() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<FlowStep>(FLOWS.root_guest);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchBusy, setSearchBusy] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  /** `job_search_start` only: which category row is expanded (accordion). */
  const [jobMenuLevel, setJobMenuLevel] = useState<"root" | "values">("root");
  const [activeJobFilter, setActiveJobFilter] = useState<JobFilterType | null>(
    null
  );
  const [jobFilterOptions, setJobFilterOptions] = useState<JobFilterOption[]>([]);
  const [jobFilterLoading, setJobFilterLoading] = useState(false);
  const [jobFilterError, setJobFilterError] = useState<string | null>(null);
  const [recentFilterSearches, setRecentFilterSearches] = useState<
    RecentFilterSearch[]
  >([]);
  const [stepTrail, setStepTrail] = useState<string[]>([]);
  const [genericMenuOpen, setGenericMenuOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasGreeted = useRef(false);
  const searchInputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  // Auth + cross-tab / focus
  useEffect(() => {
    const sync = () => {
      setIsLoggedIn(!!getAuthState().isLoggedIn);
    };
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", sync);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setIsLoggedIn(!!getAuthState().isLoggedIn);
    }
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("chatbot_recent_job_filters");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRecentFilterSearches(
          parsed.filter(
            (x) => x && typeof x.path === "string" && typeof x.label === "string"
          )
        );
      }
    } catch {
      // ignore bad localStorage data
    }
  }, []);

  // Initial greeting (reads auth at first open)
  useEffect(() => {
    if (open && !hasGreeted.current) {
      hasGreeted.current = true;
      const { isLoggedIn: auth } = getAuthState();
      setIsLoggedIn(auth);
      const k = rootFlowKey(auth);
      const root = FLOWS[k];
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages([makeBotMessage(root.message)]);
        setCurrentStep(root);
      }, 800);
    }
  }, [open]);

  // If user switches guest ↔ signed-in on root, swap menu
  useEffect(() => {
    if (!open) return;
    if (currentStep.id !== "root_guest" && currentStep.id !== "root_auth")
      return;
    const { isLoggedIn: now } = getAuthState();
    setIsLoggedIn(now);
    const want = now ? "root_auth" : "root_guest";
    if (currentStep.id !== want) {
      setCurrentStep(FLOWS[want]);
    }
  }, [isLoggedIn, open, currentStep.id]);

  useEffect(() => {
    if (currentStep.id !== "job_search_start") {
      setJobMenuLevel("root");
      setActiveJobFilter(null);
      setJobFilterOptions([]);
      setJobFilterError(null);
    }
    setGenericMenuOpen(true);
  }, [currentStep.id]);

  // Pulse unread badge after 5s
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setUnread(true), 5000);
      return () => clearTimeout(t);
    } else {
      setUnread(false);
    }
  }, [open]);

  const handleQuickReply = useCallback((reply: QuickReply) => {
    if (reply.value === "profile_direct") {
      setMessages((prev) => [...prev, makeUserMessage(reply.label)]);
      router.push("/profile?tab=Profile");
      return;
    }

    // If user is not logged in and asks for profile setup help,
    // open register modal directly from global header.
    if (reply.value === "profile_start" && !getAuthState().isLoggedIn) {
      setMessages((prev) => [...prev, makeUserMessage(reply.label)]);
      window.dispatchEvent(new CustomEvent("openRegisterModal"));
      setMessages((prev) => [
        ...prev,
        makeBotMessage(
          "Please register first to set up your profile. I opened the register form for you."
        ),
      ]);
      setCurrentStep({
        id: "register_help",
        message: "",
        quickReplies: [
          { label: "🏠 Main menu", value: "root" },
          { label: "📝 How to register & apply", value: "register_help" },
        ],
      });
      return;
    }

    const key =
      reply.value === "root" ? rootFlowKey(getAuthState().isLoggedIn) : reply.value;
    const next = FLOWS[key];
    if (!next) return;

    // maintain step-level history for global "Back" in sub/child menus
    if (key === "root_auth" || key === "root_guest") {
      setStepTrail([]);
    } else {
      setStepTrail((prev) => [...prev, currentStep.id]);
    }

    setMessages((prev) => [...prev, makeUserMessage(reply.label)]);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      if (next.id === "after_manual" && !next.message.trim()) {
        setCurrentStep(next);
        return;
      }
      if (next.message.trim()) {
        setMessages((prev) => [...prev, makeBotMessage(next.message)]);
      }
      setCurrentStep(next);
    }, 500);
  }, [currentStep.id, router]);

  const handleApiSearch = useCallback(
    async (
      q: string
    ): Promise<
      | { reply: string; searchPath?: string; linkSuggestions?: { label: string; href: string }[] }
      | null
    > => {
      try {
        const raw = (await Models.auth.chatbot({
          message: q,
        })) as ChatbotApiSearchResponse;

        const extracted = extractApiFilter(raw);
        if (extracted) {
          return {
            reply: `Open jobs for: “${q}”`,
            searchPath: buildJobsPath(extracted.filter, extracted.value),
          };
        }

        if (typeof raw?.reply === "string" && raw.reply.trim()) {
          const replyText = raw.reply.trim();
          return {
            reply: replyText,
            linkSuggestions: shouldOfferContactRedirect(replyText)
              ? [{ label: "Contact Us", href: "/contact" }]
              : undefined,
          };
        }
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  const handleManualSearch = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      const q = searchInput.trim();
      if (!q || searchBusy) return;

      const { isLoggedIn: auth, user } = getAuthState();
      setIsLoggedIn(auth);
      setMessages((prev) => [...prev, makeUserMessage(q)]);
      setSearchInput("");
      setSearchBusy(true);

      const matchedReply = findMenuQuickReply(q);
      if (matchedReply) {
        const key =
          matchedReply.value === "root"
            ? rootFlowKey(getAuthState().isLoggedIn)
            : matchedReply.value;
        const next = FLOWS[key];
        if (next) {
          setTyping(true);
          setTimeout(() => {
            setTyping(false);
            if (next.message.trim()) {
              setMessages((prev) => [...prev, makeBotMessage(next.message)]);
            }
            setCurrentStep(next);
            setSearchBusy(false);
            searchInputRef.current?.focus();
          }, 350);
          return;
        }
      }

      setTyping(true);
      setCurrentStep({
        id: "after_manual",
        message: "",
        quickReplies: FLOWS.after_manual.quickReplies,
      });

      try {
        const apiResult = await handleApiSearch(q);
        if (apiResult) {
          setMessages((prev) => [
            ...prev,
            makeBotMessage(apiResult.reply, {
              searchPath: apiResult.searchPath,
              linkSuggestions: apiResult.linkSuggestions,
            }),
          ]);
          return;
        }

        const data = await fetchRemoteChat({
          message: q,
          is_authenticated: auth,
          user: user,
        });
        const shouldShowContact =
          !data.search_path &&
          (!data.suggestions || data.suggestions.length === 0) &&
          shouldOfferContactRedirect(data.reply);
        setMessages((prev) => [
          ...prev,
          makeBotMessage(data.reply, {
            searchPath: data.search_path ?? undefined,
            linkSuggestions: shouldShowContact
              ? [{ label: "Contact Us", href: "/contact" }]
              : data.suggestions,
          }),
        ]);
      } catch (err) {
        if (err instanceof Error && err.message === "NO_CHAT_URL") {
          const fb = localSearchFallback(q, auth);
          setMessages((prev) => [
            ...prev,
            makeBotMessage(fb.reply, {
              searchPath: fb.searchPath,
              linkSuggestions: [{ label: "Contact Us", href: "/contact" }],
            }),
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            makeBotMessage(
              "Could not get a reply. Check NEXT_PUBLIC_CHAT_API_URL, CORS, and try again. You can still browse jobs on the site.",
              { linkSuggestions: [{ label: "Contact Us", href: "/contact" }] }
            ),
          ]);
        }
      } finally {
        setTyping(false);
        setSearchBusy(false);
        searchInputRef.current?.focus();
      }
    },
    [handleApiSearch, searchBusy, searchInput]
  );

  const loadJobFilterOptions = useCallback(async (filter: JobFilterType) => {
    setJobFilterLoading(true);
    setJobFilterError(null);
    setActiveJobFilter(filter);
    setJobMenuLevel("values");
    try {
      let raw: any;
      if (filter === "location") {
        raw = await Models.location.list(1, { has_jobs: true });
      } else if (filter === "category") {
        raw = await Models.category.list(1, "");
      } else if (filter === "department") {
        raw = await Models.department.masterDep({ page: 1, has_jobs: true });
      } else if (filter === "jobRole") {
        raw = await Models.category.jobRoleList(1, "");
      } else {
        raw = await Models.colleges.collegeList({});
      }

      const list = extractResults(raw)
        .map((item: any) => {
          const label = toLabel(item, filter);
          const optionId = item?.id ?? item?.value ?? label;
          return {
            id: optionId,
            label,
            value: optionId,
          };
        })
        .filter((x: JobFilterOption) => Boolean(x.label))
        .slice(0, 40);

      setJobFilterOptions(list);
      if (list.length === 0) {
        setJobFilterError("No options found.");
      }
    } catch (err: any) {
      setJobFilterOptions([]);
      setJobFilterError(err?.message || "Failed to load options.");
    } finally {
      setJobFilterLoading(false);
    }
  }, []);

  const applyJobFilterOption = useCallback(
    (option: JobFilterOption) => {
      if (!activeJobFilter) return;
      setMessages((prev) => [...prev, makeUserMessage(option.label)]);
      const path = buildJobsPath(activeJobFilter, option.value);
      const historyLabel = `${stripLeadingEmoji(activeJobFilter)}: ${stripLeadingEmoji(
        option.label
      )}`;
      const nextHistory = [
        { label: historyLabel, path },
        ...recentFilterSearches.filter((x) => x.path !== path),
      ].slice(0, 6);
      setRecentFilterSearches(nextHistory);
      try {
        localStorage.setItem(
          "chatbot_recent_job_filters",
          JSON.stringify(nextHistory)
        );
      } catch {
        // ignore storage write errors
      }
      setMessages((prev) => [
        ...prev,
        makeBotMessage(
          `${stripLeadingEmoji(option.label)} selected. You can open filtered jobs now.`,
          { searchPath: path }
        ),
      ]);
      setCurrentStep({
        id: "after_manual",
        message: "",
        quickReplies: [
          { label: "🔍 Another filter", value: "job_search_start" },
          { label: "📚 Browse all jobs", value: "job_browse_all" },
          { label: "🏠 Main menu", value: "root" },
        ],
      });
      setJobMenuLevel("root");
      setActiveJobFilter(null);
      setJobFilterOptions([]);
      setJobFilterError(null);
      router.push(path);
    },
    [activeJobFilter, recentFilterSearches, router]
  );

  const handleReset = useCallback(() => {
    hasGreeted.current = true;
    const { isLoggedIn: v } = getAuthState();
    setIsLoggedIn(v);
    const step = FLOWS[rootFlowKey(v)];
    setMessages([makeBotMessage(step.message)]);
    setCurrentStep(step);
    setStepTrail([]);
  }, []);

  const handleGoBack = useCallback(() => {
    // if we're inside job filter values, go one level up first
    if (currentStep.id === "job_search_start" && jobMenuLevel === "values") {
      setJobMenuLevel("root");
      setActiveJobFilter(null);
      setJobFilterOptions([]);
      setJobFilterError(null);
      return;
    }

    setStepTrail((prev) => {
      if (prev.length === 0) {
        const root = FLOWS[rootFlowKey(getAuthState().isLoggedIn)];
        setCurrentStep(root);
        return prev;
      }
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, -1);
      const targetKey =
        last === "root" ? rootFlowKey(getAuthState().isLoggedIn) : last;
      const target = FLOWS[targetKey] || FLOWS[rootFlowKey(getAuthState().isLoggedIn)];
      setCurrentStep(target);
      return rest;
    });
  }, [currentStep.id, jobMenuLevel]);

  const subLine = (() => {
    return "Find your next faculty opportunity with FacultyBot";
  })();

  const toggleOpen = useCallback(() => {
    setOpen((v) => !v);
    setUnread(false);
  }, []);

  const openOnHover = useCallback(() => {
    setOpen(true);
    setUnread(false);
  }, []);

  const onFabClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (open) {
        setOpen(false);
        setUnread(false);
      } else {
        setOpen(true);
        setUnread(false);
      }
    },
    [open]
  );

  const navigateWithinApp = useCallback(
    (path: string) => {
      if (!path) return;
      if (path.startsWith("/")) {
        router.push(path);
        return;
      }
      window.location.href = path;
    },
    [router]
  );

  return (
    <>
      {/* ── Chat Window ─────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-20 right-1 z-50 flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-[#1E3786]/25 bg-white transition-all duration-300 origin-bottom-right ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
        style={{
          width: "min(370px, calc(100vw - 1rem))",
          height: "min(680px, calc(100vh - 110px))",
        }}
        aria-hidden={!open}
        role="dialog"
        aria-label="FacultyBot chat assistant"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 shrink-0 bg-[#1E3786] text-white">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white overflow-hidden">
            <img
              src="/assets/images/Faculty/favicon.png"
              alt="FacultyBot"
              className="w-6 h-6 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight text-white">
              FacultyBot
            </p>
            <div
              className="text-white/90 text-xs leading-snug"
              title={subLine}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-white/50 mr-1"
                style={{ verticalAlign: "middle" }}
              />
              {subLine}
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-white/80 hover:text-white transition-colors p-1 rounded"
            title="Restart chat"
            aria-label="Restart chat"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={toggleOpen}
            className="text-white/80 hover:text-white transition-colors p-1 rounded"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 px-3 py-3 space-y-3">
          {messages.map((msg) => {
            if (
              msg.role === "bot" &&
              !(
                (msg.text && msg.text.trim().length > 0) ||
                msg.searchPath ||
                (msg.linkSuggestions && msg.linkSuggestions.length > 0)
              )
            ) {
              return null;
            }
            return (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5 bg-white border border-[#1E3786]/20 overflow-hidden">
                  <img
                    src="/assets/images/Faculty/favicon.png"
                    alt="FacultyBot"
                    className="w-4 h-4 object-contain"
                  />
                </div>
              )}
              <div
                className={`max-w-[78%] flex flex-col gap-2 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.text && msg.text.trim().length > 0 && (
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-[#1E3786] text-white rounded-br-sm"
                        : "text-foreground bg-white border border-border rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "user" ? (
                      msg.text
                    ) : (
                      <RichText text={msg.text} />
                    )}
                  </div>
                )}
                {msg.searchPath && (
                  <button
                    type="button"
                    onClick={() => navigateWithinApp(msg.searchPath!)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#1E3786] bg-[#edf3ff] border border-[#b9c8e8] rounded-2xl px-3.5 py-1 hover:bg-[#e3ecff] transition-colors"
                  >
                    <Search size={16} className="shrink-0 text-[#1E3786]" />
                    Open job results
                  </button>
                )}
                {msg.linkSuggestions && msg.linkSuggestions.length > 0 && (
                  <div className="flex flex-col gap-1.5 w-full max-w-full">
                    {msg.linkSuggestions.map((s, j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => navigateWithinApp(s.href)}
                        className="inline-block text-center text-xs font-medium rounded-lg px-2 py-1.5 border border-[#1E3786]/30 text-[#1E3786] bg-[#1E3786]/10 hover:bg-[#1E3786]/15"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            );
          })}

          {/* Typing indicator */}
          {typing && (
            <div className="flex items-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 bg-white border border-[#1E3786]/20 overflow-hidden">
                <img
                  src="/assets/images/Faculty/favicon.png"
                  alt="FacultyBot"
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-border">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="block w-2 h-2 rounded-full bg-[#1E3786]"
                      style={{
                        animation: `chatDot 1.2s ${i * 0.2}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies: job search = accordion; other steps = flat buttons */}
        {!typing && currentStep.quickReplies && (
          <div
            className={cn(
              "bg-[#f8fbff] border-t border-gray-100 px-2.5 py-2.5 flex flex-col shrink-0 max-h-[34vh] sm:max-h-[38vh] overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:#bfd4ff_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#bfd4ff] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent",
              currentStep.id === "job_search_start"
                ? "gap-2"
                : "gap-2"
            )}
          >
            {currentStep.link && (
              <button
                type="button"
                onClick={() => navigateWithinApp(currentStep.link!.href)}
                className="flex items-center justify-start gap-2.5 w-[88%] self-end h-10 px-4 py-0 rounded-full !text-[13px] font-semibold bg-white text-[#1E3786] border border-[#a9c8f8] shadow-[0_1px_0_rgba(30,55,134,0.06)] transition-all hover:bg-[#f5f9ff] hover:border-[#8fb7f4] hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3786]/20"
              >
                <Send size={14} className="shrink-0 self-center text-[#1E3786]" />
                <span className="inline-flex h-full items-center leading-none text-sm">
                  {currentStep.link.label}
                </span>
              </button>
            )}

            

            {currentStep.id === "job_search_start" ? (
              <>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (jobMenuLevel === "values") {
                        setJobMenuLevel("root");
                        setActiveJobFilter(null);
                        setJobFilterOptions([]);
                        setJobFilterError(null);
                        return;
                      }
                      handleGoBack();
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E3786] hover:underline"
                  >
                    ⬅ Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenericMenuOpen((v) => !v)}
                    className="flex items-center justify-center w-7 h-7 rounded-md bg-white text-[#1E3786] border border-blue-200 transition-colors hover:bg-blue-50"
                    aria-expanded={genericMenuOpen}
                    aria-label={genericMenuOpen ? "Collapse menu" : "Expand menu"}
                    title={genericMenuOpen ? "Hide menus" : "Show menus"}
                  >
                    <ChevronUp
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform text-[#1E3786]",
                        genericMenuOpen && "rotate-180"
                      )}
                    />
                  </button>
                </div>


                {genericMenuOpen &&
                  (jobMenuLevel === "root" ? (
                    <>
                      {JOB_FILTER_MENU.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => loadJobFilterOptions(item.id)}
                          className="w-[86%] self-end h-10 text-left px-4 py-2 rounded-full !text-[12px] font-medium text-[#1E3786] bg-white border border-blue-200 transition-colors hover:bg-blue-50"
                        >
                          <span className="inline-flex h-full items-center gap-2.5 text-[#1E3786] !text-[12px] leading-none">
                            <item.icon size={15} className="shrink-0 text-[#1E3786]" />
                            {item.label}
                          </span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickReply({
                            label: "📚 Browse all jobs",
                            value: "job_browse_all",
                          })
                        }
                        className="w-[86%] self-end h-10 text-left px-4 py-2 rounded-full !text-[12px] font-medium text-[#1E3786] bg-white border border-blue-200 transition-colors hover:bg-blue-50"
                      >
                        <span className="inline-flex h-full items-center gap-2.5 text-[#1E3786] !text-[12px] leading-none">
                          <BookOpen size={15} className="shrink-0 text-[#1E3786]" />
                          Browse all jobs
                        </span>
                      </button>

                      {recentFilterSearches.length > 0 && (
                        <div className="mt-1 w-[86%] self-end rounded-2xl border border-blue-100 bg-blue-50/40 p-1.5">
                          <p className="mb-1 text-[10px] font-semibold text-[#1E3786]">
                            Recent searches
                          </p>
                          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-0.5 [scrollbar-width:thin] [scrollbar-color:#bfd4ff_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#bfd4ff] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                            {recentFilterSearches.map((item, idx) => (
                              <button
                                key={`${item.path}-${idx}`}
                                type="button"
                                onClick={() => router.push(item.path)}
                                className="w-full h-9 text-left px-3 py-0 rounded-full !text-[10px] font-medium text-[#1E3786] bg-white border border-blue-100 transition-colors hover:bg-blue-50"
                                title={item.label}
                              >
                                <span className="inline-flex h-full items-center gap-1.5 !text-[10px] leading-none">
                                  <Search size={12} className="shrink-0 text-[#1E3786]" />
                                  {item.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {jobFilterLoading && (
                        <div className="text-[11px] text-[#1E3786] px-1 py-2">
                          Loading options...
                        </div>
                      )}

                      {!jobFilterLoading && jobFilterError && (
                        <div className="text-[11px] text-red-600 px-1 py-2">
                          {jobFilterError}
                        </div>
                      )}

                      {!jobFilterLoading &&
                        !jobFilterError &&
                        jobFilterOptions.map((option) => (
                          <button
                            key={`${activeJobFilter}-${option.id}`}
                            type="button"
                            onClick={() => applyJobFilterOption(option)}
                            className="w-[86%] self-end h-10 text-left px-3 py-2 rounded-full !text-[11px] font-medium text-[#1E3786] bg-white border border-blue-100 transition-colors hover:bg-blue-50"
                          >
                            <span className="inline-flex h-full items-center gap-1.5 !text-[11px] leading-none">
                              {option.label}
                            </span>
                          </button>
                        ))}
                    </>
                  ))}
              </>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  {currentStep.id !== "root_guest" &&
                    currentStep.id !== "root_auth" && (
                      <button
                        type="button"
                        onClick={handleGoBack}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E3786] hover:underline"
                      >
                        ⬅ Back
                      </button>
                    )}
                  <button
                    type="button"
                    onClick={() => setGenericMenuOpen((v) => !v)}
                    className="flex items-center justify-center w-7 h-7 rounded-md bg-white text-[#1E3786] border border-blue-200 transition-colors hover:bg-blue-50"
                    aria-expanded={genericMenuOpen}
                    aria-label={genericMenuOpen ? "Collapse menu" : "Expand menu"}
                    title={genericMenuOpen ? "Hide menus" : "Show menus"}
                  >
                    <ChevronUp
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform text-[#1E3786]",
                        genericMenuOpen && "rotate-180"
                      )}
                    />
                  </button>
                </div>
                {genericMenuOpen &&
                  currentStep.quickReplies.map((qr) => (
                    <button
                      key={qr.value + qr.label}
                      type="button"
                      onClick={() => handleQuickReply(qr)}
                      className="w-[86%] self-end h-10 text-left px-4 py-0 rounded-full !text-[12px] font-medium text-[#1E3786] bg-white border border-blue-200 transition-colors hover:bg-blue-50"
                    >
                      <span className="inline-flex h-full items-center gap-2.5 text-[#1E3786] !text-[12px] leading-none">
                        {(() => {
                          const QrIcon = getQuickReplyIcon(qr.value);
                          return QrIcon ? (
                            <QrIcon size={15} className="shrink-0 text-[#1E3786]" />
                          ) : null;
                        })()}
                        {stripLeadingEmoji(qr.label)}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Search row: clean composer area */}
        <form
          onSubmit={handleManualSearch}
          className="shrink-0 relative bg-white border-t border-gray-200 px-4 pt-3 pb-4 min-h-[108px]"
        >
          <textarea
            ref={searchInputRef}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            disabled={searchBusy || typing}
            placeholder="Search jobs (e.g. CSE, Chennai, Assistant Prof…)"
            className={cn(
              "w-full min-h-[72px] max-h-[140px] resize-none overflow-y-auto bg-transparent text-[15px] leading-[1.35]  text-foreground placeholder:text-gray-400 focus:outline-none disabled:opacity-50",
              searchInput.trim() ? "pr-14" : "pr-0"
            )}
            rows={3}
            maxLength={500}
            aria-label="Type a job search query"
          />
          {searchInput.trim() && (
            <button
              type="submit"
              disabled={searchBusy || typing}
              className="absolute right-4 bottom-4 shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#1E3786] text-white disabled:opacity-40 transition-opacity hover:opacity-90"
              aria-label="Search"
            >
              <Send size={16} className="text-white" />
            </button>
          )}
        </form>

        
      </div>

      {/* ── Floating Trigger Button ──────────────────────────────────────── */}
      <button
        type="button"
        onMouseEnter={openOnHover}
        onClick={onFabClick}
        className="fixed bottom-4 right-1 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30 bg-[#1E3786] text-white shadow-lg shadow-[#1E3786]/40"
        aria-label={open ? "Close chat" : "Open chat assistant"}
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
        )}
        {open ? (
          <X className="text-white" size={20} />
        ) : (
          <MessageCircle className="text-white" size={20} />
        )}
        {unread && !open && (
          <span className="absolute -top-0.5 -right-0.5 min-w-3.5 h-3.5 px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center bg-white text-[#1E3786] border border-white">
            1
          </span>
        )}
      </button>

      {/* ── Keyframe for typing dots ─────────────────────────────────────── */}
      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </>
  );
}
