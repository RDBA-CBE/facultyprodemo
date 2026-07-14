"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Edit3,
  MapPin,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  Clock,
  Download,
  Trash2,
  Plus,
  CheckCircle,
  Upload,
  Crown,
  Briefcase,
  FileText,
  GraduationCap,
  FolderOpen,
  Code,
  Edit,
  X,
  Award,
  ChevronDown,
  ChevronUp,
  User,
  Delete,
  Trash,
  PlusIcon,
  File,
  Book,
  Router,
  ArrowRight,
  MailIcon,
  PhoneCall,
  Building,
  TargetIcon,
  LucideTarget,
  LocateFixed,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DateFormat,
  useSetState,
  getFileNameFromUrl,
  Success,
  Dropdown,
  buildFormData,
} from "@/utils/function.utils";
import { Models } from "@/imports/models.import";
import { Failure } from "@/components/common-components/toast";
import * as Yup from "yup";
import CustomSelect from "@/components/common-components/dropdown";
import { user, userResume } from "@/utils/validation.utils";
import Swal from "sweetalert2";
import skill from "@/models/skill.models";
import { log } from "console";
import { DatePicker } from "@/components/common-components/datePicker";
import { start } from "repl";
import Footer from "@/components/common-components/new_components/Footer";
import Modal from "@/components/common-components/modal";
import TextArea from "@/components/common-components/textArea";
import SkeletonLoader from "../jobs/SkeletonLoader";
import { PROFILE_TABS } from "@/utils/constant.utils";
import CustomMultiSelect from "@/components/common-components/multi-select";
import { JobCard } from "@/components/component/jobCard.component";
import { NewJobCard } from "@/components/component/newJobcard.component";
import InviteCard from "@/components/component/InviteCard.component";
import HrRequestTable from "@/components/component/HrRequestTable.component";
import CustomPhoneInput from "@/components/common-components/phoneInput";
import { triggerLogout } from "@/utils/axios.utils";

export default function NaukriProfilePage() {
  const isManualScrollRef = useRef(false);
  const [activeTab, setActiveTab] = useState("resume");

  const [expandedDesc, setExpandedDesc] = useState({});
  const [expandedProjectDesc, setExpandedProjectDesc] = useState({});
  const [expandedPublicationDesc, setExpandedPublicationDesc] = useState({});
  const [expandedAchievementDesc, setExpandedAchievementDesc] = useState({});
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const sidebarRef = useRef(null);
  const sidebarWrapperRef = useRef(null);
  const footerRef = useRef(null);
  const wrapperRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [state, setState] = useSetState({
    // Profile Data
    current_location: "",
    about:
      "Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions. Implemented responsive designs and optimized application performance for better user experience.",
    errors: {},

    // Edit States
    isEditingProfile: false,
    isEditingResume: false,
    isCreateExperience: false,
    isCreateEducation: false,
    isEditingEducation: false,
    isEditingSkills: false,
    isCreateProjects: false,
    isEditingProject: false,
    isEditingHeadline: false,
    isCreatePublication: false,
    isEditingPublication: false,
    isCreateAchievements: false,
    isEditingAchievements: false,
    isEditingExperience: false,

    // Accordion States
    expandedSections: {
      resume: true,
      headline: true,
      academic: true,
      skills: true,
      employment: true,
      education: true,
      projects: true,
      publications: true,
      achievements: true,
    },
    newsletter: false,
    funded: false,
    loading: true,

    appliedCount: 0,
    savedCount: 0,
    preferred_colleges: [],
    preferred_locations: [],
    phd_completed: false,
    net_cleared: false,
    set_cleared: false,
    slet_cleared: false,
    active_job_seeker: false,
    reveal_name: false,
    activeTab: "Profile",
    activeProfileSubSection: "resume",
    collegeDetail: null,
    showCollegeModal: false,
  });

  // Use a separate useEffect to initialize activeTab from URL on component mount
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && PROFILE_TABS.includes(tabFromUrl)) {
      setState({ activeTab: tabFromUrl });
    }
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to access your profile.");
      localStorage.clear();
      window.location.href = "/";
      return;
    }

    try {
      const profile = JSON.parse(localStorage.getItem("user") || "null");
      if (profile?.id) {
        setState({ userId: profile.id });
      } else {
        setState({ loading: false });
        triggerLogout();
        router.replace("/");
        alert("User not found. Please log in again.");
        triggerLogout();
        window.location.href = "/";
        return;
      }
    } catch {
      setState({ loading: false });
      triggerLogout();
      router.replace("/");
      return;
    }

    experienceList();
    locationList();
    collegeList();
    appliedJobList();
    getSavedJobs();
    masterDepartmentList();
    fetchApplicationStatuses();
    applicationStatus();
    acadamicResponsibility();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        router.replace("/");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (state.activeTab == "My Applications") {
      appliedJobList();
    } else if (state.activeTab == "Saved Jobs") {
      getSavedJobs();
    } else if (state.activeTab == "Preferrences") {
      if (!state.locationList?.length) locationList();
      if (!state.collegeList?.length) collegeList();
    }
  }, [state.activeTab]);

  useEffect(() => {
    if (state.userId) {
      userDetail(state.userId);
    }
  }, [state.userId]);

  const links = [
    { id: "resume", label: "Resume/login", section: "resume-section" },
    { id: "headline", label: "Profile Summary", section: "headline-section" },
    { id: "academic", label: "Academic Responsibility", section: "academic-section" },
    { id: "employment", label: "Experience", section: "employment-section" },
    { id: "education", label: "Education", section: "education-section" },
    { id: "projects", label: "Projects", section: "projects-section" },
    {
      id: "publications",
      label: "Publications",
      section: "publications-section",
    },
    { id: "skills", label: "Skills", section: "skills-section" },
    {
      id: "achievements",
      label: "Achievements",
      section: "achievements-section",
    },
  ];

  const SECTION_IDS = [
    "resume-section",
    "headline-section",
    "academic-section",
    "employment-section",
    "education-section",
    "projects-section",
    "publications-section",
    "skills-section",
    "achievements-section",
  ];

  const activeTabRef = useRef(state.activeTab);
  useEffect(() => {
    activeTabRef.current = state.activeTab;
  }, [state.activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      if (isManualScrollRef.current) return;
      if (activeTabRef.current !== "Profile") return;

      const scrollPosition = window.scrollY + 160;
      let currentSubSection = "resume";

      SECTION_IDS.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
          const sectionTop =
            section.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= sectionTop) {
            currentSubSection = sectionId.replace("-section", "");
          }
        }
      });

      setState({ activeProfileSubSection: currentSubSection });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sidebar = sidebarRef.current;
      const wrapper = wrapperRef.current;
      const footer = footerRef.current;

      if (!sidebar || !wrapper || !footer) return;

      const offset = 100;

      const wrapperRect = wrapper.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();

      const sidebarHeight = sidebar.offsetHeight;

      const startSticky = wrapperRect.top <= offset;
      const reachFooter = footerRect.top <= sidebarHeight + offset;

      if (startSticky && !reachFooter) {
        // sticky
        sidebar.style.position = "fixed";
        sidebar.style.top = offset + "px";
        sidebar.style.width = wrapper.offsetWidth + "px";
      } else if (reachFooter) {
        // stop before footer
        sidebar.style.position = "absolute";
        sidebar.style.top = wrapper.offsetHeight - sidebarHeight + "px";
      } else {
        // normal
        sidebar.style.position = "relative";
        sidebar.style.top = "0px";
        sidebar.style.width = "auto";
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userDetail = async (userId) => {
    console.log("fetching user details for userId:", userId); 
    try {
      console.log("fetching user details for userId in try:", userId);
      const res: any = await Models.profile.details(userId);
      setState({
        loading: false,
        userDetail: res,
        phd_completed: res?.phd_completed,
        net_cleared: res?.net_cleared,
        set_cleared: res?.set_cleared,
        slet_cleared: res?.slet_cleared,
        active_job_seeker: res?.active_job_seeker,
        reveal_name: res?.reveal_name,
        newsletter: res?.newsletter,
        preferred_locations:
          res?.location_ids?.map((item: any) => item) || [],
        preferred_colleges:
          res?.preferred_college_ids?.map((item: any) => item) || [],
        additional_academic_ids:
          res?.additional_academic_responsibility_ids?.map((item: any) => item) || [],
      });
    } catch (error: any) {
      setState({ loading: false });
      if (
        error?.error === "User Not Found" ||
        error?.message === "User Not Found"
      ) {
        Failure("User not found. Please log in again.");
        triggerLogout();
        router.replace("/");
      }
    }
  };

  console.log("preferred_locations", state.preferred_locations);
  console.log("preferred_colleges", state.preferred_colleges);

  // const locationList = async (page, search = "") => {
  //   console.log("✌️page --->", page);
  //   console.log("✌️search --->", search);
  //   try {
  //     const body = {
  //       search: page?.search,
  //     };
  //     const res: any = await Models.location.list(1, body);
  //     const dropdown = Dropdown(res?.results, "city");
  //     setState({
  //       locationList: dropdown,
  //     });
  //   } catch (error) {
  //     console.log("✌️error --->", error);
  //   }
  // };

  const locationList = async (params: any = {}) => {
    try {
      const search = typeof params === "string" ? params : (params?.search || "");
      const body = { search };
      const res: any = await Models.location.list(1, body);
      const dropdown = Dropdown(res?.results, "city");
      setState({ locationList: dropdown });
    } catch (error) {
      console.log("Error fetching locations:", error);
    }
  };

  const collegeList = async (search = "") => {
    try {
      let page = 1;
      let allResults: any[] = [];
      let hasNext = true;

      while (hasNext) {
        const res: any = await Models.colleges.collegeList({
          page,
          search,
        });

        if (res?.results?.length) {
          allResults = [...allResults, ...res.results];
        }

        hasNext = !!res?.next;
        page++;
      }

      const dropdown = Dropdown(allResults, "college_name");

      setState({ collegeList: dropdown });
    } catch (error) {
      console.log("Error fetching colleges:", error);
    }
  };

  const appliedJobList = async (page = 1, append = false, status = state.selectedStatus) => {
    try {
      if (append) {
        setState({ isFetchingMore: true });
      } else {
        setState({ jobListLoading: true });
      }

      const body: any = {};
      if (status) body.status = status;

      const profile = JSON.parse(localStorage.getItem("user") || "null");
      const res: any = await Models.job.appliedJobList(profile?.id, body, page);
      setState({
        loading: false,
        jobListLoading: false,
        isFetchingMore: false,
        appliedCount: res?.count || 0,
        count: res?.count,
        jobList: append
          ? [...state.jobList, ...(res?.results || [])]
          : res?.results || [],
        appliedNext: res?.next,
        page: page,
      });
    } catch (error) {
      setState({ loading: false, jobListLoading: false });
    }
  };

  const getSavedJobs = async (page = 1, append = false) => {
    try {
      if (append) {
        setState({ isSavedFetchingMore: true });
      } else {
        setState({ loading: true });
      }
      const profile = JSON.parse(localStorage.getItem("user") || "null");

      const res: any = await Models.save.list(page, profile?.id);

      setState({
        loading: false,
        isSavedFetchingMore: false,
        savedJobList: append
          ? [...(state.savedJobList || []), ...(res?.results || [])]
          : res?.results || [],
        savedCount: res?.count || 0,
        savedNext: res?.next ?? null,
        savedPage: page,
      });
    } catch (error) {
      setState({ loading: false, isSavedFetchingMore: false });
    }
  };

  const getCollege = async (e: any, id: any) => {
    e.stopPropagation();
    try {
      setState({ loading: true });
      const res: any = await Models.colleges.details(id);
      setState({ collegeDetail: res, showCollegeModal: true, loading: false });
    } catch (error) {
      setState({ loading: false });
      Failure("Failed to fetch college details");
    }
  };
  const profileUpdate = async () => {
    try {
      setState({ btnLoading: true });

      const validateBody = {
        first_name: state?.first_name || "",
        last_name: state?.last_name || "",
        current_location: state?.current_location || "",
        experience: state?.experience || "",
        gender: state?.gender || "",
        phone: state?.phone || "",
        email: state?.email || "",
      };

      await user.validate(validateBody, { abortEarly: false });

      const body = {
        ...validateBody,
        username: `${state.first_name} ${state.last_name}`,
        short_desc: state?.short_desc || "",
        current_company: state?.current_company || "",
        current_position: state?.current_position || "",
        profile_logo: state?.profile_logo,
        newsletter: state?.newsletter,
        ...(state?.department ? { department: state.department } : {}),
      };

      // ✅ Create FormData
      const formData = new FormData();

      Object.entries(body).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const res = await Models.profile.update(formData, state.userId);
      console.log("res", res);
      userDetail(state?.userId);

      setState({ btnLoading: false, isEditingProfile: false });
      Success("Profile updated successfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });

        setState({
          errors: validationErrors,
          btnLoading: false,
        });
      } else {
        Failure(error?.error || "Something went wrong");
        setState({ btnLoading: false });
      }
    }
  };

  const menusUpdate = async (type: string) => {
    try {
      setState({ btnLoading: true });

      let bodyData = {};

      const formData = new FormData();
      if (type == "qualification") {
        bodyData = {
          phd_completed: state.phd_completed,
          net_cleared: state.net_cleared,
          set_cleared: state.set_cleared,
          slet_cleared: state.slet_cleared,
        };
      } else if (type == "pref") {
        formData.append(
          "preferred_college_ids",
          JSON.stringify([
            ...new Set(
              state.preferred_colleges?.map((item: any) =>
                Number(item?.value || item),
              ),
            ),
          ]),
        );

        formData.append(
          "location_ids",
          JSON.stringify(
            state.preferred_locations?.map((item: any) =>
              Number(item?.value || item),
            ),
          ),
        );
        bodyData = {
          reveal_name: state.reveal_name,
          newsletter: state.newsletter,
          active_job_seeker: state.active_job_seeker,
        };
      }

      Object.keys(bodyData).forEach((key) => {
        formData.append(key, String(bodyData[key]));
      });

      const res = await Models.profile.update(formData, state.userId);
      console.log("res", res);
      userDetail(state?.userId);

      setState({ btnLoading: false, isEditingProfile: false });
      Success("Profile updated successfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });

        setState({
          errors: validationErrors,
          btnLoading: false,
        });
      } else {
        Failure(error?.error || "Something went wrong");
        setState({ btnLoading: false });
      }
    }
  };

  const saveAcademicResponsibilities = async (ids?: any[]) => {
    try {
      setState({ btnLoading: true });
      const finalIds = ids ?? state.additional_academic_ids ?? [];
      const formData = new FormData();
      formData.append(
        "additional_academic_responsibility_ids",
        JSON.stringify(
          finalIds.map((item: any) => Number(item?.value || item))
        )
      );
      await Models.profile.update(formData, state.userId);
      userDetail(state.userId);
      setState({ btnLoading: false });
    } catch (error) {
      setState({ btnLoading: false });
    }
  };

  const resumeUpdate = async () => {
    try {
      const body = {
        resume: state.resume_url,
      };

      await userResume.validate(body, {
        abortEarly: false,
      });

      const formData = new FormData();
      formData.append("resume", state.resume_url);

      const res = await Models.profile.update(formData, state.userId);
      console.log(" res", res);
      setState({
        isEditingResume: false,
        resume_url: null,
      });

      userDetail(state.userId);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });

        console.log("validationErrors", validationErrors);

        setState({
          errors: validationErrors,
          btnLoading: false,
        });
      }

      // API ERROR
      else {
        Failure(error?.error || "Something went wrong");

        setState({
          btnLoading: false,
        });
      }
    }
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setState({ resume_url: file });
    }
  };

  const DirectdownloadResume = async () => {
    try {
      const url = state.userDetail?.resume_url;

      if (!url) {
        Failure("No resume available to download.");
        return;
      }

      const response = await fetch(url, {
        mode: "cors",
      });

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;

      const filename = getFileNameFromUrl(url) || "resume";
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      Failure("Failed to download resume.");
    }
  };

  const downloadResume = (e) => {
    e.preventDefault(); // prevent same tab navigation
    e.stopPropagation();

    if (state.userDetail?.resume_url) {
      window.open(state.userDetail.resume_url, "_blank", "noopener,noreferrer");
    } else {
      Failure("No resume available to download.");
    }
  };

  const deleteResume = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1E3786",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
      width: "360px",
      didOpen: (popup) => { popup.style.padding = "20px"; popup.style.width = "340px"; const icon = popup.querySelector(".swal2-icon") as HTMLElement; if (icon) { icon.style.width = "50px"; icon.style.height = "50px"; icon.style.margin = "0 auto 8px"; } const title = popup.querySelector(".swal2-title") as HTMLElement; if (title) { title.style.fontSize = "15px"; title.style.padding = "0"; } const content = popup.querySelector(".swal2-html-container") as HTMLElement; if (content) { content.style.fontSize = "13px"; content.style.margin = "4px 0 0"; } const actions = popup.querySelector(".swal2-actions") as HTMLElement; if (actions) { actions.style.marginTop = "16px"; } const confirmBtn = popup.querySelector(".swal2-confirm") as HTMLElement; if (confirmBtn) { confirmBtn.style.fontSize = "13px"; confirmBtn.style.padding = "6px 16px"; confirmBtn.style.borderRadius = "999px"; } const cancelBtn = popup.querySelector(".swal2-cancel") as HTMLElement; if (cancelBtn) { cancelBtn.style.fontSize = "13px"; cancelBtn.style.padding = "6px 16px"; cancelBtn.style.borderRadius = "999px"; } },
      customClass: {
        title: "text-gray-800",
        htmlContainer: "text-gray-600",
      },
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const userId = state.userId;
      if (!userId) return;

      try {
        const formData = new FormData();
        formData.append("resume_url", null);

        await Models.profile.update(formData, userId);

        Success("Resume deleted successfully.");
        userDetail(userId);
      } catch {
        Failure("Failed to delete resume");
      }
    });
  };

  const aboutUpdate = async () => {
    try {
      setState({
        isEditingHeadline: false,
      });

      const body = {
        about: state.about,
      };

      const res = await Models.profile.update(body, state.userId);
      console.log(" res", res);
      userDetail(state.userId);
      // setState({
      //   isEditingHeadline: false,
      // });
    } catch (error) {
      console.log("hello frm ctach");
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });

        console.log("validationErrors", validationErrors);

        setState({
          errors: validationErrors,
          btnLoading: false,
        });
      }

      // API ERROR
      else {
        Failure(error?.error || "Something went wrong");

        setState({
          btnLoading: false,
        });
      }
    }
  };

  const addSkill = async () => {
    try {
      if (!state.skill?.trim()) return;

      setState({
        isEditingSkills: false,
        btnLoading: true,
        errors: {},
      });

      const body = {
        name: state.skill.trim(),
        user_id: state.userId,
      };

      console.log("body", body);

      const res = await Models.skill.create(body);
      console.log("res", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Something went wrong");
    } finally {
      setState({ btnLoading: false });
    }
  };

  // const updateSkill = async () => {
  //   try {
  //     if (!state.skill?.trim()) return;

  //     setState({
  //       isEditingSkills: false,
  //       btnLoading: true,
  //       errors: {},
  //     });

  //     const body = {
  //       name: state.skill.trim(),
  //       user_id: state.userId,
  //     };

  //     console.log("body", body);

  //     const res = await Models.skill.update(body);
  //     console.log("res", res);
  //     userDetail(state.userId);
  //   } catch (error) {
  //     Failure(error?.error || "Something went wrong");
  //   } finally {
  //     setState({ btnLoading: false });
  //   }
  // };

  const deleteSkill = async (skillId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1E3786",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
      width: "360px",
      didOpen: (popup) => { popup.style.padding = "20px"; popup.style.width = "340px"; const icon = popup.querySelector(".swal2-icon") as HTMLElement; if (icon) { icon.style.width = "50px"; icon.style.height = "50px"; icon.style.margin = "0 auto 8px"; } const title = popup.querySelector(".swal2-title") as HTMLElement; if (title) { title.style.fontSize = "15px"; title.style.padding = "0"; } const content = popup.querySelector(".swal2-html-container") as HTMLElement; if (content) { content.style.fontSize = "13px"; content.style.margin = "4px 0 0"; } const actions = popup.querySelector(".swal2-actions") as HTMLElement; if (actions) { actions.style.marginTop = "16px"; } const confirmBtn = popup.querySelector(".swal2-confirm") as HTMLElement; if (confirmBtn) { confirmBtn.style.fontSize = "13px"; confirmBtn.style.padding = "6px 16px"; confirmBtn.style.borderRadius = "999px"; } const cancelBtn = popup.querySelector(".swal2-cancel") as HTMLElement; if (cancelBtn) { cancelBtn.style.fontSize = "13px"; cancelBtn.style.padding = "6px 16px"; cancelBtn.style.borderRadius = "999px"; } },
    });
    if (!result.isConfirmed) return;
    try {
      const res = await Models.skill.delete(skillId);
      console.log("deleted skill", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Failed to delete skill");
    }
  };

  const addEmployment = async () => {
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (!state.start_date) {
        Failure("Start date is required.");
        return;
      }
      if (new Date(state.start_date) > today) {
        Failure("Start date cannot be a future date.");
        return;
      }
      if (!state.is_present && !state.end_date) {
        Failure("End date is required.");
        return;
      }
      if (
        !state.is_present &&
        state.end_date &&
        new Date(state.end_date) < new Date(state.start_date)
      ) {
        Failure("End date cannot be before start date.");
        return;
      }

      setState({ isCreateExperience: false });

      const isPresent = Boolean(state.is_present);
      const endDateValue = isPresent
        ? null
        : state.end_date
          ? DateFormat(state.end_date, "api")
          : null;

      const body = {
        user_id: state.userId,
        company: state.company,
        designation: state.designation,
        start_date: DateFormat(state.start_date, "api"),
        end_date: endDateValue,
        currently_working: isPresent,
        job_description: state.job_description,
      };
      console.log("body", body);

      const res = await Models.experience.create(body);
      console.log("res", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Something went wrong");
    } finally {
      setState({ btnLoading: false });
    }
  };

  const updateEmployment = async () => {
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (!state.start_date) {
        Failure("Start date is required.");
        return;
      }
      if (new Date(state.start_date) > today) {
        Failure("Start date cannot be a future date.");
        return;
      }
      if (!state.is_present && !state.end_date) {
        Failure("End date is required.");
        return;
      }
      if (
        !state.is_present &&
        state.end_date &&
        new Date(state.end_date) < new Date(state.start_date)
      ) {
        Failure("End date cannot be before start date.");
        return;
      }

      setState({ isEditingExperience: false });

      const isPresent = Boolean(state.is_present);
      const endDateValue = isPresent
        ? null
        : state.end_date
          ? DateFormat(state.end_date, "api")
          : null;

      const body = {
        experience_id: state.editingId,
        company: state.company,
        designation: state.designation,
        start_date: DateFormat(state.start_date, "api"),
        end_date: endDateValue,
        currently_working: isPresent,
        job_description: state.job_description,
      };
      console.log("body", body);

      const res = await Models.experience.update(body, state.editingId);
      console.log("res", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Something went wrong");
    } finally {
      setState({ btnLoading: false });
    }
  };

  const deleteEmployment = async (experienceId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1E3786",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
      width: "360px",
      didOpen: (popup) => { popup.style.padding = "20px"; popup.style.width = "340px"; const icon = popup.querySelector(".swal2-icon") as HTMLElement; if (icon) { icon.style.width = "50px"; icon.style.height = "50px"; icon.style.margin = "0 auto 8px"; } const title = popup.querySelector(".swal2-title") as HTMLElement; if (title) { title.style.fontSize = "15px"; title.style.padding = "0"; } const content = popup.querySelector(".swal2-html-container") as HTMLElement; if (content) { content.style.fontSize = "13px"; content.style.margin = "4px 0 0"; } const actions = popup.querySelector(".swal2-actions") as HTMLElement; if (actions) { actions.style.marginTop = "16px"; } const confirmBtn = popup.querySelector(".swal2-confirm") as HTMLElement; if (confirmBtn) { confirmBtn.style.fontSize = "13px"; confirmBtn.style.padding = "6px 16px"; confirmBtn.style.borderRadius = "999px"; } const cancelBtn = popup.querySelector(".swal2-cancel") as HTMLElement; if (cancelBtn) { cancelBtn.style.fontSize = "13px"; cancelBtn.style.padding = "6px 16px"; cancelBtn.style.borderRadius = "999px"; } },
    });
    if (!result.isConfirmed) return;
    try {
      const res = await Models.experience.delete(experienceId);
      console.log("deleted experience", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Failed to delete experience");
    }
  };

  const addEducation = async () => {
    try {
      setState({
        isCreateEducation: false,
      });

      const body = {
        user_id: state.userId,
        institution: state.institution,
        degree: state.degree,
        field: state.field,
        start_year: state.start_year,
        end_year: state.end_year,
        cgpa: state.cgpa,
      };
      console.log("body", body);

      const res = await Models.education.create(body);
      console.log("res", res);

      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Something went wrong");
    } finally {
      setState({ btnLoading: false });
    }
  };

  const updateEducation = async () => {
    try {
      setState({
        isEditingEducation: false,
      });

      const body = {
        education_id: state.education_id,
        institution: state.institution,
        degree: state.degree,
        field: state.field,
        start_year: state.start_year,
        end_year: state.end_year,
        grade: state.cgpa,
        project: state.project,
      };
      console.log("body", body);

      const res = await Models.education.update(body, state.education_id);
      console.log("res", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Something went wrong");
    } finally {
      setState({ btnLoading: false });
    }
  };

  const deleteEducation = async (educationId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1E3786",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
      width: "360px",
      didOpen: (popup) => { popup.style.padding = "20px"; popup.style.width = "340px"; const icon = popup.querySelector(".swal2-icon") as HTMLElement; if (icon) { icon.style.width = "50px"; icon.style.height = "50px"; icon.style.margin = "0 auto 8px"; } const title = popup.querySelector(".swal2-title") as HTMLElement; if (title) { title.style.fontSize = "15px"; title.style.padding = "0"; } const content = popup.querySelector(".swal2-html-container") as HTMLElement; if (content) { content.style.fontSize = "13px"; content.style.margin = "4px 0 0"; } const actions = popup.querySelector(".swal2-actions") as HTMLElement; if (actions) { actions.style.marginTop = "16px"; } const confirmBtn = popup.querySelector(".swal2-confirm") as HTMLElement; if (confirmBtn) { confirmBtn.style.fontSize = "13px"; confirmBtn.style.padding = "6px 16px"; confirmBtn.style.borderRadius = "999px"; } const cancelBtn = popup.querySelector(".swal2-cancel") as HTMLElement; if (cancelBtn) { cancelBtn.style.fontSize = "13px"; cancelBtn.style.padding = "6px 16px"; cancelBtn.style.borderRadius = "999px"; } },
    });
    if (!result.isConfirmed) return;
    try {
      const body = { education_id: educationId };
      const res = await Models.education.delete(educationId);
      console.log("deleted education", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Failed to delete education");
    }
  };

  const addProject = async () => {
    try {
      setState({
        isCreateProjects: false,
      });

      const body = {
        user_id: state.userId,
        project_title: state.project_title,
        project_description: state.project_description,
        technologies: state.technologies,
        duration: state.duration,
        status: state.status,
        project_link: state.project_link,
        funded: state.funded,
        funding_details: state.funded ? state.funding_details : "",
      };
      console.log("body", body);

      const res = await Models.projects.create(body);
      console.log("res", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Something went wrong");
    } finally {
      setState({ btnLoading: false });
    }
  };

  const updateProjects = async () => {
    try {
      setState({
        isEditingProject: false,
      });

      const body = {
        project_id: state.project_id,
        project_title: state.project_title,
        project_description: state.project_description,
        technologies: state.technologies,
        duration: state.duration,
        status: state.status,
        project_link: state.project_link,
        funded: state.funded,
        funding_details: state.funded ? state.funding_details : "",
      };
      console.log("body", body);

      const res = await Models.projects.update(body, state.project_id);
      console.log("res", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Something went wrong");
    } finally {
      setState({ btnLoading: false });
    }
  };

  const deleteProject = async (projectId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1E3786",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
      width: "360px",
      didOpen: (popup) => { popup.style.padding = "20px"; popup.style.width = "340px"; const icon = popup.querySelector(".swal2-icon") as HTMLElement; if (icon) { icon.style.width = "50px"; icon.style.height = "50px"; icon.style.margin = "0 auto 8px"; } const title = popup.querySelector(".swal2-title") as HTMLElement; if (title) { title.style.fontSize = "15px"; title.style.padding = "0"; } const content = popup.querySelector(".swal2-html-container") as HTMLElement; if (content) { content.style.fontSize = "13px"; content.style.margin = "4px 0 0"; } const actions = popup.querySelector(".swal2-actions") as HTMLElement; if (actions) { actions.style.marginTop = "16px"; } const confirmBtn = popup.querySelector(".swal2-confirm") as HTMLElement; if (confirmBtn) { confirmBtn.style.fontSize = "13px"; confirmBtn.style.padding = "6px 16px"; confirmBtn.style.borderRadius = "999px"; } const cancelBtn = popup.querySelector(".swal2-cancel") as HTMLElement; if (cancelBtn) { cancelBtn.style.fontSize = "13px"; cancelBtn.style.padding = "6px 16px"; cancelBtn.style.borderRadius = "999px"; } },
    });
    if (!result.isConfirmed) return;
    try {
      const res = await Models.projects.delete(projectId);
      console.log("deleted project", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Failed to delete project");
    }
  };

  const addPublication = async () => {
    console.log("hello");

    try {
      setState({
        isCreatePublication: false,
      });

      const body = {
        user_id: state.userId,
        publication_title: state.publication_title,
        publication_description: state.publication_description,
        publication_journal: state.publication_journal,
        publication_volume: state.publication_volume,
        publication_issue: state.publication_issue,
        publication_year: state.publication_year,
      };

      const res = await Models.publications.create(body);
      console.log("res", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Something went wrong");
    } finally {
      setState({ btnLoading: false });
    }
  };

  const updatePublication = async () => {
    try {
      setState({
        isEditingPublication: false,
      });

      const body = {
        publication_id: state.publication_id,
        publication_title: state.publication_title,
        publication_description: state.publication_description,
        publication_journal: state.publication_journal,
        publication_volume: state.publication_volume,
        publication_issue: state.publication_issue,
        publication_year: state.publication_year,
      };

      const res = await Models.publications.update(body, state.publication_id);
      console.log("res", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Something went wrong");
    } finally {
      setState({ btnLoading: false });
    }
  };

  const deletePublication = async (publicationId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1E3786",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
      width: "360px",
      didOpen: (popup) => { popup.style.padding = "20px"; popup.style.width = "340px"; const icon = popup.querySelector(".swal2-icon") as HTMLElement; if (icon) { icon.style.width = "50px"; icon.style.height = "50px"; icon.style.margin = "0 auto 8px"; } const title = popup.querySelector(".swal2-title") as HTMLElement; if (title) { title.style.fontSize = "15px"; title.style.padding = "0"; } const content = popup.querySelector(".swal2-html-container") as HTMLElement; if (content) { content.style.fontSize = "13px"; content.style.margin = "4px 0 0"; } const actions = popup.querySelector(".swal2-actions") as HTMLElement; if (actions) { actions.style.marginTop = "16px"; } const confirmBtn = popup.querySelector(".swal2-confirm") as HTMLElement; if (confirmBtn) { confirmBtn.style.fontSize = "13px"; confirmBtn.style.padding = "6px 16px"; confirmBtn.style.borderRadius = "999px"; } const cancelBtn = popup.querySelector(".swal2-cancel") as HTMLElement; if (cancelBtn) { cancelBtn.style.fontSize = "13px"; cancelBtn.style.padding = "6px 16px"; cancelBtn.style.borderRadius = "999px"; } },
    });
    if (!result.isConfirmed) return;
    try {
      const res = await Models.publications.delete(publicationId);
      console.log("deleted publication", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Failed to delete publication");
    }
  };

  const addAchievement = async () => {
    try {
      setState({ isCreateAchievements: false, btnLoading: true });

      const body = {
        user_id: state.userId,
        achievement_title: state.achievement_title || "",
        achievement_description: state.achievement_description || "",
        organization: state.organization || "",
        achievement_file: state.achievement_file || null,
      };

      const formData = new FormData();

      Object.entries(body).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });

      const res = await Models.achievements.create(formData);
      console.log("res", res);

      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Something went wrong");
    } finally {
      setState({ btnLoading: false });
    }
  };

  const updateAchievement = async () => {
    try {
      setState({ isEditingAchievements: false, btnLoading: true });

      const body = {
        achievement_id: state.achievement_id,
        achievement_title: state.achievement_title || "",
        achievement_description: state.achievement_description || "",
        organization: state.organization || "",
        achievement_file: state.achievement_file || null,
      };

      const formData = new FormData();

      Object.entries(body).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });

      const res = await Models.achievements.update(
        formData,
        state.achievement_id,
      );
      console.log("res", res);

      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Something went wrong");
    } finally {
      setState({ btnLoading: false });
    }
  };

  const deleteAchievement = async (achievementId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1E3786",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
      width: "360px",
      didOpen: (popup) => { popup.style.padding = "20px"; popup.style.width = "340px"; const icon = popup.querySelector(".swal2-icon") as HTMLElement; if (icon) { icon.style.width = "50px"; icon.style.height = "50px"; icon.style.margin = "0 auto 8px"; } const title = popup.querySelector(".swal2-title") as HTMLElement; if (title) { title.style.fontSize = "15px"; title.style.padding = "0"; } const content = popup.querySelector(".swal2-html-container") as HTMLElement; if (content) { content.style.fontSize = "13px"; content.style.margin = "4px 0 0"; } const actions = popup.querySelector(".swal2-actions") as HTMLElement; if (actions) { actions.style.marginTop = "16px"; } const confirmBtn = popup.querySelector(".swal2-confirm") as HTMLElement; if (confirmBtn) { confirmBtn.style.fontSize = "13px"; confirmBtn.style.padding = "6px 16px"; confirmBtn.style.borderRadius = "999px"; } const cancelBtn = popup.querySelector(".swal2-cancel") as HTMLElement; if (cancelBtn) { cancelBtn.style.fontSize = "13px"; cancelBtn.style.padding = "6px 16px"; cancelBtn.style.borderRadius = "999px"; } },
    });
    if (!result.isConfirmed) return;
    try {
      const body = { achievement_id: achievementId };
      const res = await Models.achievements.delete(achievementId);
      console.log("deleted achievement", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Failed to delete achievement");
    }
  };

  const saveProfile = () => {
    setState({
      first_name: state.userDetail?.first_name,
      last_name: state.userDetail?.last_name,
      email: state.userDetail?.email,
      phone: state.userDetail?.phone,
      gender: state.userDetail?.gender,
      experience: state.userDetail?.experience,
      current_company: state.userDetail?.current_company,
      current_position: state.userDetail?.current_position,
      current_location: state.userDetail?.current_location,
      short_desc: state.userDetail?.short_desc,
      newsletter: state.userDetail?.newsletter,
      profile_logo_preview: state.userDetail?.profile_logo_url,
      department: state.userDetail?.department_id ?? "",
      isEditingProfile: true,
    });
    masterDepartmentList();
  };

  const masterDepartmentList = async () => {
  try {
    let page = 1;
    let hasNext = true;
    let allResults: any[] = [];

    while (hasNext) {
      const res: any = await Models.department.masterDep({ page });

      if (res?.results?.length) {
        allResults = [...allResults, ...res.results];
      }

      hasNext = !!res?.next; // 👈 check if more pages exist
      page++; // 👈 move to next page
    }

    setState({
      masterDeptList: allResults.map((item: any) => ({
        value: item.id,
        label: item.name,
      })),
    });
  } catch (error) {
    console.log("department error", error);
  }
};

const acadamicResponsibility = async () => {
  try {
    let page = 1;
    let hasNext = true;
    let allResults: any[] = [];

    while (hasNext) {
      const res: any = await Models.department.acadamicRes({ page });

      // const dropdown = res?.results?.map((item: any) => ({
      //   value: item.name,
      //   label: item.responsibility_title,
      // }));

      if (res?.results?.length) {
        allResults = [...allResults, ...res.results];
      }

      hasNext = !!res?.next; // 👈 check if more pages exist
      page++; // 👈 move to next page
    }

    setState({
      acadamicResponsibilityList: allResults.map((item: any) => ({
        value: item.id,
        label: item.responsibility_title,
      })),
    });
  } catch (error) {
    console.log("acadamic Responsibility error", error);
  }
};

console.log("acadamicResponsibilityList", state?.acadamicResponsibilityList);


  

  useEffect(() => {
    const handleInfiniteScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 800
      ) {
        if (state.appliedNext && !state.isFetchingMore && state.activeTab === "My Applications") {
          appliedJobList(state.page + 1, true);
        }
        if (state.savedNext && !state.isSavedFetchingMore && state.activeTab === "Saved Jobs") {
          getSavedJobs(state.savedPage + 1, true);
        }
      }
    };
    window.addEventListener("scroll", handleInfiniteScroll);
    return () => window.removeEventListener("scroll", handleInfiniteScroll);
  }, [state.appliedNext, state.isFetchingMore, state.savedNext, state.isSavedFetchingMore, state.page, state.savedPage, state.activeTab]);

  const fetchApplicationStatuses = async () => {
    try {
      const res: any = await Models.applications.application_status();
      const order = ["Applied", "Interview Scheduled", "Selected", "Waitlisted", "Rejected"];
      const filtered = (res || [])
        .filter((s: any) => s.name !== "Completed" && s.name !== "Joined")
        .sort((a: any, b: any) => {
          const ai = order.indexOf(a.name);
          const bi = order.indexOf(b.name);
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });
      setState({ applicationStatuses: filtered });
    } catch (error) {
      console.log("error fetching statuses", error);
    }
  };

  console.log("applicationStatuses", state.applicationStatuses);
  

  const experienceList = async () => {
    try {
      const res: any = await Models.masterExperience.list();

      const dropdown = res?.results?.map((item: any) => ({
        value: item.name,
        label: item.name,
      }));

      setState({
        experienceList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const applicationStatus = async () => {
    try {
      const res: any = await Models.applications.application_status();

      const dropdown = res?.results?.map((item: any) => ({
        value: item.name,
        label: item.name,
      }));

      setState({
        applicationStatus: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const addAchievements = () => {
    const newAchievement = {
      id: Date.now().toString(),
      ...state.achievementForm,
    };
    setState({
      achievements: [...state.achievements, newAchievement],
      achievementForm: {
        title: "",
        organization: "",
        date: "",
        description: "",
        image: null,
      },
      isEditingAchievements: false,
    });
  };

  const scrollToSection = (sectionId: string) => {
    const subSectionId = sectionId.replace("-section", "");
    isManualScrollRef.current = true;

    const element = document.getElementById(sectionId);

    if (element) {
      const headerOffset = 100;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }

    const fallback = setTimeout(() => {
      isManualScrollRef.current = false;
      setState({ activeProfileSubSection: subSectionId });
    }, 1000);

    window.addEventListener(
      "scrollend",
      () => {
        clearTimeout(fallback);
        isManualScrollRef.current = false;
        setState({ activeProfileSubSection: subSectionId });
      },
      { once: true },
    );
  };

  useEffect(() => {
    if (state.activeTab !== "Profile") return;

    const hash = window.location.hash?.replace("#", "");
    if (!hash || !SECTION_IDS.includes(hash)) return;

    const timer = window.setTimeout(() => {
      scrollToSection(hash);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [searchParams, state.activeTab]);

  const toggleSection = (section: string) => {
    setState({
      expandedSections: {
        ...state.expandedSections,
        [section]:
          !state.expandedSections[
            section as keyof typeof state.expandedSections
          ],
      },
    });
  };

  const handleFormChange = (field, value) => {
    setState({
      [field]: value,
      errors: {
        ...state.errors,
        [field]: undefined,
      },
    });
  };

  const onlyNumbers = (e: React.KeyboardEvent) => {
    if (!/[0-9]/.test(e.key) && !['Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(e.key))
      e.preventDefault();
  };

  const numericString = (val: string) => val.replace(/[^0-9]/g, "");

  const handleAddTechnology = () => {
    if (
      state.technology?.trim() &&
      !state.technologies?.includes(state.technology.trim())
    ) {
      setState({
        technologies: [...(state.technologies || []), state.technology.trim()],
        technology: "",
      });
    } else {
      setState({ technology: "" });
    }
  };

  const handleRemoveTechnology = (techToRemove: string) => {
    setState({
      technologies: state.technologies.filter(
        (tech: string) => tech !== techToRemove,
      ),
    });
  };

  const updateInviteStatus = async (type, item) => {
    const confirmed = await Swal.fire({
      title: `${type === "accept" ? "Accept" : "Reject"} Request?`,
      text: `Are you sure you want to ${type === "accept" ? "accept" : "reject"} this HR request?`,
      icon: type === "accept" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: type === "accept" ? "#1E3786" : "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: type === "accept" ? "Yes, Accept" : "Yes, Reject",
      background: "#fff",
      width: "360px",
      didOpen: (popup) => { popup.style.padding = "20px"; popup.style.width = "340px"; const icon = popup.querySelector(".swal2-icon") as HTMLElement; if (icon) { icon.style.width = "50px"; icon.style.height = "50px"; icon.style.margin = "0 auto 8px"; } const title = popup.querySelector(".swal2-title") as HTMLElement; if (title) { title.style.fontSize = "15px"; title.style.padding = "0"; } const content = popup.querySelector(".swal2-html-container") as HTMLElement; if (content) { content.style.fontSize = "13px"; content.style.margin = "4px 0 0"; } const actions = popup.querySelector(".swal2-actions") as HTMLElement; if (actions) { actions.style.marginTop = "16px"; } const confirmBtn = popup.querySelector(".swal2-confirm") as HTMLElement; if (confirmBtn) { confirmBtn.style.fontSize = "13px"; confirmBtn.style.padding = "6px 16px"; confirmBtn.style.borderRadius = "999px"; } const cancelBtn = popup.querySelector(".swal2-cancel") as HTMLElement; if (cancelBtn) { cancelBtn.style.fontSize = "13px"; cancelBtn.style.padding = "6px 16px"; cancelBtn.style.borderRadius = "999px"; } },
    });
    if (!confirmed.isConfirmed) return;

    setState({ btnLoading: true });
    try {
      const body = {
        is_interested: type == "accept" ? true : false,
        is_response:  true,
        is_status: type == "accept" ? "Accepted" : "Rejected",
      };

      const formData = new FormData();
      formData.append(
        "hr_interview_status",
        type == "accept" ? "Accepted" : "Rejected",
      );

      Object.keys(body).forEach((key) => {
        formData.append(key, String(body[key]));
      });

      const res = await Models.profile.update_interest(item?.id, body);
      await Models.profile.update(formData, item?.applicant_id);

      console.log("✌️res --->", res);
      Success("Response sent successfully");
      userDetail(state.userId);
      setState({ btnLoading: false });
    } catch (error) {
      setState({ btnLoading: false });

      console.log("✌️error --->", error);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-clr1 py-4">
        <div className="section-wid mx-auto ">
          {/* Profile Header - Will hide on scroll */}
          <Card className="!rounded-none bg-transparent !shadow-none border-0 mb-8 ">
            {state.loading ? (
              <>
                <Card className="!rounded-none bg-clr2 border-0 mb-8 overflow-hidden">
                  <CardContent className="relative py-4 px-2">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                      <SkeletonLoader
                        type="rect"
                        width={128}
                        height={128}
                        className="rounded-3xl flex-shrink-0"
                      />
                      <div className="flex-1 w-full">
                        <div className="flex flex-col gap-2 mb-4">
                          <SkeletonLoader type="text" width="40%" height={32} />
                          <SkeletonLoader type="text" width="60%" height={20} />
                          <SkeletonLoader type="text" width="30%" height={16} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          <SkeletonLoader
                            type="rect"
                            height={40}
                            count={5}
                            className="rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-1/4 quick-links-sidebar">
                    <Card className="!rounded-none bg-clr2 border-0">
                      <CardContent className="p-4">
                        <SkeletonLoader
                          type="text"
                          width="60%"
                          height={24}
                          className="mb-6"
                        />
                        <div className="space-y-4">
                          <SkeletonLoader
                            type="rect"
                            height={48}
                            count={8}
                            className="rounded-md"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="quick-links-content flex-1 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="border-0">
                        <CardContent className="p-6">
                          <div className="flex justify-between mb-6">
                            <div className="flex gap-4 w-full">
                              <SkeletonLoader
                                type="rect"
                                width={40}
                                height={40}
                                className="rounded-md"
                              />
                              <div className="flex-1">
                                <SkeletonLoader
                                  type="text"
                                  width={150}
                                  height={24}
                                  className="mb-2"
                                />
                                <SkeletonLoader
                                  type="text"
                                  width={100}
                                  height={16}
                                />
                              </div>
                            </div>
                          </div>
                          <SkeletonLoader
                            type="rect"
                            height={100}
                            className="rounded-3xl"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Profile Header - Will hide on scroll */}
                <Card className="!rounded-none bg-transparent shadow-none border-0 mb-2 overflow-hidden px-0">
                  <div className="absolute"></div>
                  <CardContent className="relative py-4 px-0 mx-0">
                    <div className="flex flex-row items-start gap-4 sm:gap-5">
                      {/* Profile Image - Enhanced */}
                      <div className="relative flex-shrink-0 w-24 h-24">
                        {/* Circular progress ring */}
                        <svg
                          className="absolute inset-0 w-full h-full -rotate-90"
                          viewBox="0 0 96 96"
                        >
                          <circle
                            cx="48" cy="48" r="44"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="5"
                          />
                          <circle
                            cx="48" cy="48" r="44"
                            fill="none"
                            stroke={
                              (state.userDetail?.profile_completion_percentage || 0) >= 80 ? "#16a34a" :
                              (state.userDetail?.profile_completion_percentage || 0) >= 50 ? "#f59e0b" : "#ef4444"
                            }
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 44}`}
                            strokeDashoffset={`${2 * Math.PI * 44 * (1 - (state.userDetail?.profile_completion_percentage || 0) / 100)}`}
                            style={{ transition: "stroke-dashoffset 0.7s ease" }}
                          />
                        </svg>
                        {/* Profile image centered inside ring */}
                        <div className="absolute inset-[6px] rounded-full border-2 border-white overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                          <img
                            src={
                              state.userDetail?.profile_logo_url ||
                              "/assets/images/dummy-profile-pic.png"
                            }
                            alt="Profile"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Percentage badge */}
                        {state.userDetail?.profile_completion_percentage !== undefined && (
                          <div
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap z-10"
                            style={{
                              background:
                                (state.userDetail.profile_completion_percentage) >= 80 ? "#16a34a" :
                                (state.userDetail.profile_completion_percentage) >= 50 ? "#f59e0b" : "#ef4444",
                            }}
                          >
                            {state.userDetail.profile_completion_percentage}%
                          </div>
                        )}
                      </div>

                      {/* Profile Info - Enhanced */}
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="text-left">
                            <div className="flex items-center gap-2 justify-start">
                              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                {state.userDetail?.first_name &&
                                state.userDetail?.last_name
                                  ? `${state.userDetail.first_name} ${state.userDetail.last_name}`
                                  : state.userDetail?.username || ""}
                              </h1>
                              <button
                                className="profile-edit-btn p-2 bg-[#1E3786] rounded-full"
                                onClick={() => saveProfile()}
                              >
                                <Edit
                                  size={14}
                                  className=" text-[#fff] "
                                  style={{ height: "15px", width: "15px" }}
                                />
                              </button>
                            </div>
                            {state?.userDetail?.short_desc && (
                              <p className="text-sm sm:text-base md:text-lg text-gray-700 font-medium mt-1">
                                {state?.userDetail?.short_desc}
                              </p>
                            )}
                            {(state?.userDetail?.current_company ||
                              state?.userDetail?.current_position ||
                              state?.userDetail?.current_location) && (
                              <div className="text-gray-600 flex items-center gap-2 justify-start mt-2">
                                <div className="w-2 h-2 bg-[#f2b31d] rounded-full"></div>

                                <span className="text-sm">
                                  {[
                                    state?.userDetail?.current_company,
                                    state?.userDetail?.current_position,
                                    state?.userDetail?.current_location,
                                  ]
                                    .filter(Boolean) // removes null/undefined/empty
                                    .join(" - ")}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0 justify-center">
                            <div className="bg-white/100 rounded-lg px-3 py-1 shadow-sm border w-fit">
                              <p className="text-xs text-gray-500 whitespace-nowrap">
                                Last Updated:{" "}
                                <span className="font-semibold text-xs text-gray-700">
                                  {DateFormat(
                                    state.userDetail?.updated_at,
                                    "date",
                                  )}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Details Grid - Enhanced */}
                    <div
                      className="flex flex-wrap  mt-4"
                      style={{ gap: "5px" }}
                    >
                      {[
                        {
                          icon: MapPin,
                          label:
                            state?.userDetail?.current_location ||
                            "Not specified",
                          color: "text-[#f2b31d]",
                        },
                        {
                          icon: Phone,
                          label: state?.userDetail?.phone || "Not specified",
                          color: "text-[#f2b31d]",
                          verified: true,
                        },
                        {
                          icon: Calendar,
                          label:
                            state?.userDetail?.experience || "Not specified",
                          color: "text-[#f2b31d]",
                        },
                        {
                          icon: Mail,
                          label: state?.userDetail?.email || "Not specified",
                          color: "text-[#f2b31d]",
                          verified: true,
                        },
                        {
                          icon: User,
                          label: state?.userDetail?.gender || "Not specified",
                          color: "text-[#f2b31d]",
                        },
                        ...(state?.userDetail?.department_id
                          ? [
                              {
                                icon: Briefcase,
                                label: (() => {
                                  const found = state?.masterDeptList?.find(
                                    (d: any) =>
                                      d.value == state.userDetail.department_id,
                                  );
                                  return found ? found.label : "";
                                })(),
                                color: "text-[#f2b31d]",
                              },
                            ]
                          : []),
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex w-fit items-center gap-2 px-2 sm:px-3 py-1 bg-[#0000ff0a] rounded-md border  hover:bg-white/70 transition-all duration-200"
                        >
                          <item.icon
                            className={`w-4 h-4 ${item.color} flex-shrink-0`}
                          />
                          <span className="text-xs sm:text-sm text-gray-700 font-medium truncate flex-1">
                            {item.label}
                          </span>
                          {item.verified && (
                            <CheckCircle className="w-3 h-3 text-[#f2b31d] flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Main Content Container */}
                <div className="text-black mb-4">
                  <div className="flex gap-2 md:gap-4 overflow-x-auto">
                    {PROFILE_TABS?.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setState({ activeTab: tab })}
                        className={`${tab === "Profile" ? "profile-tab-profile" : tab === "Qualifications" ? "profile-tab-qualifications" : tab === "Preferrences" ? "profile-tab-preferences" : tab === "My Applications" ? "profile-tab-applications" : tab === "HR Requests" ? "profile-tab-hr-requests" : "profile-tab-saved"} px-4 py-1 rounded-md transition h-fit whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
                          state.activeTab === tab
                            ? "bg-[#1e3786] !text-[#fff]"
                            : "text-gray-800 hover:text-[#1e3786]"
                        }`}
                      >
                        {/* Tab Label */}
                        <span
                          className={`${
                            state.activeTab === tab
                              ? "bg-[#1e3786] !text-[#fff]"
                              : "text-gray-800 hover:text-[#1e3786]"
                          }`}
                        >
                          {tab === "My Applications"
                            ? "My Applications"
                            : tab === "Saved Jobs"
                              ? "Saved Jobs"
                              : tab === "HR Requests"
                                ? "HR Requests"
                                : tab}
                        </span>

                        {/* Count Badge */}
                        {(tab === "My Applications" && state.appliedCount) ||
                        (tab === "Saved Jobs" && state.savedCount) ||
                        (tab === "HR Requests" &&
                          state.userDetail?.interesteds?.filter(
                            (invite) => !invite?.is_response,
                          )?.length) ? (
                          <span
                            className={`text-xs font-semibold px-2 py-[2px] rounded-full ${
                              state.activeTab === tab
                                ? "bg-white text-[#1e3786]"
                                : "bg-[#1e3786] text-white"
                            }`}
                          >
                            {tab === "My Applications"
                              ? state.appliedCount
                              : tab === "Saved Jobs"
                                ? state.savedCount
                                : state.userDetail?.interesteds?.filter(
                                    (invite) => !invite?.is_response,
                                  )?.length}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="quick-links-content flex-1">
                    {state.activeTab == "Profile" ? (
                      <div className="flex flex-col lg:flex-row gap-2">
                        {/* Left Sidebar - Quick Links */}
                        <div
                          className="lg:w-1/5 relative hidden lg:block "
                          ref={wrapperRef}
                        >
                          <div ref={sidebarRef}>
                            <Card className="!rounded-none bg-clr2  border shadow-none ">
                              <CardContent className="relative py-4 px-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                  {/* <div className="w-2 h-2 bg-[#1E3786] "></div> */}
                                  Quick Links
                                </h3>

                                <div className="space-y-2">
                                  {links.map((item) => (
                                    <div
                                      key={item.id}
                                      onClick={() =>
                                        scrollToSection(item.section)
                                      }
                                      className={`flex items-center justify-between px-2 py-1 rounded-[5px] cursor-pointer transition-all hover:bg-white/80`}
                                    >
                                      <span
                                        className={`font-medium ${
                                          state.activeProfileSubSection === item.id
                                            ? "text-[#1E3786]"
                                            : "text-[#000]"
                                        }`}
                                      >
                                        {item.label}
                                      </span>
                                      {state.activeProfileSubSection === item.id && (
                                        // <div className="w-2 h-2 rounded-full bg-[#F2B31D] flex-shrink-0" />
                                        <LocateFixed className="w-5 h-5 text-[#F2B31D] flex-shrink-0 " />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        {/* Right Content Area - Scrollable */}
                        <div className="lg:w-4/5 space-y-2">
                          {/* Resume Section */}
                          <Card
                            id="resume-section"
                            className="!rounded-none bg-clr2 border shadow-none overflow-hidden relative "
                          >
                            {/* <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/20  blur-3xl"></div> */}
                            {/* <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#3b82f6]/20 to-[#3b82f6]/20  blur-2xl"></div> */}

                            <CardContent className="relative py-4 px-2">
                              <div
                                className="flex items-center justify-between  cursor-pointer"
                                onClick={() => toggleSection("resume")}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-[#1E3786]  rounded-md flex items-center justify-center shadow-lg transform ">
                                    <FileText className="w-4 h-4 text-white transform " />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold bg-[#1E3786] bg-clip-text text-transparent">
                                      Resume Manager
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      Manage your professional documents
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {state.expandedSections.resume ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                  )}
                                </div>
                              </div>

                              <AnimatePresence>
                                {state.expandedSections.resume && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {/* Edit Resume Form */}
                                    <AnimatePresence>
                                      {state.isEditingResume && (
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                            y: 0,
                                          }}
                                          exit={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          transition={{
                                            duration: 0.3,
                                            ease: "easeOut",
                                          }}
                                          className="mb-6 relative"
                                        >
                                          <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/10 to-blue-500/10 rounded-3xl blur-sm"></div>
                                          <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-white/50 shadow-xl mt-5">
                                            <div className="flex items-center gap-3 mb-4">
                                              <div className="w-8 h-8 bg-[#1E3786] rounded-md flex items-center justify-center">
                                                <Upload className="w-4 h-4 text-white" />
                                              </div>
                                              <h4 className="text-lg font-bold text-gray-900">
                                                Upload Resume
                                              </h4>
                                            </div>

                                            <div className="space-y-4 mb-4">
                                              <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center hover:border-[#3b82f6] transition-colors bg-white/100">
                                                <Input
                                                  type="file"
                                                  accept=".pdf,.doc,.docx"
                                                  onChange={
                                                    handleResumeFileChange
                                                  }
                                                  className="hidden"
                                                  id="resume-upload"
                                                />
                                                <label
                                                  htmlFor="resume-upload"
                                                  className="cursor-pointer flex flex-col items-center gap-2 w-full h-full"
                                                >
                                                  <div className="w-12 h-12 bg-[#1E3786]/10 rounded-full flex items-center justify-center">
                                                    <Upload className="w-6 h-6 text-[#1E3786]" />
                                                  </div>
                                                  <span className="text-sm font-medium text-gray-700">
                                                    Click to upload or drag and
                                                    drop
                                                  </span>
                                                  <span className="text-xs text-gray-500">
                                                    PDF, DOC, DOCX (Max 5MB)
                                                  </span>
                                                </label>
                                                {state.resume_url && (
                                                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600 font-medium break-all">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {state.resume_url.name}
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                            <div className="flex gap-3">
                                              <Button
                                                onClick={resumeUpdate}
                                                className="bg-[#1E3786] hover:bg-[#1E3786] text-white shadow-lg"
                                                disabled={!state.resume_url}
                                              >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Upload
                                              </Button>
                                              <Button
                                                variant="outline"
                                                onClick={() =>
                                                  setState({
                                                    isEditingResume: false,
                                                    resume_url: null,
                                                  })
                                                }
                                                className="border-gray-300 hover:bg-gray-50"
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Current Resume Card */}
                                    <div className="relative">
                                      <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/5 to-blue-500/5 rounded-3xl blur-sm group-hover:from-[#3b82f6]/10 group-hover:to-blue-500/10 transition-all duration-300"></div>
                                      <div className="relative bg-white/70 rounded-lg pt-5 border border-white/50   transition-all duration-300 group ">
                                        <div className="flex items-start gap-6">
                                          {/* Resume Icon */}
                                          <div className="flex-shrink-0">
                                            <div className="w-14 h-14 bg-[#1E3786]  shadow-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 relative">
                                              <div className="text-white">
                                                <div className="text-xs text-white font-bold mb-1">
                                                  PDF
                                                </div>
                                                <div className="w-8 h-0.5 bg-white/100 mb-1"></div>
                                                <div className="w-6 h-0.5 bg-white/40 mb-1"></div>
                                                <div className="w-7 h-0.5 bg-white/100"></div>
                                              </div>
                                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#1E3786] rounded-full flex items-center justify-center shadow-lg">
                                                <span className="text-white text-sm font-bold">
                                                  ✓
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Resume Details */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-start !gap-5 md:mb-3">
                                              <div className="">
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                                                  <span className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-[#1E3786] rounded-md rounded-full"></div>
                                                    {state?.userDetail
                                                      ?.resume_url
                                                      ? "Uploaded"
                                                      : "No Resume Uploaded"}
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Desktop Action Buttons - Top Right */}
                                              <div className="flex gap-2 flex-wrap">
                                                {state?.userDetail
                                                  ?.resume_url ? (
                                                  <>
                                                    <button
                                                      className="bg-[#1E3786] text-white px-3 py-1 text-xs rounded-lg"
                                                      onClick={downloadResume}
                                                    >
                                                      View
                                                    </button>

                                                    <button
                                                      className="border border-[#1E3786] rounded-md px-1 py-1"
                                                      onClick={
                                                        DirectdownloadResume
                                                      }
                                                      title="Download Resume"
                                                    >
                                                      <Download
                                                        size={10}
                                                        style={{
                                                          height: "15px",
                                                          width: "15px",
                                                        }}
                                                        className="text-[#1E3786]  group-hover/btn:scale-110 transition-transform"
                                                      />
                                                    </button>
                                                    <button
                                                      onClick={deleteResume}
                                                      className="hover:bg-red-50 border rounded-md border-red-500 group/btn px-1 py-1"
                                                      title="Delete Resume"
                                                    >
                                                      <Trash
                                                        style={{
                                                          height: "15px",
                                                          width: "15px",
                                                        }}
                                                        size={10}
                                                        className=" text-red-600 group-hover/btn:scale-110 transition-transform"
                                                      />
                                                    </button>
                                                  </>
                                                ) : (
                                                  <button
                                                    className=" border border-[#1E3786] rounded-md group/btn px-1 py-1"
                                                    title="Upload Resume"
                                                    onClick={() =>
                                                      setState({
                                                        isEditingResume: true,
                                                      })
                                                    }
                                                  >
                                                    <PlusIcon
                                                      size={10}
                                                      style={{
                                                        height: "15px",
                                                        width: "15px",
                                                      }}
                                                      className="text-[#1E3786] group-hover/btn:scale-110 transition-transform"
                                                    />
                                                  </button>
                                                )}
                                              </div>
                                            </div>

                                            {/* {state?.userDetail?.resume_url && (
                                              <div className="flex flex-wrap items-center gap-3 mb-4">
                                                <div className="bg-gradient-to-r from-[#3b82f6]/20 to-blue-100 px-3 py-1 rounded-full">
                                                  <span className="text-[#1E3786] font-semibold text-sm">
                                                    Latest Version
                                                  </span>
                                                </div>
                                              </div>
                                            )} */}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>

                          {/* Resume Headline Section */}
                          <Card
                            id="headline-section"
                            className="!rounded-none bg-clr2 border shadow-none overflow-hidden relative"
                          >
                            {/* <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#3b82f6]/20 to-[#3b82f6]/20 rounded-full blur-2xl"></div> */}

                            <CardContent className="relative py-4 px-2">
                              <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection("headline")}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg transform ">
                                    <Edit3 className="w-4 h-4 text-white transform " />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold bg-[#1E3786] bg-clip-text text-transparent">
                                      Profile Summary
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      Your professional summary
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    className="w-8 h-8 bg-[#1E3786]  text-white  rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setState({
                                        isEditingHeadline: true,
                                        about: state.userDetail?.about || "",
                                        expandedSections: { ...state.expandedSections, headline: true },
                                      });
                                      scrollToSection("headline-section");
                                    }}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  {state.expandedSections.headline ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                  )}
                                </div>
                              </div>

                              <AnimatePresence>
                                {state.expandedSections.headline && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {/* Edit Headline Form */}
                                    <AnimatePresence>
                                      {state.isEditingHeadline && (
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                            y: 0,
                                          }}
                                          exit={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          transition={{
                                            duration: 0.3,
                                            ease: "easeOut",
                                          }}
                                          className="mb-6 relative"
                                        >
                                          <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/10 to-blue-500/10 rounded-3xl blur-sm"></div>
                                          <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-white/50 shadow-xl mt-5">
                                            {/* <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-blue-600 rounded-md flex items-center justify-center">
                                                  <Edit3 className="w-4 h-4 text-white" />
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900">
                                                  Edit Resume Headline
                                                </h4>
                                              </div> */}

                                            <Textarea
                                              placeholder="Write a compelling headline that summarizes your professional experience and key skills..."
                                              value={state.about}
                                              onChange={(e) =>
                                                setState({
                                                  about: e.target.value,
                                                })
                                              }
                                              className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6] min-h-[100px] mb-4"
                                            />

                                            <div className="flex gap-3">
                                              <Button
                                                onClick={aboutUpdate}
                                                className="bg-[#1E3786] hover:bg-[#1E3786]  text-white shadow-lg"
                                              >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Update
                                              </Button>
                                              <Button
                                                variant="outline"
                                                onClick={() =>
                                                  setState({
                                                    isEditingHeadline: false,
                                                  })
                                                }
                                                className="border-gray-300 hover:bg-gray-50"
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Headline Display */}
                                    <div className="relative">
                                      {/* <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/5 to-blue-500/5 rounded-3xl blur-sm"></div> */}
                                      <div className="flex-1 px-3 pt-5">
                                        <div className="text-md text-gray-500 leading-relaxed whitespace-pre-line">
                                          <p>
                                            {expandedAbout
                                              ? state?.userDetail?.about
                                              : state?.userDetail?.about?.slice(
                                                  0,
                                                  280,
                                                )}
                                            {!expandedAbout &&
                                              state?.userDetail?.about?.length >
                                                280 &&
                                              "..."}
                                            {state?.userDetail?.about?.length >
                                              280 && (
                                              <button
                                                onClick={() =>
                                                  setExpandedAbout(
                                                    (prev) => !prev,
                                                  )
                                                }
                                                className="text-blue-600 text-sm font-medium hover:underline cursor-pointer ml-1"
                                              >
                                                {expandedAbout
                                                  ? "Read Less"
                                                  : "Read More"}
                                              </button>
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>

                          {/* Additional Academic Responsibility Section */}
                          <Card
                            id="academic-section"
                            className="!rounded-none bg-clr2 border shadow-none overflow-hidden relative"
                          >
                            <CardContent className="relative py-4 px-2">
                              <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection("academic")}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg transform">
                                    <GraduationCap className="w-4 h-4 text-white transform" />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold bg-[#1E3786] bg-clip-text text-transparent">
                                       Academic Responsibility
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      Your academic roles and responsibilities
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setState({
                                        isEditingAcademic: true,
                                        expandedSections: {
                                          ...state.expandedSections,
                                          academic: true,
                                        },
                                      });
                                    }}
                                    className="w-8 h-8 bg-[#1E3786] text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSection("academic");
                                    }}
                                    className="cursor-pointer"
                                  >
                                    {state.expandedSections.academic ? (
                                      <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                  </span>
                                </div>
                              </div>

                              <AnimatePresence>
                                {state.expandedSections.academic && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {/* Add Form */}
                                    <AnimatePresence>
                                      {state.isEditingAcademic && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0, y: -20 }}
                                          animate={{ opacity: 1, height: "auto", y: 0 }}
                                          exit={{ opacity: 0, height: 0, y: -20 }}
                                          transition={{ duration: 0.3, ease: "easeOut" }}
                                          className="mb-8 relative"
                                        >
                                          <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/10 to-blue-500/10 rounded-3xl blur-sm"></div>
                                          <div className="relative bg-white/80 rounded-lg mt-5 p-8 border border-white/50 shadow-lg">
                                            <div className="flex items-center gap-3 mb-6">
                                              <div className="w-8 h-8 bg-[#1E3786] rounded-md flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-white" />
                                              </div>
                                              <h4 className="text-xl font-bold text-gray-900">
                                                Add Responsibility
                                              </h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Responsibility
                                                </label>
                                                <CustomSelect
                                                  options={(state.acadamicResponsibilityList || []).filter(
                                                    (opt: any) => !(state.additional_academic_ids || []).some(
                                                      (i: any) => (i?.value || i) === opt.value
                                                    )
                                                  )}
                                                  value={state.selected_academic_id || ""}
                                                  
                                                  onChange={(selected) =>
                                                    setState({
                                                      selected_academic_id: selected ? selected.value : "",
                                                    })
                                                  }
                                                  placeholder="Select responsibility..."
                                                  className="border-gray-200"
                                                />
                                              </div>
                                            </div>
                                            <div className="flex gap-3">
                                              <Button
                                                onClick={() => {
                                                  if (!state.selected_academic_id) return;
                                                  const already = (state.additional_academic_ids || []).some(
                                                    (i: any) => (i?.value || i) === state.selected_academic_id
                                                  );
                                                  if (!already) {
                                                    const updated = [
                                                      ...(state.additional_academic_ids || []),
                                                      state.selected_academic_id,
                                                    ];
                                                    setState({
                                                      additional_academic_ids: updated,
                                                      selected_academic_id: "",
                                                    });
                                                    saveAcademicResponsibilities(updated);
                                                  }
                                                }}
                                                className="bg-[#1E3786] hover:bg-[#1E3786]"
                                              >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Save
                                              </Button>
                                              <Button
                                                variant="outline"
                                                onClick={() => setState({ isEditingAcademic: false })}
                                                className="border-gray-300 hover:bg-gray-50"
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Chips List */}
                                    <div className="flex flex-wrap gap-3 pt-5">
                                      {(state.additional_academic_ids || []).map((item: any, index: number) => {
                                        const label = typeof item === "object"
                                          ? item.label
                                          : state.acadamicResponsibilityList?.find((r: any) => r.value === item)?.label || item;
                                        return (
                                          <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group relative"
                                          >
                                            <div className="bg-gradient-to-r from-[#3b82f6]/10 to-blue-100 hover:from-[#3b82f6]/20 hover:to-blue-200 border border-[#3b82f6]/30 rounded-full px-4 py-1 flex items-center gap-2 transition-all duration-300 hover:shadow-lg group-hover:scale-105">
                                              <span className="text-[#1E3786] font-medium text-sm">
                                                {label}
                                              </span>
                                              <button
                                                onClick={() => {
                                                  const updated = (state.additional_academic_ids || []).filter(
                                                    (_: any, i: number) => i !== index
                                                  );
                                                  setState({ additional_academic_ids: updated });
                                                  saveAcademicResponsibilities(updated);
                                                }}
                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-white/100"
                                              >
                                                <X className="w-3 h-3 font-semibold" />
                                              </button>
                                            </div>
                                          </motion.div>
                                        );
                                      })}
                                    </div>

                                    {/* Empty State */}
                                    {(!state.additional_academic_ids?.length) && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8"
                                      >
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6]/20 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                          <GraduationCap className="w-8 h-8 text-[#1E3786]/60" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                          No Responsibilities Added
                                        </h4>
                                        <p className="text-gray-500 mb-4">
                                          Add your academic responsibilities
                                        </p>
                                        <Button
                                          onClick={() => setState({ isEditingAcademic: true, expandedSections: { ...state.expandedSections, academic: true } })}
                                          className="bg-[#1E3786] hover:bg-[#1E3786]"
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Add Responsibility
                                        </Button>
                                      </motion.div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>

                          {/* Employment Section */}
                          <Card
                            id="employment-section"
                            className="!rounded-none bg-clr2 border shadow-none overflow-hidden relative"
                          >
                            {/* <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#3b82f6]/20 to-[#3b82f6]/20 rounded-full blur-2xl"></div> */}

                            <CardContent className="relative py-4 px-2">
                              <div
                                className="flex items-center justify-between  cursor-pointer"
                                onClick={() => toggleSection("employment")}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg transform ">
                                    <Briefcase className="w-4 h-4 text-white transform " />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold bg-[#1E3786] bg-clip-text text-transparent">
                                      Experience
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      Your professional journey
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    className="w-8 h-8 bg-[#1E3786]  text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setState({
                                        isCreateExperience: true,
                                        company: "",
                                        designation: "",
                                        start_date: "",
                                        end_date: "",
                                        is_present: false,
                                        job_description: "",
                                        expandedSections: {
                                          ...state.expandedSections,
                                          employment: true,
                                        },
                                      });
                                    }}
                                    title="Add Experience"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSection("employment");
                                    }}
                                    className="cursor-pointer"
                                  >
                                    {state.expandedSections.employment ? (
                                      <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                  </span>
                                </div>
                              </div>

                              <AnimatePresence>
                                {state.expandedSections.employment && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {/* Add Employment Form */}
                                    <AnimatePresence>
                                      {state.isCreateExperience && (
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                            y: 0,
                                          }}
                                          exit={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          transition={{
                                            duration: 0.3,
                                            ease: "easeOut",
                                          }}
                                          className="mb-6 sm:mb-8 relative"
                                        >
                                          {/* Background Blur */}
                                          <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/10 to-blue-500/10 rounded-2xl sm:rounded-3xl blur-sm pointer-events-none"></div>

                                          {/* Main Card */}
                                          <div className="relative bg-white/80 rounded-xl p-4 sm:p-6 md:p-8 border border-white/50 shadow-xl mt-4 sm:mt-5">
                                            {/* Header */}
                                            <div className="flex items-center gap-3 mb-5 sm:mb-6">
                                              <div className="w-8 h-8 bg-[#1E3786] rounded-md flex items-center justify-center flex-shrink-0">
                                                <Plus className="w-4 h-4 text-white" />
                                              </div>
                                              <h4 className="text-lg sm:text-xl font-bold text-gray-900">
                                                Add New Experience
                                              </h4>
                                            </div>

                                            {/* Form Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                                              {/* College Name */}
                                              <div className="space-y-2 w-full">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  College Name
                                                </label>
                                                <Input
                                                  placeholder="e.g., Google Inc."
                                                  value={state.company || ""}
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "company",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="w-full border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>

                                              {/* Job Title */}
                                              <div className="space-y-2 w-full">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Job Title
                                                </label>
                                                <Input
                                                  placeholder="e.g., Senior Software Engineer"
                                                  value={
                                                    state.designation || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "designation",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="w-full border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>

                                              {/* Start Date */}
                                              <div className="space-y-2 w-full">
                                                <DatePicker
                                                  placeholder="Start Date"
                                                  title="Start Date"
                                                  closeIcon={true}
                                                  selectedDate={
                                                    state.start_date
                                                  }
                                                  onChange={(date) => {
                                                    setState({
                                                      start_date: date,
                                                    });
                                                  }}
                                                  toDate={new Date()}
                                                />
                                              </div>

                                              {/* End Date */}
                                              {!state.is_present && (
                                                <div className="space-y-2 w-full">
                                                  <DatePicker
                                                    placeholder="End Date"
                                                    title="End Date"
                                                    closeIcon={true}
                                                    selectedDate={
                                                      state.end_date
                                                    }
                                                    onChange={(date) => {
                                                      setState({
                                                        end_date: date,
                                                      });
                                                    }}
                                                    fromDate={
                                                      state.start_date
                                                        ? new Date(
                                                            state.start_date,
                                                          )
                                                        : undefined
                                                    } // ✅ prevent before start date
                                                    toDate={new Date()}
                                                  />
                                                </div>
                                              )}

                                              {/* Checkbox */}
                                              <div className="flex items-start sm:items-center gap-2 col-span-1 md:col-span-2">
                                                <input
                                                  type="checkbox"
                                                  id="is_present_create"
                                                  checked={
                                                    state.is_present || false
                                                  }
                                                  onChange={(e) =>
                                                    setState({
                                                      is_present:
                                                        e.target.checked,
                                                      end_date: e.target.checked
                                                        ? null
                                                        : state.end_date ||
                                                          null,
                                                    })
                                                  }
                                                  className="h-4 w-4 mt-1 sm:mt-0 rounded border-gray-300 text-[#1E3786]"
                                                />
                                                <label
                                                  htmlFor="is_present_create"
                                                  className="text-sm font-semibold text-gray-700 leading-snug"
                                                >
                                                  Present (Currently working
                                                  here)
                                                </label>
                                              </div>
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-2 mb-6">
                                              <label className="text-sm font-semibold text-gray-700">
                                                Job Description
                                              </label>
                                              <Textarea
                                                placeholder="Describe your key responsibilities and achievements..."
                                                value={state.job_description}
                                                onChange={(e) =>
                                                  handleFormChange(
                                                    "job_description",
                                                    e.target.value,
                                                  )
                                                }
                                                className="w-full border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6] min-h-[100px]"
                                              />
                                            </div>

                                            {/* Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-3">
                                              <Button
                                                onClick={addEmployment}
                                                className="w-full sm:w-auto bg-[#1E3786] hover:bg-[#1E3786] text-white shadow-lg"
                                              >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Create Experience
                                              </Button>

                                              <Button
                                                variant="outline"
                                                onClick={() =>
                                                  setState({
                                                    isCreateExperience: false,
                                                  })
                                                }
                                                className="w-full sm:w-auto border-gray-300 hover:bg-gray-50"
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Employment List */}
                                    <div className="space-y-4 pt-5">
                                      {state.userDetail?.experiences?.map(
                                        (emp, index) => (
                                          <motion.div
                                            key={emp.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="relative group"
                                          >
                                            {/* <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/5 to-blue-500/5 rounded-3xl blur-sm group-hover:from-[#3b82f6]/10 group-hover:to-blue-500/10 transition-all duration-300"></div> */}
                                            <div className="relative bg-white/70  rounded-lg p-6 border   transition-all duration-300 ">
                                              <div className="flex items-start gap-3">
                                                {/* Company Logo Placeholder */}
                                                <div className="flex-shrink-0 pt-1">
                                                  <div className="w-10 h-10 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    <span className="text-white font-bold text-md">
                                                      {emp.company
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                    </span>
                                                  </div>
                                                  {/* {emp.current && (
                                                  <div className="mt-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold text-center">
                                                    Current
                                                  </div>
                                                )} */}
                                                </div>

                                                {/* Job Details */}
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-start justify-between md:mb-1">
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2">
                                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                                                          {emp.designation}
                                                        </h4>
                                                      </div>
                                                      <p className="text-md font-semibold text-[#1E3786] mb-1">
                                                        {emp.company}
                                                      </p>
                                                      <div className="text-sm text-gray-600 mb-2">
                                                        {/* <span className="font-medium">
                                                        {emp.jobType || "Full-time"}
                                                      </span>{" "}
                                                      | */}
                                                        <span className="ml-1">
                                                          {DateFormat(
                                                            emp.start_date,
                                                            "date",
                                                          )}{" "}
                                                          to{" "}
                                                          {emp.end_date &&
                                                          DateFormat(
                                                            emp.end_date,
                                                            "date",
                                                          )
                                                            ? DateFormat(
                                                                emp.end_date,
                                                                "date",
                                                              )
                                                            : "Present"}
                                                        </span>
                                                        {/* <span className="ml-1">
                                                        (
                                                        {emp.duration || "2 years 3 months"}
                                                        )
                                                      </span> */}
                                                      </div>
                                                    </div>

                                                    {/* Desktop Action Buttons - Top Right */}
                                                    <div className="hidden md:flex gap-2">
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="hover:bg-[#1E3786]/10 border-[#3b82f6]/30 group/btn"
                                                        onClick={() =>
                                                          setState({
                                                            isEditingExperience: true,
                                                            company:
                                                              emp.company,
                                                            designation:
                                                              emp.designation,
                                                            start_date:
                                                              emp.start_date,
                                                            end_date:
                                                              emp.end_date,
                                                            is_present:
                                                              emp.currently_working,
                                                            job_description:
                                                              emp.job_description,
                                                            editingId: emp.id,
                                                          })
                                                        }
                                                      >
                                                        <Edit className="w-4 h-4 text-[#1E3786] group-hover/btn:scale-110 transition-transform" />
                                                      </Button>
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                          deleteEmployment(
                                                            emp.id,
                                                          )
                                                        }
                                                        className="hover:bg-red-50 border-red-200 group/btn"
                                                      >
                                                        <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:scale-110 transition-transform" />
                                                      </Button>
                                                    </div>
                                                  </div>

                                                  {/* Job Description */}
                                                  {emp.job_description && (
                                                    <div className="bg-white rounded-lg py-4 px-2 border mb-2">
                                                      <p className="text-gray-700 leading-relaxed text-sm">
                                                        {expandedDesc[emp.id]
                                                          ? emp.job_description
                                                          : emp.job_description?.slice(
                                                              0,
                                                              280,
                                                            )}
                                                        {!expandedDesc[
                                                          emp.id
                                                        ] &&
                                                          emp.job_description
                                                            ?.length > 280 &&
                                                          "..."}
                                                        {emp.job_description &&
                                                          emp.job_description
                                                            .length > 280 && (
                                                            <button
                                                              onClick={() =>
                                                                setExpandedDesc(
                                                                  (prev) => ({
                                                                    ...prev,
                                                                    [emp.id]:
                                                                      !prev[
                                                                        emp.id
                                                                      ],
                                                                  }),
                                                                )
                                                              }
                                                              className="text-blue-600 text-sm font-medium hover:underline ml-1"
                                                            >
                                                              {expandedDesc[
                                                                emp.id
                                                              ]
                                                                ? "Read Less"
                                                                : "Read More"}
                                                            </button>
                                                          )}
                                                      </p>
                                                    </div>
                                                  )}

                                                  {/* Key Skills */}
                                                  {/* {emp.keySkills &&
                                                  emp.keySkills.length > 0 && (
                                                    <div className="mb-4">
                                                      <h5 className="text-sm font-semibold text-gray-700 mb-2">
                                                        Top 5 key skills:
                                                      </h5>
                                                      <div className="flex flex-wrap gap-2">
                                                        {emp.keySkills.map(
                                                          (skill, skillIndex) => (
                                                            <span
                                                              key={skillIndex}
                                                              className="text-purple-600 text-sm hover:underline cursor-pointer"
                                                            >
                                                              {skill}
                                                              {skillIndex <
                                                              emp.keySkills.length - 1
                                                                ? ","
                                                                : ""}
                                                            </span>
                                                          ),
                                                        )}
                                                      </div>
                                                    </div>
                                                  )} */}

                                                  {/* Salary Badge */}
                                                  <div className="flex items-center justify-between">
                                                    {/* Mobile Action Buttons - Bottom Right */}
                                                    <div className="flex md:hidden gap-2">
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="hover:bg-[#1E3786]/10 border-[#3b82f6]/30 group/btn"
                                                        onClick={() =>
                                                          setState({
                                                            isEditingExperience: true,
                                                            company:
                                                              emp.company,
                                                            designation:
                                                              emp.designation,
                                                            start_date:
                                                              emp.start_date,
                                                            end_date:
                                                              emp.end_date,
                                                            is_present:
                                                              emp.currently_working,
                                                            job_description:
                                                              emp.job_description,
                                                            editingId: emp.id,
                                                          })
                                                        }
                                                      >
                                                        <Edit className="w-4 h-4 text-[#1E3786] group-hover/btn:scale-110 transition-transform" />
                                                      </Button>
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                          deleteEmployment(
                                                            emp.id,
                                                          )
                                                        }
                                                        className="hover:bg-red-50 border-red-200 group/btn"
                                                      >
                                                        <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:scale-110 transition-transform" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Timeline Connector */}
                                              {index <
                                                state?.userDetail?.experiences
                                                  .length -
                                                  1 && (
                                                <div className="absolute -bottom-3 left-8 w-0.5 h-6 bg-gradient-to-b from-[#3b82f6]/50 to-[#3b82f6]"></div>
                                              )}
                                            </div>
                                          </motion.div>
                                        ),
                                      )}
                                    </div>

                                    {/* Empty State */}
                                    {(state.userDetail?.experiences?.length ===
                                      0 ||
                                      !state.userDetail?.experiences
                                        ?.length) && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12"
                                      >
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6]/20 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                          <Briefcase className="w-8 h-8 text-[#1E3786]/60" />
                                        </div>
                                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                          No Employment History
                                        </h4>
                                        <p className="text-gray-500 mb-6">
                                          Add your work experience to showcase
                                          your professional journey
                                        </p>
                                        <Button
                                          onClick={() =>
                                            setState({
                                              isCreateExperience: true,
                                              company: "",
                                              designation: "",
                                              start_date: "",
                                              end_date: "",
                                              is_present: false,
                                              job_description: "",
                                            })
                                          }
                                          className="bg-[#1E3786] hover:bg-[#1E3786]"
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Add Your First Job
                                        </Button>
                                      </motion.div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>

                          {/* Education Section */}
                          <Card
                            id="education-section"
                            className="!rounded-none bg-clr2 border shadow-none overflow-hidden relative"
                          >
                            {/* <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/20  blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#3b82f6]/20 to-[#3b82f6]/20  blur-2xl"></div> */}

                            <CardContent className="relative py-4 px-2">
                              <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection("education")}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg transform ">
                                    <GraduationCap className="w-4 h-4 text-white transform " />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold bg-[#1E3786] bg-clip-text text-transparent">
                                      Education
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      Your academic background
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setState({
                                        isCreateEducation: true,
                                        institution: "",
                                        degree: "",
                                        field: "",
                                        start_year: "",
                                        end_year: "",
                                        cgpa: "",
                                        expandedSections: {
                                          ...state.expandedSections,
                                          education: true,
                                        },
                                      });
                                    }}
                                    className="w-8 h-8 bg-[#1E3786]  text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSection("education");
                                    }}
                                    className="cursor-pointer"
                                  >
                                    {state.expandedSections.education ? (
                                      <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                  </span>
                                </div>
                              </div>

                              <AnimatePresence>
                                {state.expandedSections.education && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {/* Add Education Form */}
                                    <AnimatePresence>
                                      {state.isCreateEducation && (
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                            y: 0,
                                          }}
                                          exit={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          transition={{
                                            duration: 0.3,
                                            ease: "easeOut",
                                          }}
                                          className="mb-8 relative"
                                        >
                                          <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/10 to-blue-500/10 rounded-3xl blur-sm"></div>
                                          <div className="relative bg-white/80  rounded-lg p-8 mt-5 border border-white/50 shadow-xl">
                                            <div className="flex items-center gap-3 mb-6">
                                              <div className="w-8 h-8 bg-[#1E3786] rounded-md flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-white" />
                                              </div>
                                              <h4 className="text-xl font-bold text-gray-900">
                                                Add Education Details
                                              </h4>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Institution Name
                                                </label>
                                                <Input
                                                  placeholder="e.g., Harvard University"
                                                  value={
                                                    state.institution || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "institution",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Degree
                                                </label>
                                                <Input
                                                  placeholder="e.g., Bachelor of Technology"
                                                  value={state.degree || ""}
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "degree",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Field of Study
                                                </label>
                                                <Input
                                                  placeholder="e.g., Computer Science"
                                                  value={state.field || ""}
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "field",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Grade/CGPA
                                                </label>
                                                <Input
                                                  placeholder="e.g., 8.5 CGPA"
                                                  value={state.cgpa || ""}
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "cgpa",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Start Year
                                                </label>
                                                <Input
                                                  placeholder="e.g., 2016"
                                                  value={state.start_year || ""}
                                                  onKeyDown={onlyNumbers}
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "start_year",
                                                      numericString(e.target.value),
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  End Year
                                                </label>
                                                <Input
                                                  placeholder="e.g., 2020"
                                                  value={state.end_year || ""}
                                                  onKeyDown={onlyNumbers}
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "end_year",
                                                      numericString(e.target.value),
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                            </div>

                                            <div className="flex gap-3">
                                              <Button
                                                onClick={addEducation}
                                                className="bg-[#1E3786] hover:bg-[#1E3786] text-white shadow-lg"
                                              >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Create Education
                                              </Button>
                                              <Button
                                                variant="outline"
                                                onClick={() =>
                                                  setState({
                                                    isCreateEducation: false,
                                                  })
                                                }
                                                className="border-gray-300 hover:bg-gray-50"
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Education List */}
                                    <div className="space-y-4 pt-5">
                                      {state?.userDetail?.educations?.map(
                                        (edu, index) => (
                                          <motion.div
                                            key={edu.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="relative group"
                                          >
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/5 to-blue-500/5 rounded-3xl blur-sm  transition-all duration-300"></div>
                                            <div className="relative bg-white/70  rounded-lg p-6 border   ">
                                              <div className="flex items-start gap-3">
                                                {/* Institution Logo Placeholder */}
                                                <div className="flex-shrink-0 pt-1">
                                                  <div className="w-10 h-10 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg transition-transform duration-300">
                                                    <span className="text-white font-bold text-md">
                                                      {edu.institution
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                    </span>
                                                  </div>
                                                </div>

                                                {/* Education Details */}
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-start justify-between md:mb-1 ">
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2">
                                                        <h4 className="text-xl font-bold text-gray-900 group-hover:text-black transition-colors">
                                                          {edu.degree}
                                                        </h4>
                                                      </div>
                                                      <p className="text-md font-semibold text-[#1E3786]">
                                                        {edu.institution}
                                                      </p>
                                                      <div className="text-sm text-gray-600">
                                                        <span className="font-medium">
                                                          {edu.field}
                                                        </span>
                                                      </div>
                                                    </div>

                                                    {/* Desktop Action Buttons - Top Right */}
                                                    <div className="hidden md:flex gap-2">
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="hover:bg-[#1E3786]/10 border-[#3b82f6]/30 group/btn"
                                                        onClick={() =>
                                                          setState({
                                                            isEditingEducation: true,
                                                            institution:
                                                              edu.institution,
                                                            degree: edu.degree,
                                                            field: edu.field,
                                                            cgpa: edu.cgpa,
                                                            start_year:
                                                              edu.start_year,
                                                            end_year:
                                                              edu.end_year,
                                                            education_id:
                                                              edu.id,
                                                          })
                                                        }
                                                      >
                                                        <Edit className="w-4 h-4 text-[#1E3786] group-hover/btn:scale-110 transition-transform" />
                                                      </Button>
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                          deleteEducation(
                                                            edu.id,
                                                          )
                                                        }
                                                        className="hover:bg-red-50 border-red-200 group/btn"
                                                      >
                                                        <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:scale-110 transition-transform" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                  <div className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">
                                                      {edu.start_year} -{" "}
                                                      {edu.end_year}
                                                    </span>{" "}
                                                    |
                                                    <span className="ml-1">
                                                      {edu.cgpa}
                                                    </span>
                                                  </div>

                                                  {/* Mobile Action Buttons - Bottom Right */}
                                                  <div className="flex md:hidden justify-end gap-2 mt-4">
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      className="hover:bg-[#1E3786]/10 border-[#3b82f6]/30 group/btn"
                                                      onClick={() =>
                                                        setState({
                                                          isEditingEducation: true,
                                                          institution:
                                                            edu.institution,
                                                          degree: edu.degree,
                                                          field: edu.field,
                                                          cgpa: edu.cgpa,
                                                          start_year:
                                                            edu.start_year,
                                                          end_year:
                                                            edu.end_year,
                                                          education_id: edu.id,
                                                        })
                                                      }
                                                    >
                                                      <Edit className="w-4 h-4 text-[#1E3786] group-hover/btn:scale-110 transition-transform" />
                                                    </Button>
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() =>
                                                        deleteEducation(edu.id)
                                                      }
                                                      className="hover:bg-red-50 border-red-200 group/btn"
                                                    >
                                                      <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:scale-110 transition-transform" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Timeline Connector */}
                                              {index <
                                                state?.userDetail?.educations
                                                  ?.length -
                                                  1 && (
                                                <div className="absolute -bottom-3 left-8 w-0.5 h-6 bg-gradient-to-b from-[#3b82f6]/50 to-[#3b82f6]"></div>
                                              )}
                                            </div>
                                          </motion.div>
                                        ),
                                      )}
                                    </div>

                                    {/* Empty State */}
                                    {(state?.userDetail?.educations?.length ===
                                      0 ||
                                      !state?.userDetail?.educations) && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12"
                                      >
                                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <GraduationCap className="w-12 h-12 text-[#1E3786]/60" />
                                        </div>
                                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                          No Education History
                                        </h4>
                                        <p className="text-gray-500 mb-6">
                                          Add your educational background to
                                          showcase your qualifications
                                        </p>
                                        <Button
                                          onClick={() =>
                                            setState({
                                              isCreateEducation: true,
                                              institution: "",
                                              degree: "",
                                              field: "",
                                              start_year: "",
                                              end_year: "",
                                              cgpa: "",
                                            })
                                          }
                                          className="bg-[#1E3786] hover:bg-[#1E3786]"
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Add Your First Education
                                        </Button>
                                      </motion.div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>

                          {/* Projects Section */}
                          <Card
                            id="projects-section"
                            className="!rounded-none bg-clr2 border shadow-none overflow-hidden relative"
                          >
                            {/* <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#3b82f6]/20 to-[#3b82f6]/20 rounded-full blur-2xl"></div> */}

                            <CardContent className="relative py-4 px-2">
                              <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection("projects")}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg transform ">
                                    <FolderOpen className="w-4 h-4 text-white transform " />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold bg-[#1E3786] bg-clip-text text-transparent">
                                      Projects
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      Your portfolio showcase
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setState({
                                        isCreateProjects: true,
                                        project_title: "",
                                        project_description: "",
                                        technologies: [],
                                        duration: "",
                                        status: "",
                                        project_link: "",
                                        technology: "",
                                        funded: false,
                                        funding_details: "",
                                        expandedSections: {
                                          ...state.expandedSections,
                                          projects: true,
                                        },
                                      });
                                    }}
                                    className="w-8 h-8 bg-[#1E3786]  text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSection("projects");
                                    }}
                                    className="cursor-pointer"
                                  >
                                    {state.expandedSections.projects ? (
                                      <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                  </span>
                                </div>
                              </div>

                              <AnimatePresence>
                                {state.expandedSections.projects && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {/* Add Project Form */}
                                    <AnimatePresence>
                                      {state.isCreateProjects && (
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                            y: 0,
                                          }}
                                          exit={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          transition={{
                                            duration: 0.3,
                                            ease: "easeOut",
                                          }}
                                          className="mb-8 relative"
                                        >
                                          <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/10 to-blue-500/10 rounded-3xl blur-sm"></div>
                                          <div className="relative bg-white/80 rounded-lg p-8 border border-white/50 shadow-xl mt-5">
                                            <div className="flex items-center gap-3 mb-6">
                                              <div className="w-8 h-8 bg-[#1E3786] rounded-md flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-white" />
                                              </div>
                                              <h4 className="text-xl font-bold text-gray-900">
                                                Add New Project
                                              </h4>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Project Title
                                                </label>
                                                <Input
                                                  placeholder="e.g., E-Commerce Platform"
                                                  value={
                                                    state.project_title || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "project_title",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Duration
                                                </label>
                                                <Input
                                                  placeholder="e.g., 3 months"
                                                  value={state.duration || ""}
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "duration",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Status
                                                </label>
                                                <Input
                                                  placeholder="e.g., Completed"
                                                  value={state.status || ""}
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "status",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Project Link
                                                </label>
                                                <Input
                                                  placeholder="e.g., https://github.com/username/project"
                                                  value={
                                                    state.project_link || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "project_link",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2 flex items-center gap-2">
                                                <input
                                                  type="checkbox"
                                                  id="funded-create"
                                                  className="h-4 w-4 rounded border-gray-300 text-[#1E3786] focus:ring-[#3b82f6]"
                                                  checked={state.funded}
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "funded",
                                                      e.target.checked,
                                                    )
                                                  }
                                                />
                                                <label
                                                  htmlFor="funded-create"
                                                  className="text-sm font-semibold text-gray-700"
                                                >
                                                  Is this project funded?
                                                </label>
                                              </div>
                                              {state.funded && (
                                                <div className="space-y-2 md:col-span-2">
                                                  <label className="text-sm font-semibold text-gray-700">
                                                    Funding Details
                                                  </label>
                                                  <Textarea
                                                    placeholder="Enter funding details..."
                                                    value={
                                                      state.funding_details ||
                                                      ""
                                                    }
                                                    onChange={(e) =>
                                                      handleFormChange(
                                                        "funding_details",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6] min-h-[100px]"
                                                  />
                                                </div>
                                              )}
                                              <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Technologies
                                                </label>
                                                <div className="flex gap-2">
                                                  <Input
                                                    placeholder="e.g., React.js"
                                                    value={
                                                      state.technology || ""
                                                    }
                                                    onChange={(e) =>
                                                      handleFormChange(
                                                        "technology",
                                                        e.target.value,
                                                      )
                                                    }
                                                    onKeyDown={(e) => {
                                                      if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleAddTechnology();
                                                      }
                                                    }}
                                                    className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                  />
                                                  <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={
                                                      handleAddTechnology
                                                    }
                                                  >
                                                    Add
                                                  </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                  {state.technologies?.map(
                                                    (
                                                      tech: string,
                                                      index: number,
                                                    ) => (
                                                      <div
                                                        key={index}
                                                        className="bg-[#1E3786]/20 text-blue-900 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center gap-2"
                                                      >
                                                        {tech}
                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            handleRemoveTechnology(
                                                              tech,
                                                            )
                                                          }
                                                          className="text-blue-800 hover:text-blue-900"
                                                        >
                                                          <X className="w-3 h-3" />
                                                        </button>
                                                      </div>
                                                    ),
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            <div className="space-y-2 mb-6">
                                              <label className="text-sm font-semibold text-gray-700">
                                                Project Description
                                              </label>
                                              <Textarea
                                                placeholder="Describe your project, its features, and your role..."
                                                value={
                                                  state.project_description ||
                                                  ""
                                                }
                                                onChange={(e) =>
                                                  handleFormChange(
                                                    "project_description",
                                                    e.target.value,
                                                  )
                                                }
                                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6] min-h-[100px]"
                                              />
                                            </div>

                                            <div className="flex gap-3">
                                              <Button
                                                onClick={addProject}
                                                className="bg-[#1E3786] hover:bg-[#1E3786] text-white shadow-lg"
                                              >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Create Project
                                              </Button>
                                              <Button
                                                variant="outline"
                                                onClick={() =>
                                                  setState({
                                                    isCreateProjects: false,
                                                  })
                                                }
                                                className="border-gray-300 hover:bg-gray-50"
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Projects List */}
                                    <div className="space-y-4 pt-5">
                                      {state.userDetail?.projects?.map(
                                        (project, index) => (
                                          <motion.div
                                            key={project.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="relative group"
                                          >
                                            {/* <div className="absolute rounded-lg blur-sm group-hover:from-[#3b82f6]/10 "></div> */}
                                            <div className="relative bg-white/70 rounded-lg p-5  border transition-all duration-300 ">
                                              <div className="flex items-start gap-3">
                                                {/* Project Icon */}
                                                <div className="flex-shrink-0 pt-1">
                                                  <div className="w-10 h-10 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    <span className="text-white font-bold text-md">
                                                      {project.project_title
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                    </span>
                                                  </div>
                                                </div>

                                                {/* Project Details */}
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-start justify-between md:mb-1">
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2">
                                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                                                          {
                                                            project.project_title
                                                          }
                                                        </h4>
                                                      </div>
                                                      <div className="text-sm text-gray-600 mb-2">
                                                        <span className="font-medium">
                                                          Duration:{" "}
                                                          {project.duration}
                                                        </span>
                                                        {project.Project_link && (
                                                          <span className="ml-2">
                                                            |{" "}
                                                            <a
                                                              href={
                                                                project.project_link
                                                              }
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="text-[#1E3786] hover:underline"
                                                            >
                                                              View Project
                                                            </a>
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>

                                                    {/* Desktop Action Buttons - Top Right */}
                                                    <div className="hidden md:flex gap-2">
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="hover:bg-[#1E3786]/10 border-[#3b82f6]/30 group/btn"
                                                        onClick={() => {
                                                          setState({
                                                            isEditingProject: true,
                                                            project_title:
                                                              project.project_title,
                                                            duration:
                                                              project.duration,
                                                            status:
                                                              project.status,
                                                            project_link:
                                                              project.project_link,
                                                            project_description:
                                                              project.project_description,
                                                            technologies:
                                                              project.technologies,
                                                            funded:
                                                              project.funded,
                                                            funding_details:
                                                              project.funding_details,
                                                            project_id:
                                                              project.id,
                                                          });
                                                        }}
                                                      >
                                                        <Edit className="w-4 h-4 text-[#1E3786] group-hover/btn:scale-110 transition-transform" />
                                                      </Button>
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                          deleteProject(
                                                            project.id,
                                                          )
                                                        }
                                                        className="hover:bg-red-50 border-red-200 group/btn"
                                                      >
                                                        <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:scale-110 transition-transform" />
                                                      </Button>
                                                    </div>
                                                  </div>

                                                  {/* Project Description */}
                                                  {project.project_description && (
                                                    <div className="bg-white rounded-lg p-4 border  mb-4">
                                                      <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                                                        {expandedProjectDesc[
                                                          project.id
                                                        ]
                                                          ? project.project_description
                                                          : project.project_description?.slice(
                                                              0,
                                                              280,
                                                            )}
                                                        {!expandedProjectDesc[
                                                          project.id
                                                        ] &&
                                                          project
                                                            .project_description
                                                            ?.length > 280 &&
                                                          "..."}
                                                        {project.project_description &&
                                                          project
                                                            .project_description
                                                            .length > 280 && (
                                                            <button
                                                              onClick={() =>
                                                                setExpandedProjectDesc(
                                                                  (prev) => ({
                                                                    ...prev,
                                                                    [project.id]:
                                                                      !prev[
                                                                        project
                                                                          .id
                                                                      ],
                                                                  }),
                                                                )
                                                              }
                                                              className="text-blue-600 text-sm font-medium hover:underline ml-1"
                                                            >
                                                              {expandedProjectDesc[
                                                                project.id
                                                              ]
                                                                ? "Read Less"
                                                                : "Read More"}
                                                            </button>
                                                          )}
                                                      </p>

                                                      {project.funding_details && (
                                                        <div className="mt-4">
                                                          <h5 className="text-sm font-semibold text-gray-700 mb-1">
                                                            Funding Details
                                                          </h5>
                                                          <p className="text-gray-700 leading-relaxed text-sm">
                                                            {
                                                              project.funding_details
                                                            }
                                                          </p>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}

                                                  {/* Technologies */}
                                                  {project.technologies &&
                                                    project.technologies
                                                      .length > 0 && (
                                                      <div className="">
                                                        <h5 className="text-sm font-semibold text-gray-700 mb-2">
                                                          Technologies Used:
                                                        </h5>
                                                        <div className="flex flex-wrap gap-2">
                                                          {project.technologies.map(
                                                            (
                                                              tech,
                                                              techIndex,
                                                            ) => (
                                                              <span
                                                                key={techIndex}
                                                                className="bg-gradient-to-r from-[#3b82f6]/20 to-blue-100 text-[#1E3786] px-3 py-1 rounded-full text-sm font-medium"
                                                              >
                                                                {tech}
                                                              </span>
                                                            ),
                                                          )}
                                                        </div>
                                                      </div>
                                                    )}

                                                  {/* Mobile Action Buttons - Bottom Right */}
                                                  <div className="flex md:hidden justify-end gap-2 mt-4">
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      className="hover:bg-[#1E3786]/10 border-[#3b82f6]/30 group/btn"
                                                      onClick={() => {
                                                        setState({
                                                          isEditingProject: true,
                                                          project_title:
                                                            project.project_title,
                                                          duration:
                                                            project.duration,
                                                          status:
                                                            project.status,
                                                          project_link:
                                                            project.Project_link,
                                                          project_description:
                                                            project.project_description,
                                                          technologies:
                                                            project.technologies,
                                                          funded:
                                                            project.funded,
                                                          funding_details:
                                                            project.funding_details,
                                                          project_id:
                                                            project.id,
                                                        });
                                                      }}
                                                    >
                                                      <Edit className="w-4 h-4 text-[#1E3786] group-hover/btn:scale-110 transition-transform" />
                                                    </Button>
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() =>
                                                        deleteProject(
                                                          project.id,
                                                        )
                                                      }
                                                      className="hover:bg-red-50 border-red-200 group/btn"
                                                    >
                                                      <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:scale-110 transition-transform" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Timeline Connector */}
                                              {index <
                                                state.userDetail?.projects
                                                  ?.length -
                                                  1 && (
                                                <div className="absolute -bottom-3 left-8 w-0.5 h-6 bg-gradient-to-b from-[#3b82f6]/50 to-transparent"></div>
                                              )}
                                            </div>
                                          </motion.div>
                                        ),
                                      )}
                                    </div>

                                    {/* Empty State */}
                                    {(state.userDetail?.projects?.length ===
                                      0 ||
                                      !state.userDetail?.projects) && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12"
                                      >
                                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <FolderOpen className="w-12 h-12 text-[#1E3786]/60" />
                                        </div>
                                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                          No Projects Added
                                        </h4>
                                        <p className="text-gray-500 mb-6">
                                          Showcase your work by adding your
                                          projects and achievements
                                        </p>
                                        <Button
                                          onClick={() =>
                                            setState({
                                              isCreateProjects: true,
                                              project_title: "",
                                              project_description: "",
                                              technologies: [],
                                              duration: "",
                                              status: "",
                                              project_link: "",
                                              technology: "",
                                            })
                                          }
                                          className="bg-[#1E3786] hover:bg-[#1E3786]"
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Add Your First Project
                                        </Button>
                                      </motion.div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>

                          {/* Publications Section */}
                          <Card
                            id="publications-section"
                            className="!rounded-none bg-clr2 border shadow-none overflow-hidden relative"
                          >
                            {/* <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#3b82f6]/20 to-[#3b82f6]/20 rounded-full blur-2xl"></div> */}

                            <CardContent className="relative py-4 px-2">
                              <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection("publications")}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg transform ">
                                    <Book className="w-4 h-4 text-white transform " />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold bg-[#1E3786] bg-clip-text text-transparent">
                                      Publications
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      Your research and publications
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setState({
                                        isCreatePublication: true,
                                        publication_title: "",
                                        publication_description: "",
                                        publication_journal: "",
                                        publication_volume: "",
                                        publication_issue: "",
                                        publication_year: "",
                                        expandedSections: {
                                          ...state.expandedSections,
                                          publications: true,
                                        },
                                      });
                                    }}
                                    className="w-8 h-8 bg-[#1E3786]  text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSection("publications");
                                    }}
                                    className="cursor-pointer"
                                  >
                                    {state.expandedSections.publications ? (
                                      <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                  </span>
                                </div>
                              </div>

                              <AnimatePresence>
                                {state.expandedSections.publications && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {/* Add Publication Form */}
                                    <AnimatePresence>
                                      {state.isCreatePublication && (
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                            y: 0,
                                          }}
                                          exit={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          transition={{
                                            duration: 0.3,
                                            ease: "easeOut",
                                          }}
                                          className="mb-8 relative"
                                        >
                                          <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/10 to-blue-500/10 rounded-3xl blur-sm"></div>
                                          <div className="relative bg-white/80 rounded-lg p-8 mt-5 border border-white/50 shadow-xl">
                                            <div className="flex items-center gap-3 mb-6">
                                              <div className="w-8 h-8 bg-[#1E3786] rounded-md flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-white" />
                                              </div>
                                              <h4 className="text-xl font-bold text-gray-900">
                                                Add New Publication
                                              </h4>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Publication Title
                                                </label>
                                                <Input
                                                  placeholder="e.g., Advanced AI Research"
                                                  value={
                                                    state.publication_title ||
                                                    ""
                                                  }
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "publication_title",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Journal
                                                </label>
                                                <Input
                                                  placeholder="e.g., IEEE Transactions"
                                                  value={
                                                    state.publication_journal ||
                                                    ""
                                                  }
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "publication_journal",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Volume
                                                </label>
                                                <Input
                                                  placeholder="e.g., 42"
                                                  value={
                                                    state.publication_volume ||
                                                    ""
                                                  }
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "publication_volume",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Issue
                                                </label>
                                                <Input
                                                  placeholder="e.g., 3"
                                                  value={
                                                    state.publication_issue ||
                                                    ""
                                                  }
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "publication_issue",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Year
                                                </label>
                                                <Input
                                                  placeholder="e.g., 2023"
                                                  value={
                                                    state.publication_year || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "publication_year",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                            </div>

                                            <div className="space-y-2 mb-6">
                                              <label className="text-sm font-semibold text-gray-700">
                                                Description
                                              </label>
                                              <Textarea
                                                placeholder="Brief description of the publication..."
                                                value={
                                                  state.publication_description ||
                                                  ""
                                                }
                                                onChange={(e) =>
                                                  handleFormChange(
                                                    "publication_description",
                                                    e.target.value,
                                                  )
                                                }
                                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6] min-h-[100px]"
                                              />
                                            </div>

                                            <div className="flex gap-3">
                                              <Button
                                                onClick={addPublication}
                                                className="bg-[#1E3786] hover:bg-[#1E3786] text-white shadow-lg"
                                              >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Create Publication
                                              </Button>
                                              <Button
                                                variant="outline"
                                                onClick={() =>
                                                  setState({
                                                    isCreatePublication: false,
                                                  })
                                                }
                                                className="border-gray-300 hover:bg-gray-50"
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Publications List */}
                                    <div className="space-y-4">
                                      {state.userDetail?.publications?.map(
                                        (pub, index) => (
                                          <motion.div
                                            key={pub.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="relative group"
                                          >
                                            {/* <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/5 to-blue-500/5 rounded-3xl blur-sm group-hover:from-[#3b82f6]/10 group-hover:to-blue-500/10 transition-all duration-300"></div> */}
                                            <div className="relative bg-white/70 rounded-lg p-6 mt-5 border ">
                                              <div className="flex items-start gap-3">
                                                {/* Publication Icon */}
                                                <div className="flex-shrink-0 pt-1">
                                                  <div className="w-10 h-10 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    <span className="text-white font-bold text-md">
                                                      {pub.publication_title
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                    </span>
                                                  </div>
                                                </div>

                                                {/* Publication Details */}
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-start justify-between md:mb-1">
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2">
                                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                                                          {
                                                            pub.publication_title
                                                          }
                                                        </h4>
                                                      </div>
                                                      <div className="text-sm text-gray-600 mb-2">
                                                        {pub.publication_journal && (
                                                          <span className="font-medium">
                                                            {
                                                              pub.publication_journal
                                                            }
                                                          </span>
                                                        )}
                                                        {pub.publication_year && (
                                                          <span className="ml-2">
                                                            | Year:{" "}
                                                            {
                                                              pub.publication_year
                                                            }
                                                          </span>
                                                        )}
                                                      </div>
                                                      {pub.publication_volume && (
                                                        <div className="text-sm text-gray-600 mb-2">
                                                          Vol:{" "}
                                                          {
                                                            pub.publication_volume
                                                          }
                                                        </div>
                                                      )}
                                                      {pub.publication_issue && (
                                                        <div className="text-sm text-gray-600 mb-2">
                                                          Issue:{" "}
                                                          {
                                                            pub.publication_issue
                                                          }
                                                        </div>
                                                      )}
                                                    </div>

                                                    {/* Desktop Action Buttons - Top Right */}
                                                    <div className="hidden md:flex gap-2">
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="hover:bg-[#1E3786]/10 border-[#3b82f6]/30 group/btn"
                                                        onClick={() => {
                                                          setState({
                                                            isEditingPublication: true,
                                                            publication_title:
                                                              pub.publication_title,
                                                            publication_description:
                                                              pub.publication_description,
                                                            publication_journal:
                                                              pub.publication_journal,
                                                            publication_volume:
                                                              pub.publication_volume,
                                                            publication_issue:
                                                              pub.publication_issue,
                                                            publication_year:
                                                              pub.publication_year,
                                                            publication_id:
                                                              pub.id,
                                                          });
                                                        }}
                                                      >
                                                        <Edit className="w-4 h-4 text-[#1E3786] group-hover/btn:scale-110 transition-transform" />
                                                      </Button>
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                          deletePublication(
                                                            pub.id,
                                                          )
                                                        }
                                                        className="hover:bg-red-50 border-red-200 group/btn"
                                                      >
                                                        <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:scale-110 transition-transform" />
                                                      </Button>
                                                    </div>
                                                  </div>

                                                  {/* Publication Description */}
                                                  {pub.publication_description && (
                                                    <div className="bg-white rounded-lg p-4 border  ">
                                                      <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                                                        {expandedPublicationDesc[
                                                          pub.id
                                                        ]
                                                          ? pub.publication_description
                                                          : pub.publication_description?.slice(
                                                              0,
                                                              280,
                                                            )}
                                                        {!expandedPublicationDesc[
                                                          pub.id
                                                        ] &&
                                                          pub
                                                            .publication_description
                                                            ?.length > 280 &&
                                                          "..."}
                                                        {pub.publication_description &&
                                                          pub
                                                            .publication_description
                                                            .length > 280 && (
                                                            <button
                                                              onClick={() =>
                                                                setExpandedPublicationDesc(
                                                                  (prev) => ({
                                                                    ...prev,
                                                                    [pub.id]:
                                                                      !prev[
                                                                        pub.id
                                                                      ],
                                                                  }),
                                                                )
                                                              }
                                                              className="text-blue-600 text-sm font-medium hover:underline ml-1"
                                                            >
                                                              {expandedPublicationDesc[
                                                                pub.id
                                                              ]
                                                                ? "Read Less"
                                                                : "Read More"}
                                                            </button>
                                                          )}
                                                      </p>
                                                    </div>
                                                  )}

                                                  {/* Mobile Action Buttons - Bottom Right */}
                                                  <div className="flex md:hidden justify-end gap-2 mt-4">
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      className="hover:bg-[#1E3786]/10 border-[#3b82f6]/30 group/btn"
                                                      onClick={() => {
                                                        setState({
                                                          isEditingPublication: true,
                                                          publication_title:
                                                            pub.publication_title,
                                                          publication_description:
                                                            pub.publication_description,
                                                          publication_journal:
                                                            pub.publication_journal,
                                                          publication_volume:
                                                            pub.publication_volume,
                                                          publication_issue:
                                                            pub.publication_issue,
                                                          publication_year:
                                                            pub.publication_year,
                                                          publication_id:
                                                            pub.id,
                                                        });
                                                      }}
                                                    >
                                                      <Edit className="w-4 h-4 text-[#1E3786] group-hover/btn:scale-110 transition-transform" />
                                                    </Button>
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() =>
                                                        deletePublication(
                                                          pub.id,
                                                        )
                                                      }
                                                      className="hover:bg-red-50 border-red-200 group/btn"
                                                    >
                                                      <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:scale-110 transition-transform" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Timeline Connector */}
                                              {index <
                                                state.userDetail?.publications
                                                  ?.length -
                                                  1 && (
                                                <div className="absolute -bottom-3 left-8 w-0.5 h-6 bg-gradient-to-b from-[#3b82f6]/50 to-transparent"></div>
                                              )}
                                            </div>
                                          </motion.div>
                                        ),
                                      )}
                                    </div>

                                    {/* Empty State */}
                                    {(state.userDetail?.publications?.length ===
                                      0 ||
                                      !state.userDetail?.publications) && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12"
                                      >
                                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <Book className="w-12 h-12 text-[#1E3786]/60" />
                                        </div>
                                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                          No Publications Added
                                        </h4>
                                        <p className="text-gray-500 mb-6">
                                          Showcase your research work by adding
                                          your publications
                                        </p>
                                        <Button
                                          onClick={() =>
                                            setState({
                                              isCreatePublication: true,
                                              publication_title: "",
                                              publication_description: "",
                                              publication_journal: "",
                                              publication_volume: "",
                                              publication_issue: "",
                                              publication_year: "",
                                            })
                                          }
                                          className="bg-[#1E3786] hover:bg-[#1E3786]"
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Add Your First Publication
                                        </Button>
                                      </motion.div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>

                          {/* Skills Section */}
                          <Card
                            id="skills-section"
                            className="!rounded-none bg-clr2 border shadow-none overflow-hidden relative"
                          >
                            {/* <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#3b82f6]/20 to-[#3b82f6]/20 rounded-full blur-2xl"></div> */}

                            <CardContent className="relative py-4 px-2">
                              <div
                                className="flex items-center justify-between  cursor-pointer"
                                onClick={() => toggleSection("skills")}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg transform ">
                                    <Code className="w-4 h-4 text-white transform " />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold bg-[#1E3786] bg-clip-text text-transparent">
                                      Skills
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      Your technical expertise
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setState({
                                        isEditingSkills: true,
                                        skill: "",
                                        expandedSections: {
                                          ...state.expandedSections,
                                          skills: true,
                                        },
                                      });
                                    }}
                                    className="w-8 h-8 bg-[#1E3786]  text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSection("skills");
                                    }}
                                    className="cursor-pointer"
                                  >
                                    {state.expandedSections.skills ? (
                                      <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                  </span>
                                </div>
                              </div>

                              <AnimatePresence>
                                {state.expandedSections.skills && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {/* Add Skill Form */}
                                    <AnimatePresence>
                                      {state.isEditingSkills && (
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                            y: 0,
                                          }}
                                          exit={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          transition={{
                                            duration: 0.3,
                                            ease: "easeOut",
                                          }}
                                          className="mb-8 relative"
                                        >
                                          <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/10 to-blue-500/10 rounded-3xl blur-sm"></div>
                                          <div className="relative bg-white/80  rounded-lg mt-5 p-8 border border-white/50 shadow-lg">
                                            <div className="flex items-center gap-3 mb-6">
                                              <div className="w-8 h-8 bg-[#1E3786] rounded-md flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-white" />
                                              </div>
                                              <h4 className="text-xl font-bold text-gray-900">
                                                Add New Skill
                                              </h4>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Skill Name
                                                </label>
                                                <Input
                                                  placeholder="e.g., JavaScript"
                                                  value={state.skill || ""}
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "skill",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              {/* <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Experience
                                                </label>
                                                <Input
                                                  placeholder="e.g., 3 years"
                                                  value={state.skillForm.experience}
                                                  onChange={(e) =>
                                                    setState({
                                                      skillForm: {
                                                        ...state.skillForm,
                                                        experience: e.target.value,
                                                      },
                                                    })
                                                  }
                                                  className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                                                />
                                              </div> */}
                                            </div>

                                            <div className="flex gap-3">
                                              <Button
                                                onClick={addSkill}
                                                // onClick={() => {
                                                //   if (
                                                //     state.userDetail?.skills?.length === 0
                                                //   ) {
                                                //     addSkill();
                                                //   } else {
                                                //     updateSkill();
                                                //   }
                                                // }}
                                                className="bg-[#1E3786] hover:bg-[#1E3786]"
                                              >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Save Skill
                                              </Button>
                                              <Button
                                                variant="outline"
                                                onClick={() =>
                                                  setState({
                                                    isEditingSkills: false,
                                                  })
                                                }
                                                className="border-gray-300 hover:bg-gray-50"
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Skills List - Chip Format */}
                                    <div className="flex flex-wrap gap-3 pt-5">
                                      {state?.userDetail?.skills?.map(
                                        (skill, index) => (
                                          <motion.div
                                            key={skill.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group relative"
                                          >
                                            <div className="bg-gradient-to-r from-[#3b82f6]/10 to-blue-100 hover:from-[#3b82f6]/20 hover:to-blue-200 border border-[#3b82f6]/30 rounded-full px-4 py-1 flex items-center gap-2 transition-all duration-300 hover:shadow-lg group-hover:scale-105">
                                              <span className="text-[#1E3786] font-medium text-sm">
                                                {skill.name}
                                              </span>
                                              {/* <span className="text-purple-600 text-xs bg-white/100 px-2 py-0.5 rounded-full">
                                              {skill.experience}
                                            </span> */}
                                              <div className="flex gap-1  group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                  onClick={() =>
                                                    deleteSkill(skill.id)
                                                  }
                                                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-white/100"
                                                >
                                                  <X className="w-3 h-3  font-semibold" />
                                                </button>
                                              </div>
                                            </div>
                                          </motion.div>
                                        ),
                                      )}
                                    </div>

                                    {/* Empty State */}
                                    {(state.userDetail?.skills?.length === 0 ||
                                      !state.userDetail?.skills?.length) && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8"
                                      >
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6]/20 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                          <Code className="w-8 h-8 text-[#1E3786]/60" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                          No Skills Added
                                        </h4>
                                        <p className="text-gray-500 mb-4">
                                          Add your technical skills as chips
                                        </p>
                                        <Button
                                          onClick={() =>
                                            setState({
                                              isEditingSkills: true,
                                              skill: "",
                                            })
                                          }
                                          className="bg-[#1E3786] hover:bg-[#1E3786]"
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Add Skills
                                        </Button>
                                      </motion.div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>

                          {/* Achievements Section */}
                          <Card
                            id="achievements-section"
                            className="!rounded-none bg-clr2 border shadow-none overflow-hidden relative"
                          >
                            {/* <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#3b82f6]/20 to-[#3b82f6]/20 rounded-full blur-2xl"></div> */}

                            <CardContent className="relative py-4 px-2">
                              <div
                                className="flex items-center justify-between  cursor-pointer"
                                onClick={() => toggleSection("achievements")}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg transform ">
                                    <Award className="w-4 h-4 text-white transform " />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold bg-[#1E3786] bg-clip-text text-transparent">
                                      Achievements & Awards
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      Your recognitions and honors
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setState({
                                        isCreateAchievements: true,
                                        achievement_title: "",
                                        organization: "",
                                        achievement_file: null,
                                        achievement_description: "",
                                        expandedSections: {
                                          ...state.expandedSections,
                                          achievements: true,
                                        },
                                      });
                                    }}
                                    className="w-8 h-8 bg-[#1E3786]  text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSection("achievements");
                                    }}
                                    className="cursor-pointer"
                                  >
                                    {state.expandedSections.achievements ? (
                                      <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                  </span>
                                </div>
                              </div>

                              <AnimatePresence>
                                {state.expandedSections.achievements && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {/* Add Achievement Form */}
                                    <AnimatePresence>
                                      {state.isCreateAchievements && (
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                            y: 0,
                                          }}
                                          exit={{
                                            opacity: 0,
                                            height: 0,
                                            y: -20,
                                          }}
                                          transition={{
                                            duration: 0.3,
                                            ease: "easeOut",
                                          }}
                                          className="mb-8 relative"
                                        >
                                          <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/10 to-blue-500/10 rounded-3xl blur-sm"></div>
                                          <div className="relative bg-white/80 rounded-lg p-8 mt-5 border border-white/50 shadow-xl">
                                            <div className="flex items-center gap-3 mb-6">
                                              <div className="w-8 h-8 bg-[#1E3786] rounded-md flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-white" />
                                              </div>
                                              <h4 className="text-xl font-bold text-gray-900">
                                                Add New Achievement
                                              </h4>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Achievement Title
                                                </label>
                                                <Input
                                                  placeholder="e.g., Employee of the Year"
                                                  value={
                                                    state.achievement_title ||
                                                    ""
                                                  }
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "achievement_title",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Organization
                                                </label>
                                                <Input
                                                  placeholder="e.g., Tech Solutions Inc"
                                                  value={
                                                    state.organization || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleFormChange(
                                                      "organization",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                />
                                              </div>

                                              <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                  Achievement File (PDF)
                                                </label>

                                                <div className="flex items-center gap-3">
                                                  <Input
                                                    type="file"
                                                    accept="pdf/*"
                                                    onChange={(e) => {
                                                      const file =
                                                        e.target.files?.[0];
                                                      if (file) {
                                                        setState({
                                                          achievement_file:
                                                            file,
                                                          achievement_file_preview:
                                                            URL.createObjectURL(
                                                              file,
                                                            ),
                                                        });
                                                      }
                                                    }}
                                                    className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                                  />
                                                  <Upload className="w-5 h-5 text-gray-400" />
                                                </div>
                                              </div>
                                            </div>

                                            <div className="space-y-2 mb-6">
                                              <label className="text-sm font-semibold text-gray-700">
                                                Description
                                              </label>
                                              <Textarea
                                                placeholder="Describe your achievement and its significance..."
                                                value={
                                                  state.achievement_description ||
                                                  ""
                                                }
                                                onChange={(e) =>
                                                  setState({
                                                    ...state,
                                                    achievement_description:
                                                      e.target.value,
                                                  })
                                                }
                                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6] min-h-[100px]"
                                              />
                                            </div>

                                            <div className="flex gap-3">
                                              <Button
                                                onClick={addAchievement}
                                                className="bg-[#1E3786] hover:bg-[#1E3786] text-white shadow-lg"
                                              >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Save Achievement
                                              </Button>
                                              <Button
                                                variant="outline"
                                                onClick={() =>
                                                  setState({
                                                    isCreateAchievements: false,
                                                  })
                                                }
                                                className="border-gray-300 hover:bg-gray-50"
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Achievements List */}
                                    <div className="space-y-4 pt-5">
                                      {state.userDetail?.achievements?.map(
                                        (achievement, index) => (
                                          <motion.div
                                            key={achievement.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="relative group"
                                          >
                                            {/* <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/5 to-blue-500/5 rounded-3xl blur-sm group-hover:from-[#3b82f6]/10 group-hover:to-blue-500/10 transition-all duration-300"></div> */}
                                            <div className="relative bg-white/70 rounded-lg p-6 border ">
                                              <div className="flex items-start gap-6">
                                                {/* Achievement Icon */}
                                                <div className="flex-shrink-0">
                                                  <div className="w-10 h-10 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    <Award className="w-4 h-4 text-white" />
                                                  </div>
                                                </div>

                                                {/* Achievement Details */}
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-start justify-between md:mb-1">
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2">
                                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                                                          {
                                                            achievement.achievement_title
                                                          }
                                                        </h4>
                                                      </div>
                                                      <p className="text-md font-semibold text-[#1E3786] mb-1">
                                                        {
                                                          achievement.organization
                                                        }
                                                      </p>
                                                    </div>

                                                    {/* Desktop Action Buttons - Top Right */}
                                                    <div className="hidden md:flex gap-2">
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="hover:bg-[#1E3786]/10 border-[#3b82f6]/30 group/btn"
                                                        onClick={() => {
                                                          setState({
                                                            isEditingAchievements: true,
                                                            achievement_title:
                                                              achievement.achievement_title,
                                                            organization:
                                                              achievement.organization,
                                                            achievement_file:
                                                              achievement.achievement_file_url,
                                                            achievement_description:
                                                              achievement.achievement_description,
                                                            achievement_id:
                                                              achievement.id,
                                                          });
                                                        }}
                                                      >
                                                        <Edit className="w-4 h-4 text-[#1E3786] group-hover/btn:scale-110 transition-transform" />
                                                      </Button>
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                          deleteAchievement(
                                                            achievement.id,
                                                          )
                                                        }
                                                        className="hover:bg-red-50 border-red-200 group/btn"
                                                      >
                                                        <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:scale-110 transition-transform" />
                                                      </Button>
                                                    </div>
                                                  </div>

                                                  {/* Achievement Description */}
                                                  {achievement.achievement_description && (
                                                    <div className="bg-white rounded-lg p-4 border">
                                                      <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                                                        {expandedAchievementDesc[
                                                          achievement.id
                                                        ]
                                                          ? achievement.achievement_description
                                                          : achievement.achievement_description?.slice(
                                                              0,
                                                              280,
                                                            )}
                                                        {!expandedAchievementDesc[
                                                          achievement.id
                                                        ] &&
                                                          achievement
                                                            .achievement_description
                                                            ?.length > 280 &&
                                                          "..."}
                                                        {achievement.achievement_description &&
                                                          achievement
                                                            .achievement_description
                                                            .length > 280 && (
                                                            <button
                                                              onClick={() =>
                                                                setExpandedAchievementDesc(
                                                                  (prev) => ({
                                                                    ...prev,
                                                                    [achievement.id]:
                                                                      !prev[
                                                                        achievement
                                                                          .id
                                                                      ],
                                                                  }),
                                                                )
                                                              }
                                                              className="text-blue-600 text-sm font-medium hover:underline ml-1"
                                                            >
                                                              {expandedAchievementDesc[
                                                                achievement.id
                                                              ]
                                                                ? "Read Less"
                                                                : "Read More"}
                                                            </button>
                                                          )}
                                                      </p>

                                                      {achievement.achievement_file_url && (
                                                        <a
                                                          className="flex items-center text-gray-700 leading-relaxed text-sm"
                                                          href={
                                                            achievement.achievement_file_url
                                                          }
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                        >
                                                          {" "}
                                                          View file
                                                          <File className="w-3 h-3 ml-2" />
                                                        </a>
                                                      )}
                                                    </div>
                                                  )}

                                                  {/* Mobile Action Buttons - Bottom Right */}
                                                  <div className="flex md:hidden justify-end gap-2 mt-4">
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      className="hover:bg-[#1E3786]/10 border-[#3b82f6]/30 group/btn"
                                                      onClick={() => {
                                                        setState({
                                                          isEditingAchievements: true,
                                                          achievement_title:
                                                            achievement.achievement_title,
                                                          organization:
                                                            achievement.organization,
                                                          achievement_file:
                                                            achievement.achievement_file_url,
                                                          achievement_description:
                                                            achievement.achievement_description,
                                                          achievement_id:
                                                            achievement.id,
                                                        });
                                                      }}
                                                    >
                                                      <Edit className="w-4 h-4 text-[#1E3786] group-hover/btn:scale-110 transition-transform" />
                                                    </Button>
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() =>
                                                        deleteAchievement(
                                                          achievement.id,
                                                        )
                                                      }
                                                      className="hover:bg-red-50 border-red-200 group/btn"
                                                    >
                                                      <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:scale-110 transition-transform" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </motion.div>
                                        ),
                                      )}
                                    </div>

                                    {/* Empty State */}
                                    {(state.userDetail?.achievements?.length ===
                                      0 ||
                                      !state.userDetail?.achievements) && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12"
                                      >
                                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <Award className="w-12 h-12 text-[#1E3786]/60" />
                                        </div>
                                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                          No Achievements Added
                                        </h4>
                                        <p className="text-gray-500 mb-6">
                                          Showcase your awards and recognitions
                                        </p>
                                        <Button
                                          onClick={() =>
                                            setState({
                                              isCreateAchievements: true,
                                              achievement_title: "",
                                              organization: "",
                                              achievement_file: null,
                                              achievement_description: "",
                                            })
                                          }
                                          className="bg-[#1E3786] hover:bg-[#1E3786]"
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Add Your First Achievement
                                        </Button>
                                      </motion.div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ) : state.activeTab == "Qualifications" ? (
                      <div className="space-y-2 pt-1">
                        <Card className="!rounded-none bg-clr2 border shadow-none">
                          <CardContent className="px-3 py-6">
                            <div className="flex flex-wrap md:flex-nowrap md:justify-between">
                              <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg transform ">
                                  <GraduationCap className="w-6 h-6 text-white transform " />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold bg-[#1E3786] bg-clip-text text-transparent">
                                    Academic Qualifications
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    Highlight your completed examinations and
                                    degrees
                                  </p>
                                </div>
                              </div>

                              <div className=" flex justify-end hidden md:block ">
                                <Button
                                  onClick={() => menusUpdate("qualification")}
                                  className="bg-[#1E3786] hover:bg-[#1E3786]/90 text-white shadow-lg px-8 py-2 h-fit text-sm font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Save Qualifications
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 !gap-3">
                              {[
                                {
                                  id: "phd",
                                  label: "PhD Completed",
                                  desc: "Doctor of Philosophy",
                                  state: state.phd_completed,
                                  key: "phd_completed",
                                },
                                {
                                  id: "net",
                                  label: "NET Cleared",
                                  desc: "National Eligibility Test",
                                  state: state.net_cleared,
                                  key: "net_cleared",
                                },
                                {
                                  id: "set",
                                  label: "SET Cleared",
                                  desc: "State Eligibility Test",
                                  state: state.set_cleared,
                                  key: "set_cleared",
                                },
                                {
                                  id: "slet",
                                  label: "SLET Cleared",
                                  desc: "State Level Eligibility Test",
                                  state: state.slet_cleared,
                                  key: "slet_cleared",
                                },
                              ].map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() =>
                                    handleFormChange(item.key, !item.state)
                                  }
                                  className={`relative group cursor-pointer border rounded-md p-4 transition-all duration-300 ${
                                    item.state
                                      ? "border-[#1E3786] bg-[#1E3786]/5 shadow-md"
                                      : "border-gray-200 bg-white hover:border-[#1E3786]/50 hover:shadow-sm"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                          item.state
                                            ? "bg-[#1E3786] border-[#1E3786]"
                                            : "border-gray-300 bg-white group-hover:border-[#1E3786]/50"
                                        }`}
                                      >
                                        {item.state && (
                                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                                        )}
                                      </div>
                                      <div>
                                        <h4
                                          className={`font-semibold ${
                                            item.state
                                              ? "text-[#1E3786]"
                                              : "text-gray-700"
                                          }`}
                                        >
                                          {item.label}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                          {item.desc}
                                        </p>
                                      </div>
                                    </div>
                                    {item.state && (
                                      <div className="text-[#1E3786] bg-white rounded-full p-1 shadow-sm">
                                        <Award className="w-4 h-4" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className=" flex block md:hidden mt-4">
                              <Button
                                onClick={() => menusUpdate("qualification")}
                                className="bg-[#1E3786] hover:bg-[#1E3786]/90 text-white shadow-lg px-8 py-2 h-auto text-sm font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Save Qualifications
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : state.activeTab == "Preferrences" ? (
                      <div className="space-y-4 pt-1">
                        <Card className="!rounded-none bg-clr2 border shadow-none">
                          <CardContent className="py-6 px-3">
                            <div className="flex flex-wrap md:flex-nowrap md:justify-between">
                              <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-[#1E3786] rounded-md flex items-center justify-center shadow-lg transform ">
                                  <Briefcase className="w-6 h-6 text-white transform " />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold bg-[#1E3786] bg-clip-text text-transparent  ">
                                    Job Preferences
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    Manage your job seeking status and
                                    preferences
                                  </p>
                                </div>
                              </div>

                              <div className="flex hidden md:block">
                                <Button
                                  onClick={() => menusUpdate("pref")}
                                  className="h-fit bg-[#1E3786] hover:bg-[#1E3786]/90 text-white shadow-lg px-8 py-2 text-sm font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Update Preferences
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                              {[
                                {
                                  id: "job",
                                  label: "Active Job Seeker",
                                  desc: "Actively looking for jobs",
                                  state: state.active_job_seeker,
                                  key: "active_job_seeker",
                                  icon: User,
                                },
                                {
                                  id: "Reveal",
                                  label: "Reveal Name",
                                  desc: "Show name to recruiters",
                                  state: state.reveal_name,
                                  key: "reveal_name",
                                  icon: Award,
                                },
                                {
                                  id: "News",
                                  label: "Subscribe Newsletter",
                                  desc: "Receive updates & news",
                                  state: state.newsletter,
                                  key: "newsletter",
                                  icon: Mail,
                                },
                              ].map((item) => (
                                <div
                                  key={item.id}
                                  onClick={async () => {
                                    if (item.key === "reveal_name") {
                                      const result = await Swal.fire({
                                        title: item.state ? "Hide Your Name?" : "Reveal Your Name?",
                                        text: item.state
                                          ? "Your name will be hidden from recruiters."
                                          : "Your name will be visible to recruiters.",
                                        icon: "question",
                                        showCancelButton: true,
                                        confirmButtonColor: "#1E3786",
                                        cancelButtonColor: "#6b7280",
                                        confirmButtonText: "Yes, confirm",
                                        background: "#fff",
      width: "360px",
      didOpen: (popup) => { popup.style.padding = "20px"; popup.style.width = "340px"; const icon = popup.querySelector(".swal2-icon") as HTMLElement; if (icon) { icon.style.width = "50px"; icon.style.height = "50px"; icon.style.margin = "0 auto 8px"; } const title = popup.querySelector(".swal2-title") as HTMLElement; if (title) { title.style.fontSize = "15px"; title.style.padding = "0"; } const content = popup.querySelector(".swal2-html-container") as HTMLElement; if (content) { content.style.fontSize = "13px"; content.style.margin = "4px 0 0"; } const actions = popup.querySelector(".swal2-actions") as HTMLElement; if (actions) { actions.style.marginTop = "16px"; } const confirmBtn = popup.querySelector(".swal2-confirm") as HTMLElement; if (confirmBtn) { confirmBtn.style.fontSize = "13px"; confirmBtn.style.padding = "6px 16px"; confirmBtn.style.borderRadius = "999px"; } const cancelBtn = popup.querySelector(".swal2-cancel") as HTMLElement; if (cancelBtn) { cancelBtn.style.fontSize = "13px"; cancelBtn.style.padding = "6px 16px"; cancelBtn.style.borderRadius = "999px"; } },
                                      });
                                      if (!result.isConfirmed) return;
                                    }
                                    handleFormChange(item.key, !item.state);
                                  }}
                                  className={`relative overflow-hidden cursor-pointer border rounded-md p-5 transition-all duration-300 ${
                                    item.state
                                      ? "border-[#1E3786] bg-gradient-to-br from-[#1E3786]/5 to-[#1E3786]/10 shadow-md transform scale-[1.02]"
                                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div
                                      className={`p-2.5 rounded-md ${
                                        item.state
                                          ? "bg-[#1E3786] text-white"
                                          : "bg-gray-100 text-gray-500"
                                      }`}
                                    >
                                      <item.icon className="w-5 h-5" />
                                    </div>
                                    <div
                                      className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${
                                        item.state
                                          ? "bg-[#1E3786] justify-end"
                                          : "bg-gray-300 justify-start"
                                      }`}
                                    >
                                      <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                    </div>
                                  </div>
                                  <h4 className="font-bold text-gray-900 text-base mb-1">
                                    {item.label}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {item.desc}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-1 gap-6 mb-4">
                              <div className="bg-white p-5 rounded-md border  space-y-6">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-[#1E3786] rounded-full"></div>
                                    <h5 className="font-semibold text-gray-900">
                                      Location & Institute Preferences
                                    </h5>
                                  </div>
                                  <CustomMultiSelect
                                    title="Preferred Colleges"
                                    placeholder="Select colleges..."
                                    className="border border-gray-200"
                                    options={state.collegeList}
                                    value={state?.preferred_colleges || []}
                                    onChange={(selected) => {
                                      console.log("✌️selected --->", selected);
                                      setState({
                                        preferred_colleges: selected,
                                      });
                                    }}
                                    loadOptions={collegeList}
                                    hasMore={state.collegeHasMore}
                                    isLoading={state.collegeLoading}
                                    isMulti={true}
                                  />

                                  <CustomMultiSelect
                                    title="Preferred Locations"
                                    placeholder="Select locations..."
                                    className="border border-gray-200"
                                    options={state.locationList}
                                    value={state?.preferred_locations || []}
                                    onChange={(selected) => {
                                      console.log("✌️selected --->", selected);
                                      setState({
                                        preferred_locations: selected,
                                      });
                                    }}
                                    loadOptions={locationList}
                                    hasMore={state.locationHasMore}
                                    isLoading={state.locationLoading}
                                    isMulti={true}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex block md:hidden">
                              <Button
                                onClick={() => menusUpdate("pref")}
                                className="bg-[#1E3786] hover:bg-[#1E3786]/90 text-white shadow-lg px-8 py-2 h-auto text-sm font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Update Preferences
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : state.activeTab == "My Applications" ? (
                      <>
                        {/* Status Filter Chips */}
                        {state.applicationStatuses?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            <button
                              onClick={() => {
                                setState({ selectedStatus: "", page: 1 });
                                appliedJobList(1, false, "");
                              }}
                              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                !state.selectedStatus
                                  ? "bg-[#1E3786] text-white border-[#1E3786]"
                                  : "bg-white text-gray-600 border-gray-300 hover:border-[#1E3786] hover:text-[#1E3786]"
                              }`}
                            >
                              All
                            </button>
                            {state.applicationStatuses.map((s: any) => (
                              <button
                                key={s.id}
                                onClick={() => {
                                  setState({ selectedStatus: s.id, page: 1 });
                                  appliedJobList(1, false, s.id);
                                }}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                  state.selectedStatus === s.id
                                    ? "bg-[#1E3786] text-white border-[#1E3786]"
                                    : "bg-white text-gray-600 border-gray-300 hover:border-[#1E3786] hover:text-[#1E3786]"
                                }`}
                              >
                                {s.name}
                              </button>
                            ))}
                          </div>
                        )}
                      {state.jobList?.length > 0 ? (
                        <>
                        <div
                          className={`grid  ${
                            !state.isGridView
                              ? "grid-cols-1 xl:grid-cols-2"
                              : "grid-cols-1"
                          } ${
                            state.isGridView &&
                            "bg-white px-5 border border-[#c7c7c787]"
                          }`}
                          style={{
                            gap: "10px",
                          }}
                        >
                          {/* {filteredJobs.map((job) => ( */}
                          {state.jobList?.map((job: any,index:number) => (
                            <div
                              key={index}
                              className="cursor-pointer transition-transform hover:scale-10 job-card-item"
                            >
                              {!state.isGridView ? (
                                <JobCard
                                  job={job}
                                  updateList={() => appliedJobList(state?.page)}
                                  onCollegeClick={(e, id) =>
                                    getCollege(e, id)
                                  }
                                  onDepartmentClick={(e, id) =>
                                    console.log("first")
                                  }
                                  isProfile={true}
                                  onClick={() =>
                                    router.push(`/jobs?slug=${job?.slug}`)
                                  }
                                />
                              ) : (
                                <NewJobCard
                                  job={job}
                                  updateList={() => appliedJobList(state?.page)}
                                  onCollegeClick={(e, id) =>
                                    getCollege(e, id)
                                  }
                                  onDepartmentClick={(e, id) =>
                                    console.log("first")
                                  }
                                  isProfile={true}
                                  onClick={() =>
                                    router.push(`/jobs?slug=${job?.slug}`)
                                  }
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        {state.appliedNext && (
                          <div className="grid grid-cols-1 xl:grid-cols-2 mt-2" style={{ gap: "10px" }}>
                            {Array.from({ length: 2 }).map((_, i) => (
                              <div key={i} className="bg-white p-6 rounded-lg border border-[#c7c7c787]">
                                <div className="flex gap-4 mb-4">
                                  <SkeletonLoader type="circle" width={48} height={48} />
                                  <div className="flex-1">
                                    <SkeletonLoader type="text" width="60%" height={20} style={{ marginBottom: 8 }} />
                                    <SkeletonLoader type="text" width="40%" height={16} />
                                  </div>
                                </div>
                                <div className="flex gap-2 mb-4">
                                  <SkeletonLoader type="rect" width={80} height={24} className="rounded-full" />
                                  <SkeletonLoader type="rect" width={80} height={24} className="rounded-full" />
                                </div>
                                <SkeletonLoader type="text" width="100%" />
                                <SkeletonLoader type="text" width="80%" />
                              </div>
                            ))}
                          </div>
                        )}
                        </>
                      ) : (
                        <Card className="bg-white border-2   border-dashed border-gray-200 shadow-none rounded-md">
                          <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                              <Mail className="w-10 h-10 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              No Jobs Found 
                            </h4>
                            <Button
                              onClick={() => router.push("/jobs")}
                              className="mt-5 bg-[#1E3786] hover:bg-[#1E3786]"
                            >
                              Go to Job List
                              <ArrowRight className="w-4 h-4 mr-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                      </>
                    ) : state.activeTab == "Saved Jobs" ? (
                      state?.savedJobList?.length > 0 ? (
                        <>
                        <div
                          className={`grid  ${
                            !state.isGridView
                              ? "grid-cols-1 xl:grid-cols-2"
                              : "grid-cols-1"
                          } ${
                            state.isGridView &&
                            "bg-white px-5 border border-[#c7c7c787]"
                          }`}
                          style={{
                            gap: "10px",
                          }}
                        >
                          {/* {filteredJobs.map((job) => ( */}
                          {state.savedJobList?.map((job: any) => (
                            <div
                              key={job.id}
                              className="cursor-pointer transition-transform hover:scale-10 job-card-item"
                            >
                              <JobCard
                                job={job?.job}
                                updateList={() => getSavedJobs(state?.page)}
                                onCollegeClick={(e, id) => getCollege(e, id)}
                                onDepartmentClick={(e, id) =>
                                  console.log("first")
                                }
                                onClick={() =>
                                    router.push(`/jobs?slug=${job?.job?.slug || job?.slug}`)
                                }
                              />
                            </div>
                          ))}
                        </div>
                        {state.savedNext && (
                          <div className="grid grid-cols-1 xl:grid-cols-2 mt-2" style={{ gap: "10px" }}>
                            {Array.from({ length: 2 }).map((_, i) => (
                              <div key={i} className="bg-white p-6 rounded-lg border border-[#c7c7c787]">
                                <div className="flex gap-4 mb-4">
                                  <SkeletonLoader type="circle" width={48} height={48} />
                                  <div className="flex-1">
                                    <SkeletonLoader type="text" width="60%" height={20} style={{ marginBottom: 8 }} />
                                    <SkeletonLoader type="text" width="40%" height={16} />
                                  </div>
                                </div>
                                <div className="flex gap-2 mb-4">
                                  <SkeletonLoader type="rect" width={80} height={24} className="rounded-full" />
                                  <SkeletonLoader type="rect" width={80} height={24} className="rounded-full" />
                                </div>
                                <SkeletonLoader type="text" width="100%" />
                                <SkeletonLoader type="text" width="80%" />
                              </div>
                            ))}
                          </div>
                        )}
                        </>
                      ) : (
                        <Card className="bg-white border-2 border-dashed border-gray-200 shadow-none rounded-md">
                          <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                              <Mail className="w-10 h-10 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              No Saved Job Yet
                            </h4>
                            <Button
                              onClick={() => router.push("/jobs")}
                              className="mt-5 bg-[#1E3786] hover:bg-[#1E3786]"
                            >
                              Go to Job List
                              <ArrowRight className="w-4 h-4 mr-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    ) : state.activeTab == "HR Requests" ? (
                      <div className="space-y-4 pt-1">
                        {/* <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            Recruiter Requests
                          </h3>
                          <span className="bg-[#1E3786]/10 text-[#1E3786] px-3 py-1 rounded-full text-sm font-medium border border-[#1E3786]/20">
                            {state.userDetail?.interesteds?.length || 0} Pending
                          </span>
                        </div> */}

                        {state.userDetail?.interesteds?.length > 0 ? (
                          <>
                            {/* Desktop: DataTable - shown above lg breakpoint */}
                            <div className="hidden lg:block">
                              <HrRequestTable
                                invites={state.userDetail.interesteds}
                                onSubmit={(type, invite) =>
                                  updateInviteStatus(type, invite)
                                }
                                btnLoading={state.btnLoading}
                              />
                            </div>
                            {/* Mobile: InviteCard - shown below lg breakpoint */}
                            <div className="flex flex-col gap-4 lg:hidden">
                              {state.userDetail.interesteds.map((invite) => (
                                <InviteCard
                                  key={invite.id}
                                  invite={invite}
                                  submit={(type) =>
                                    updateInviteStatus(type, invite)
                                  }
                                  btnLoading={state.btnLoading}
                                />
                              ))}
                            </div>
                          </>
                        ) : (
                          <Card className="bg-white border-2 border-dashed border-gray-200 shadow-none rounded-md">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Mail className="w-10 h-10 text-gray-400" />
                              </div>
                              <h4 className="text-lg font-bold text-gray-900 mb-1">
                                No Requests Yet
                              </h4>
                              <p className="text-gray-500 text-center max-w-sm">
                                You haven&apos;t received any contact requests
                                from recruiters. Keep your profile updated to
                                attract more opportunities!
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
                {/* Edit Profile Modal */}
                <AnimatePresence>
                  {state.isEditingProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                      >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                          <h2 className="text-xl font-bold text-gray-900">
                            Edit Profile
                          </h2>
                          <button
                            onClick={() =>
                              setState({ isEditingProfile: false })
                            }
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>

                        <div className="p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Profile Photo
                              </label>
                              <div className="flex items-center gap-3">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setState({
                                        profile_logo: file,
                                        profile_logo_preview:
                                          URL.createObjectURL(file),
                                      });
                                    }
                                  }}
                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                />
                                <Upload className="w-5 h-5 text-gray-400" />
                              </div>
                              {state.profile_logo_preview && (
                                <div className="mt-3">
                                  <img
                                    src={state.profile_logo_preview}
                                    alt="Profile Preview"
                                    className="w-20 h-20 rounded-full object-cover border border-gray-200"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Input
                                title="First Name"
                                value={state.first_name}
                                required
                                onChange={(e) =>
                                  handleFormChange("first_name", e.target.value)
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                error={state?.errors?.first_name}
                              />
                            </div>

                            <div className="space-y-2">
                              <Input
                                title="Last Name"
                                required
                                value={state.last_name}
                                onChange={(e) =>
                                  handleFormChange("last_name", e.target.value)
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                error={state?.errors?.last_name}
                              />
                            </div>
                            <div className="space-y-2">
                              <Input
                                title="Email"
                                required
                                value={state.email}
                                onChange={(e) =>
                                  handleFormChange("email", e.target.value)
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                error={state?.errors?.email}
                              />
                            </div>

                            <div className="space-y-2">
                              <CustomPhoneInput
                                title="Phone"
                                required
                                value={state.phone}
                                onChange={(e) =>
                                  handleFormChange("phone", e)
                                }
                                error={state?.errors?.phone}
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>

                            <div className="space-y-2">
                              <Input
                                title="Gender"
                                required
                                value={state.gender}
                                onChange={(e) =>
                                  handleFormChange("gender", e.target.value)
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                error={state?.errors?.gender}
                              />
                            </div>
                            <div className="space-y-2">
                              <CustomSelect
                                title="Experience"
                                required
                                className="border border-gray-200 "
                                options={state.experienceList}
                                value={state?.experience || ""}
                                onChange={(selected) =>
                                  setState({
                                    ...state,
                                    experience: selected ? selected.value : "",
                                  })
                                }
                                error={state?.errors?.experience}
                                // placeholder="Experience"
                              />
                            </div>

                            <div className="space-y-2">
                              <Input
                                title=" Current College"
                                value={state.current_company}
                                onChange={(e) =>
                                  handleFormChange(
                                    "current_company",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>

                            <div className="space-y-2">
                              <Input
                                title="Current Position"
                                value={state.current_position}
                                onChange={(e) =>
                                  handleFormChange(
                                    "current_position",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>

                            <div className="space-y-2">
                              <Input
                                title="Location"
                                required
                                value={state.current_location}
                                onChange={(e) =>
                                  handleFormChange(
                                    "current_location",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                error={state?.errors?.current_location}
                              />
                            </div>

                            <div className="space-y-2">
                              <TextArea
                                title="Short Description"
                                value={state.short_desc}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val.length <= 180) {
                                    handleFormChange("short_desc", val);
                                  }
                                }}
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                error={state?.errors?.short_desc}
                              />
                              <p className={`text-xs text-right ${ (state.short_desc?.length || 0) >= 180 ? "text-red-500" : "text-gray-400" }`}>
                                {state.short_desc?.length || 0}/180
                              </p>
                            </div>

                            <div className="space-y-2">
                              <CustomSelect
                                title="Department"
                                className="border border-gray-200"
                                options={state.masterDeptList || []}
                                value={state?.department || ""}
                                onChange={(selected) =>
                                  handleFormChange(
                                    "department",
                                    selected ? selected.value : "",
                                  )
                                }
                              />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={state.newsletter || false}
                                  onChange={(e) =>
                                    handleFormChange(
                                      "newsletter",
                                      e.target.checked,
                                    )
                                  }
                                />
                                <span className="text-gray-600 text-sm">
                                  Accept to receive newsletter
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setState({ isEditingProfile: false })
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={profileUpdate}
                            className="bg-[#1E3786] "
                          >
                            Update
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {state.isEditingExperience && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                      >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                          <h2 className="text-xl font-bold text-gray-900">
                            Edit Experience
                          </h2>
                          <button
                            onClick={() =>
                              setState({ isEditingExperience: false })
                            }
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>

                        <div className="p-4 space-y-4">
                          <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                College Name
                              </label>
                              <Input
                                placeholder="e.g., Google Inc."
                                value={state.company || ""}
                                onChange={(e) =>
                                  handleFormChange("company", e.target.value)
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Job Title
                              </label>
                              <Input
                                placeholder="e.g., Senior Software Engineer"
                                value={state.designation || ""}
                                onChange={(e) =>
                                  handleFormChange(
                                    "designation",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>

                            <div className="space-y-2">
                              <DatePicker
                                placeholder="Start Date"
                                title="Start Date"
                                closeIcon={true}
                                selectedDate={state.start_date}
                                onChange={(date) => {
                                  setState({
                                    start_date: date,
                                  });
                                }}
                                toDate={new Date()}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="is_present_edit"
                                checked={state.is_present || false}
                                onChange={(e) =>
                                  setState({
                                    is_present: e.target.checked,
                                    end_date: e.target.checked
                                      ? null
                                      : state.end_date || null,
                                  })
                                }
                                className="h-4 w-4 rounded border-gray-300 text-[#1E3786]"
                              />
                              <label
                                htmlFor="is_present_edit"
                                className="text-sm font-semibold text-gray-700"
                              >
                                Present (Currently working here)
                              </label>
                            </div>

                            {!state.is_present && (
                              <div className="space-y-2">
                                <DatePicker
                                  placeholder="End Date"
                                  title="End Date"
                                  closeIcon={true}
                                  selectedDate={state.end_date}
                                  onChange={(date) => {
                                    setState({ end_date: date });
                                  }}
                                  fromDate={
                                    state.start_date
                                      ? new Date(state.start_date)
                                      : undefined
                                  }
                                  toDate={new Date()}
                                />
                              </div>
                            )}

                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Job Description
                              </label>
                              <Textarea
                                placeholder="Describe your key responsibilities and achievements..."
                                value={state.job_description}
                                onChange={(e) =>
                                  handleFormChange(
                                    "job_description",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6] min-h-[100px]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setState({ isEditingExperience: false })
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={updateEmployment}
                            className="bg-[#1E3786] "
                          >
                            Update
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {state.isEditingEducation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                      >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                          <h2 className="text-xl font-bold text-gray-900">
                            Edit Education
                          </h2>
                          <button
                            onClick={() =>
                              setState({ isEditingEducation: false })
                            }
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>

                        <div className="p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Institution Name
                              </label>
                              <Input
                                placeholder="e.g., Harvard University"
                                value={state.institution || ""}
                                onChange={(e) =>
                                  handleFormChange(
                                    "institution",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Degree
                              </label>
                              <Input
                                placeholder="e.g., Bachelor of Technology"
                                value={state.degree || ""}
                                onChange={(e) =>
                                  handleFormChange("degree", e.target.value)
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Field of Study
                              </label>
                              <Input
                                placeholder="e.g., Computer Science"
                                value={state.field || ""}
                                onChange={(e) =>
                                  handleFormChange("field", e.target.value)
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Grade/CGPA
                              </label>
                              <Input
                                placeholder="e.g., 8.5 CGPA"
                                value={state.cgpa || ""}
                                onChange={(e) =>
                                  handleFormChange("cgpa", e.target.value)
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Start Year
                              </label>
                              <Input
                                placeholder="e.g., 2016"
                                value={state.start_year || ""}
                                onKeyDown={onlyNumbers}
                                onChange={(e) =>
                                  handleFormChange("start_year", numericString(e.target.value))
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                End Year
                              </label>
                              <Input
                                placeholder="e.g., 2020"
                                value={state.end_year || ""}
                                onKeyDown={onlyNumbers}
                                onChange={(e) =>
                                  handleFormChange("end_year", numericString(e.target.value))
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setState({ isEditingEducation: false })
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={updateEducation}
                            className="bg-[#1E3786] "
                          >
                            Update
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {state.isEditingProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                      >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                          <h2 className="text-xl font-bold text-gray-900">
                            Edit Project
                          </h2>
                          <button
                            onClick={() =>
                              setState({ isEditingProject: false })
                            }
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>

                        <div className="p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Project Title
                              </label>
                              <Input
                                placeholder="e.g., E-Commerce Platform"
                                value={state.project_title || ""}
                                onChange={(e) =>
                                  handleFormChange(
                                    "project_title",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Duration
                              </label>
                              <Input
                                placeholder="e.g., 3 months"
                                value={state.duration || ""}
                                onChange={(e) =>
                                  handleFormChange("duration", e.target.value)
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Status
                              </label>
                              <Input
                                placeholder="e.g., Completed"
                                value={state.status || ""}
                                onChange={(e) =>
                                  handleFormChange("status", e.target.value)
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Project Link
                              </label>
                              <Input
                                placeholder="e.g., https://github.com/username/project"
                                value={state.project_link || ""}
                                onChange={(e) =>
                                  handleFormChange(
                                    "project_link",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2 flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="funded-edit"
                                className="h-4 w-4 rounded border-gray-300 text-[#1E3786] focus:ring-[#3b82f6]"
                                checked={state.funded}
                                onChange={(e) =>
                                  handleFormChange("funded", e.target.checked)
                                }
                              />
                              <label
                                htmlFor="funded-edit"
                                className="text-sm font-semibold text-gray-700"
                              >
                                Is this project funded?
                              </label>
                            </div>
                            {state.funded && (
                              <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">
                                  Funding Details
                                </label>
                                <Textarea
                                  placeholder="Enter funding details..."
                                  value={state.funding_details || ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      "funding_details",
                                      e.target.value,
                                    )
                                  }
                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6] min-h-[100px]"
                                />
                              </div>
                            )}
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Technologies
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="e.g., React.js"
                                  value={state.technology || ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      "technology",
                                      e.target.value,
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddTechnology();
                                    }
                                  }}
                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                />
                                <Button
                                  variant="outline"
                                  type="button"
                                  onClick={handleAddTechnology}
                                >
                                  Add
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {state.technologies?.map(
                                  (tech: string, index: number) => (
                                    <div
                                      key={index}
                                      className="bg-[#1E3786]/20 text-blue-900 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center gap-2"
                                    >
                                      {tech}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveTechnology(tech)
                                        }
                                        className="text-blue-800 hover:text-blue-900"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Project Description
                              </label>
                              <Textarea
                                placeholder="Describe your project, its features, and your role..."
                                value={state.project_description || ""}
                                onChange={(e) =>
                                  handleFormChange(
                                    "project_description",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6] min-h-[100px]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setState({ isEditingProject: false })
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={updateProjects}
                            className="bg-[#1E3786] "
                          >
                            Update
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {state.isEditingPublication && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                      >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                          <h2 className="text-xl font-bold text-gray-900">
                            Edit Publication
                          </h2>
                          <button
                            onClick={() =>
                              setState({ isEditingPublication: false })
                            }
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>

                        <div className="p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Publication Title
                              </label>
                              <Input
                                placeholder="e.g., Advanced AI Research"
                                value={state.publication_title || ""}
                                onChange={(e) =>
                                  handleFormChange(
                                    "publication_title",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Journal
                              </label>
                              <Input
                                placeholder="e.g., IEEE Transactions"
                                value={state.publication_journal || ""}
                                onChange={(e) =>
                                  handleFormChange(
                                    "publication_journal",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Volume
                              </label>
                              <Input
                                placeholder="e.g., 42"
                                value={state.publication_volume || ""}
                                onChange={(e) =>
                                  handleFormChange(
                                    "publication_volume",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Issue
                              </label>
                              <Input
                                placeholder="e.g., 3"
                                value={state.publication_issue || ""}
                                onChange={(e) =>
                                  handleFormChange(
                                    "publication_issue",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Year
                              </label>
                              <Input
                                placeholder="e.g., 2023"
                                value={state.publication_year || ""}
                                onKeyDown={onlyNumbers}
                                onChange={(e) =>
                                  handleFormChange(
                                    "publication_year",
                                    numericString(e.target.value),
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Description
                              </label>
                              <Textarea
                                placeholder="Brief description of the publication..."
                                value={state.publication_description || ""}
                                onChange={(e) =>
                                  handleFormChange(
                                    "publication_description",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6] min-h-[100px]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setState({ isEditingPublication: false })
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={updatePublication}
                            className="bg-[#1E3786] "
                          >
                            Update
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {state.isEditingAchievements && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                      >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                          <h2 className="text-xl font-bold text-gray-900">
                            Edit Achievements
                          </h2>
                          <button
                            onClick={() =>
                              setState({ isEditingAchievements: false })
                            }
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>

                        <div className="p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Achievement Title
                              </label>
                              <Input
                                placeholder="e.g., Employee of the Year"
                                value={state.achievement_title || ""}
                                onChange={(e) =>
                                  handleFormChange(
                                    "achievement_title",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Organization
                              </label>
                              <Input
                                placeholder="e.g., Tech Solutions Inc"
                                value={state.organization || ""}
                                onChange={(e) =>
                                  handleFormChange(
                                    "organization",
                                    e.target.value,
                                  )
                                }
                                className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Achievement File (PDF)
                              </label>
                              <div className="flex items-center gap-3">
                                <Input
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setState({
                                        achievement_file: file,
                                        achievement_file_preview:
                                          URL.createObjectURL(file),
                                      });
                                    }
                                  }}
                                  className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                                />
                                <Upload className="w-5 h-5 text-gray-400" />
                              </div>
                              {state.achievement_file && (
                                <div className="text-sm text-gray-600 mt-1">
                                  Current file:{" "}
                                  {typeof state.achievement_file ===
                                  "string" ? (
                                    <a
                                      href={state.achievement_file}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-600 hover:underline"
                                    >
                                      View File
                                    </a>
                                  ) : (
                                    state.achievement_file.name
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 mb-6">
                            <label className="text-sm font-semibold text-gray-700">
                              Description
                            </label>
                            <Textarea
                              placeholder="Describe your achievement and its significance..."
                              value={state.achievement_description || ""}
                              onChange={(e) =>
                                setState({
                                  ...state,
                                  achievement_description: e.target.value,
                                })
                              }
                              className="border-gray-200 focus:border-[#3b82f6] focus:ring-[#3b82f6] min-h-[100px]"
                            />
                          </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setState({ isEditingAchievements: false })
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={updateAchievement}
                            className="bg-[#1E3786] "
                          >
                            Update
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </>
            )}
          </Card>
        </div>
      </div>
      <div ref={footerRef}>
        <Footer />
      </div>
      <Modal
        isOpen={state.showCollegeModal}
        setIsOpen={() => setState({ showCollegeModal: false, collegeDetail: null })}
        title="College Details"
        width="700px"
        renderComponent={() => (
          <div className="p-4 sm:p-5 md:p-6 space-y-5 md:space-y-6 max-h-[75vh] overflow-y-auto">
            {state.loading ? (
              <div className="space-y-6">
                <div className="flex gap-4 items-center border-b pb-4">
                  <SkeletonLoader type="rect" width={80} height={80} className="rounded-xl" />
                  <div className="flex-1">
                    <SkeletonLoader type="text" width="60%" height={24} style={{ marginBottom: 8 }} />
                    <SkeletonLoader type="text" width="40%" height={16} />
                  </div>
                </div>
                <SkeletonLoader type="text" count={3} />
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-5 pb-4 md:pb-5 border-b text-center sm:text-left">
                  {state.collegeDetail?.college_logo ? (
                    <img src={state.collegeDetail.college_logo} alt={state.collegeDetail.college_name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border shadow-sm" />
                  ) : (
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-gray-400 flex items-center justify-center text-white font-bold text-xl shadow">
                      {state.collegeDetail?.college_name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#1E3786]">{state.collegeDetail?.college_name}</h2>
                    <p className="text-xs sm:text-sm text-gray-500">{state.collegeDetail?.institution_name}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Contact Info</h3>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-2"><MailIcon className="w-4 h-4 text-[#F2B31D]" /><span>{state.collegeDetail?.college_email}</span></div>
                    <div className="flex items-center gap-2"><PhoneCall className="w-4 h-4 text-[#F2B31D]" /><span>{state.collegeDetail?.college_phone}</span></div>
                    <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-[#F2B31D]" /><span>{state.collegeDetail?.college_address}</span></div>
                    {state.collegeDetail?.college_types && (
                      <div className="flex items-start gap-2"><Building className="w-4 h-4 text-[#F2B31D]" /><span>{state.collegeDetail?.college_types?.map((item: any) => item?.name)?.join(", ")}</span></div>
                    )}
                  </div>
                </div>
                {state.collegeDetail?.naac_accreditations?.length > 0 && (
                  <div className="bg-white shadow-md rounded-2xl p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-semibold text-[#1E3786] mb-3">NAAC & Accreditation</h3>
                    <div className="flex flex-wrap gap-2">
                      {state.collegeDetail?.naac_accreditations?.map((item: any, index: number) => (
                        <span key={index} className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-green-100 text-green-700">{item.grade}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {state.collegeDetail?.intake_per_year && (
                    <div className="bg-[#1E3786] text-white rounded-xl p-4 text-center">
                      <p className="text-sm font-semibold text-white">Intake Per Year</p>
                      <h3 className="text-2xl font-bold mt-1">{state.collegeDetail?.intake_per_year}</h3>
                    </div>
                  )}
                  {state.collegeDetail?.total_strength && (
                    <div className="bg-[#F2B31D] text-white rounded-xl p-4 text-center">
                      <p className="text-sm font-semibold">Total Strength</p>
                      <h3 className="text-2xl font-bold mt-1">{state.collegeDetail?.total_strength}</h3>
                    </div>
                  )}
                </div>
                {state.collegeDetail?.recent_achievements?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Achievements</h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                      {state.collegeDetail?.recent_achievements?.map((item: any, index: number) => (
                        <li key={index} className="flex items-start gap-2"><Award className="w-5 h-5 text-[#F2B31D] shrink-0" />{item.achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {state.collegeDetail?.summary && state.collegeDetail?.summary !== "null" && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold mb-2 text-gray-800 text-sm sm:text-base">Summary</h4>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{state.collegeDetail?.summary}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      />
    </>
  );
}
