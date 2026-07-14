"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
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
} from "@/utils/function.utils";
import Swal from "sweetalert2";
import { Models } from "@/imports/models.import";
import { Failure } from "@/components/common-components/toast";
import * as Yup from "yup";
import CustomSelect from "@/components/common-components/dropdown";
import { user, userResume } from "@/utils/validation.utils";
import skill from "@/models/skill.models";
import { log } from "console";
import { DatePicker } from "@/components/common-components/datePicker";
import { start } from "repl";
import Footer from "@/components/common-components/new_components/Footer";

export default function NaukriProfilePage() {
  const [activeTab, setActiveTab] = useState("resume");
  const [isManualScroll, setIsManualScroll] = useState(false);
  const params = useParams();

  const [state, setState] = useSetState({
    // Profile Data
    current_location: "",
    about:
      "Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions. Implemented responsive designs and optimized application performance for better user experience.",

    // Accordion States
    expandedSections: {
      resume: true,
      headline: true,
      skills: true,
      employment: true,
      education: true,
      projects: true,
      publications: true,
      achievements: true,
    },
  });

  useEffect(() => {
    if (params?.id) {
      setState({ userId: params.id });
      userDetail(params.id);
    }
  }, [params]);

  // Intersection Observer for active tab tracking
  useEffect(() => {
    const sections = tabItems
      .map((item) => document.getElementById(`${item.id}-section`))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        if (!isManualScroll) {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const sectionId = entry.target.id.replace("-section", "");
              setActiveTab(sectionId);
            }
          });
        }
      },
      {
        threshold: 0.3,
        rootMargin: "-20% 0px -70% 0px",
      },
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [isManualScroll]);

  const userDetail = async (userId) => {
    try {
      setState({ loading: true });
      const res: any = await Models.profile.details(userId);

      setState({
        loading: false,
        userDetail: res,
      });
    } catch (error) {
      setState({ loading: false });
      // Failure("Failed to fetch jobs");
    }
  };

  console.log("userDetail", state.userDetail);

  const downloadResume = () => {
    if (state.userDetail?.resume_url) {
      const link = document.createElement("a");
      link.href = state.userDetail.resume_url;
      const filename = getFileNameFromUrl(state.userDetail.resume_url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      confirmButtonColor: "#f2b31d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
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
    try {
      // const body = { skill_id: skillId };
      const res = await Models.skill.delete(skillId);

      console.log("deleted skill", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Failed to delete skill");
    }
  };

  const addEmployment = async () => {
    try {
      setState({
        isCreateExperience: false,
      });

      const body = {
        user_id: state.userId,
        company: state.company,
        designation: state.designation,
        start_date: DateFormat(state.start_date, "api"),
        end_date: DateFormat(state.end_date, "api"),
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
      setState({
        isEditingExperience: false,
      });

      const body = {
        experience_id: state.editingId,
        company: state.company,
        designation: state.designation,
        start_date: DateFormat(state.start_date, "api"),
        end_date: DateFormat(state.end_date, "api"),
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
        startYear: state.startYear,
        endYear: state.endYear,
        grade: state.grade,
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
    try {
      const res = await Models.projects.delete(projectId);

      console.log("deleted project", res);
      userDetail(state.userId);
    } catch (error) {
      Failure(error?.error || "Failed to delete project");
    }
  };

  const addPublication = async () => {
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
    // setState({
    //   userDetail: {
    //     ...state.userDetail,
    //     username: state.profileForm.username,
    //     location: state.profileForm.location,
    //     phone: state.profileForm.phone,
    //     email: state.profileForm.email,
    //     experience: state.profileForm.experience,
    //   },
    //   title: state.profileForm.title,
    //   company: state.profileForm.company,
    //   salary: state.profileForm.salary,
    //   noticePeriod: state.profileForm.noticePeriod,
    //   isEditingProfile: false,
    // });
  };

  const experienceList = async () => {
    try {
      const experienceList = [
        { value: "fresher", label: "Fresher" },
        { value: "0 – 1 Year", label: "0 – 1 Year" },
        { value: "1 – 3 Years", label: "1 – 3 Years" },
        { value: "3 – 5 Years", label: "3 – 5 Years" },
        { value: "5 – 10 Years", label: "5 – 10 Years" },
        { value: "10+ Years", label: "10+ Years" },
      ];

      setState({
        experienceList: experienceList,
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
    const tabId = sectionId.replace("-section", "");
    setActiveTab(tabId);
    setIsManualScroll(true);

    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }

      setTimeout(() => {
        setIsManualScroll(false);
      }, 1500);
    }, 100);
  };

  const tabItems = [
    { id: "resume", label: "Resume", icon: FileText },
    { id: "headline", label: "Summary", icon: Edit3 },
    { id: "skills", label: "Skills", icon: Code },
    { id: "employment", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "publications", label: "Publications", icon: Book },
    { id: "achievements", label: "Awards", icon: Award },
  ];

  console.log("resume", state?.resume);

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

  return (
   
    <>
     <div className="min-h-screen bg-clr1 py-4">
      <div className="max-w-7xl mx-auto p-4">
        {/* Profile Header - Will hide on scroll */}
        <Card className="bg-clr2 border-0 mb-8 overflow-hidden">
          <div className="absolute"></div>
          <CardContent className="relative p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
              {/* Profile Image - Enhanced */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-3xl border-4 border-white overflow-hidden bg-gradient-to-br from-yellow-100 to-orange-100">
                  <img
                    src={
                      state.userDetail?.profile_logo_url ||
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    }
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs px-3 py-1 rounded-full shadow-lg font-semibold whitespace-nowrap">
                  {state.profileCompletion}%
                </div> */}
              </div>

              {/* Profile Info - Enhanced */}
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {state.userDetail?.username}
                      </h1>
                    </div>
                    {state?.userDetail?.short_desc && (
                      <p className="text-sm sm:text-base md:text-lg text-gray-700 font-medium mt-1">
                        {state?.userDetail?.short_desc}
                      </p>
                    )}
                    {(state?.userDetail?.current_company ||
                      state?.userDetail?.current_location) && (
                      <div className="text-gray-600 flex items-center gap-2 justify-center sm:justify-start mt-2">
                        <div className="w-2 h-2 bg-[#f2b31d] rounded-full"></div>

                        <span className="text-sm">
                          {state?.userDetail?.current_company} -{" "}
                          {state?.userDetail?.current_location}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <div className="bg-white/100 rounded-lg px-3 py-2 shadow-sm border">
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        Last Updated:{" "}
                        <span className="font-semibold text-gray-700">
                          {DateFormat(state.userDetail?.updated_at, "date")}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Details Grid - Enhanced */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  mt-4"
                  style={{ gap: "5px" }}
                >
                  {[
                    {
                      icon: MapPin,
                      label:
                        state?.userDetail?.current_location || "Not specified",
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
                      label: state?.userDetail?.experience || "Not specified",
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
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 sm:p-3 bg-white/100 rounded-xl border border-gray-100 hover:bg-white/70 transition-all duration-200"
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
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Main Content Container */}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Quick Links */}
          <div className="lg:w-1/4 quick-links-sidebar">
            <div className="sticky top-24 z-10">
              <Card className="bg-clr2  border-0 overflow-hidden">
                <div className=""></div>
                <CardContent className="relative p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#f2b31d] rounded-full"></div>
                    Quick Links
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        label: "Resume/login",
                        // action: "Update",
                        onClick: () => scrollToSection("resume-section"),
                      },
                      {
                        label: "Profile Summary",
                        action: null,
                        onClick: () => scrollToSection("headline-section"),
                      },
                      {
                        label: "Skills",
                        // action: null,
                        onClick: () => scrollToSection("skills-section"),
                      },
                      {
                        label: "Experience",
                        // action: "Add",
                        onClick: () => scrollToSection("employment-section"),
                      },
                      {
                        label: "Education",
                        // action: "Add",
                        onClick: () => scrollToSection("education-section"),
                      },
                      {
                        label: "Projects",
                        // action: null,
                        onClick: () => scrollToSection("projects-section"),
                      },
                      {
                        label: "Achievements",
                        // action: null,
                        onClick: () => scrollToSection("achievements-section"),
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-2 py-3 bg-white/100 rounded-xl  hover:bg-white/80 transition-all duration-200 group cursor-pointer"
                        onClick={item.onClick}
                      >
                        <span className="text-gray-700 font-medium group-hover:text-gray-900">
                          {item.label}
                        </span>
                        {/* {item.action && (
                          <Button
                            variant="link"
                            className="text-blue-600 hover:text-blue-700 p-0 h-auto font-semibold text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.label === "Experience")
                                setState({ isEditingEmployment: true });
                              if (item.label === "Education")
                                setState({ isEditingEducation: true });
                            }}
                          >
                            {item.action}
                          </Button>
                        )} */}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Content Area - Scrollable */}
          <div className="quick-links-content flex-1">
            <div className="space-y-4">
              {/* Naukri Pro Banner */}

              {/* Resume Section */}
              <Card
                id="resume-section"
                className="bg-gradient-to-br from-white via-[#f2b31d]/10 to-orange-50/30 border-0 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-2xl"></div>

                <CardContent className="relative p-4 md:p-6">
                  <div
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => toggleSection("resume")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                        <FileText className="w-4 h-4 text-white transform -rotate-3" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-[#f2b31d] to-orange-800 bg-clip-text text-transparent">
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
                        {/* Current Resume Card */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#f2b31d]/5 to-orange-500/5 rounded-3xl blur-sm group-hover:from-[#f2b31d]/10 group-hover:to-orange-500/10 transition-all duration-300"></div>
                          <div className="relative bg-white/70 rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:scale-[1.02]">
                            <div className="flex items-start gap-6">
                              {/* Resume Icon */}
                              <div className="flex-shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl shadow-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 relative">
                                  <div className="text-white">
                                    <div className="text-xs font-bold mb-1">
                                      PDF
                                    </div>
                                    <div className="w-8 h-0.5 bg-white/100 mb-1"></div>
                                    <div className="w-6 h-0.5 bg-white/40 mb-1"></div>
                                    <div className="w-7 h-0.5 bg-white/100"></div>
                                  </div>
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#f2b31d] rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-sm font-bold">
                                      ✓
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Resume Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between md:mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                                      <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-[#f2b31d] rounded-full"></div>
                                        {state?.userDetail?.resume_url
                                          ? "Uploaded"
                                          : "No Resume Uploaded"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Desktop Action Buttons - Top Right */}
                                  <div className="hidden md:flex gap-2">
                                    {state?.userDetail?.resume_url ? (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="hover:bg-[#f2b31d]/10 border-[#f2b31d]/30 group/btn"
                                          onClick={downloadResume}
                                          title="Download Resume"
                                        >
                                          <Download className="w-4 h-4 text-[#f2b31d] group-hover/btn:scale-110 transition-transform" />
                                        </Button>
                                      </>
                                    ) : (
                                      <></>
                                    )}
                                  </div>
                                </div>

                                {state?.userDetail?.resume_url && (
                                  <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <div className="bg-gradient-to-r from-[#f2b31d]/20 to-orange-100 px-3 py-1 rounded-full">
                                      <span className="text-[#b38315] font-semibold text-sm">
                                        Latest Version
                                      </span>
                                    </div>
                                  </div>
                                )}
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
                className="bg-gradient-to-br from-white via-[#f2b31d]/10 to-orange-50/30 border-0 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-2xl"></div>

                <CardContent className="relative p-4 md:p-6">
                  <div
                    className="flex items-center justify-between mb-6 cursor-pointer"
                    onClick={() => toggleSection("headline")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                        <Edit3 className="w-4 h-4 text-white transform -rotate-3" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-[#f2b31d] to-orange-800 bg-clip-text text-transparent">
                          Profile Summary
                        </h3>
                        <p className="text-sm text-gray-500">
                          Your professional summary
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
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
                        {/* Headline Display */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#f2b31d]/5 to-orange-500/5 rounded-3xl blur-sm"></div>
                          <div className="flex-1 px-3">
                            <p className="text-md text-gray-500">
                              {state.userDetail?.about}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Skills Section */}
              <Card
                id="skills-section"
                className="bg-gradient-to-br from-white via-[#f2b31d]/10 to-orange-50/30 border-0 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-2xl"></div>

                <CardContent className="relative p-4 md:p-6">
                  <div
                    className="flex items-center justify-between mb-8 cursor-pointer"
                    onClick={() => toggleSection("skills")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                        <Code className="w-4 h-4 text-white transform -rotate-3" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-[#f2b31d] to-orange-800 bg-clip-text text-transparent">
                          Skills
                        </h3>
                        <p className="text-sm text-gray-500">
                          Your technical expertise
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {state.expandedSections.skills ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
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
                        {/* Skills List - Chip Format */}
                        <div className="flex flex-wrap gap-3">
                          {state?.userDetail?.skills?.map((skill, index) => (
                            <motion.div
                              key={skill.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="group relative"
                            >
                              <div className="bg-gradient-to-r from-[#f2b31d]/10 to-orange-100 hover:from-[#f2b31d]/20 hover:to-orange-200 border border-[#f2b31d]/30 rounded-full px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:shadow-lg group-hover:scale-105">
                                <span className="text-[#b38315] font-medium text-sm">
                                  {skill.name}
                                </span>
                                {/* <span className="text-purple-600 text-xs bg-white/100 px-2 py-0.5 rounded-full">
                                  {skill.experience}
                                </span> */}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Empty State */}
                        {(state.userDetail?.skills?.length === 0 ||
                          !state.userDetail?.skills?.length) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                          >
                            <div className="w-16 h-16 bg-gradient-to-br from-[#f2b31d]/20 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Code className="w-8 h-8 text-[#f2b31d]/60" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              No Skills Added
                            </h4>
                            <p className="text-gray-500 mb-4">
                              Add your technical skills as chips
                            </p>
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
                className="bg-gradient-to-br from-white via-[#f2b31d]/10 to-orange-50/30 border-0 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-2xl"></div>

                <CardContent className="relative p-4 md:p-6">
                  <div
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => toggleSection("employment")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                        <Briefcase className="w-4 h-4 text-white transform -rotate-3" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-[#f2b31d] to-orange-800 bg-clip-text text-transparent">
                          Experience
                        </h3>
                        <p className="text-sm text-gray-500">
                          Your professional journey
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {state.expandedSections.employment ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
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
                        {/* Employment List */}
                        <div className="space-y-4">
                          {state.userDetail?.experiences?.map((emp, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="relative group"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-[#f2b31d]/5 to-orange-500/5 rounded-3xl blur-sm group-hover:from-[#f2b31d]/10 group-hover:to-orange-500/10 transition-all duration-300"></div>
                              <div className="relative bg-white/70  rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                                <div className="flex items-start gap-3">
                                  {/* Company Logo Placeholder */}
                                  <div className="flex-shrink-0 pt-1">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                      <span className="text-white font-bold text-md">
                                        {emp.company.charAt(0).toUpperCase()}
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
                                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#b38315] transition-colors">
                                            {emp.designation}
                                          </h4>
                                        </div>
                                        <p className="text-md font-semibold text-[#f2b31d] mb-1">
                                          {emp.company}
                                        </p>
                                        <div className="text-sm text-gray-600 mb-2">
                                          {/* <span className="font-medium">
                                            {emp.jobType || "Full-time"}
                                          </span>{" "}
                                          | */}
                                          <span className="ml-1">
                                            {DateFormat(emp.start_date, "date")}{" "}
                                            to{" "}
                                            {DateFormat(emp.end_date, "date")}
                                          </span>
                                          {/* <span className="ml-1">
                                            (
                                            {emp.duration || "2 years 3 months"}
                                            )
                                          </span> */}
                                        </div>
                                      </div>

                                    </div>

                                    {/* Job Description */}
                                    <div className="bg-gradient-to-r from-gray-50 to-[#f2b31d]/10 rounded-2xl p-4 border border-gray-100 mb-2">
                                      <p className="text-gray-700 leading-relaxed text-sm">
                                        {emp.job_description}
                                      </p>
                                      {emp.job_description &&
                                        emp.job_description.length > 200 && (
                                          <button className="text-blue-600 text-sm font-medium mt-2 hover:underline">
                                            Read More
                                          </button>
                                        )}
                                    </div>

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
                                    </div>
                                  </div>
                                </div>

                                {/* Timeline Connector */}
                                {index <
                                  state?.userDetail?.experiences.length - 1 && (
                                  <div className="absolute -bottom-3 left-8 w-0.5 h-6 bg-gradient-to-b from-[#f2b31d]/50 to-transparent"></div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Empty State */}
                        {(state.userDetail?.experiences?.length === 0 ||
                          !state.userDetail?.experiences?.length) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                          >
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-4xl">💼</span>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">
                              No Employment History
                            </h4>
                            <p className="text-gray-500 mb-6">
                              Add your work experience to showcase your
                              professional journey
                            </p>
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
                className="bg-gradient-to-br from-white via-[#f2b31d]/10 to-orange-50/30 border-0 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-2xl"></div>

                <CardContent className="relative p-4 md:p-6">
                  <div
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => toggleSection("education")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                        <GraduationCap className="w-4 h-4 text-white transform -rotate-3" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-[#f2b31d] to-orange-800 bg-clip-text text-transparent">
                          Education
                        </h3>
                        <p className="text-sm text-gray-500">
                          Your academic background
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {state.expandedSections.education ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
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
                        {/* Education List */}
                        <div className="space-y-4">
                          {state?.userDetail?.educations?.map((edu, index) => (
                            <motion.div
                              key={edu.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="relative group"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-[#f2b31d]/5 to-orange-500/5 rounded-3xl blur-sm group-hover:from-[#f2b31d]/10 group-hover:to-orange-500/10 transition-all duration-300"></div>
                              <div className="relative bg-white/70  rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                                <div className="flex items-start gap-3">
                                  {/* Institution Logo Placeholder */}
                                  <div className="flex-shrink-0 pt-1">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                      <span className="text-white font-bold text-md">
                                        {edu.institution
                                          .charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Education Details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between md:mb-1">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#b38315] transition-colors">
                                            {edu.degree}
                                          </h4>
                                        </div>
                                        <p className="text-md font-semibold text-[#f2b31d]">
                                          {edu.institution}
                                        </p>
                                        <div className="text-sm text-gray-600">
                                          <span className="font-medium">
                                            {edu.field}
                                          </span>
                                        </div>
                                      </div>

                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                      <span className="font-medium">
                                        {edu.start_year} - {edu.end_year}
                                      </span>{" "}
                                      |<span className="ml-1">{edu.cgpa}</span>
                                    </div>

                                  </div>
                                </div>

                                {/* Timeline Connector */}
                                {index <
                                  state?.userDetail?.educations?.length - 1 && (
                                  <div className="absolute -bottom-3 left-8 w-0.5 h-6 bg-gradient-to-b from-[#f2b31d]/50 to-transparent"></div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Empty State */}
                        {(state?.userDetail?.educations?.length === 0 ||
                          !state?.userDetail?.educations) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                          >
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                              <GraduationCap className="w-12 h-12 text-[#f2b31d]/60" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">
                              No Education History
                            </h4>
                            <p className="text-gray-500 mb-6">
                              Add your educational background to showcase your
                              qualifications
                            </p>
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
                className="bg-gradient-to-br from-white via-[#f2b31d]/10 to-orange-50/30 border-0 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-2xl"></div>

                <CardContent className="relative p-4 md:p-6">
                  <div
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => toggleSection("projects")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                        <FolderOpen className="w-4 h-4 text-white transform -rotate-3" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-[#f2b31d] to-orange-800 bg-clip-text text-transparent">
                          Projects
                        </h3>
                        <p className="text-sm text-gray-500">
                          Your portfolio showcase
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {state.expandedSections.projects ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
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
                        {/* Projects List */}
                        <div className="space-y-4">
                          {state.userDetail?.projects?.map((project, index) => (
                            <motion.div
                              key={project.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="relative group"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-[#f2b31d]/5 to-orange-500/5 rounded-3xl blur-sm group-hover:from-[#f2b31d]/10 group-hover:to-orange-500/10 transition-all duration-300"></div>
                              <div className="relative bg-white/70 rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                                <div className="flex items-start gap-3">
                                  {/* Project Icon */}
                                  <div className="flex-shrink-0 pt-1">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#b38315] transition-colors">
                                            {project.project_title}
                                          </h4>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">
                                          <span className="font-medium">
                                            Duration: {project.duration}
                                          </span>
                                          {project.Project_link && (
                                            <span className="ml-2">
                                              |{" "}
                                              <a
                                                href={project.project_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#f2b31d] hover:underline"
                                              >
                                                View Project
                                              </a>
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                    </div>

                                    {/* Project Description */}
                                    <div className="bg-gradient-to-r from-gray-50 to-[#f2b31d]/10 rounded-2xl p-4 border border-gray-100 mb-4">
                                      <p className="text-gray-700 leading-relaxed text-sm">
                                        {project.project_description}
                                      </p>
                                      {project.funding_details && (
                                        <div className="mt-4">
                                          <h5 className="text-sm font-semibold text-gray-700 mb-1">
                                            Funding Details
                                          </h5>
                                          <p className="text-gray-700 leading-relaxed text-sm">
                                            {project.funding_details}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Technologies */}
                                    {project.technologies &&
                                      project.technologies.length > 0 && (
                                        <div className="mb-4">
                                          <h5 className="text-sm font-semibold text-gray-700 mb-2">
                                            Technologies Used:
                                          </h5>
                                          <div className="flex flex-wrap gap-2">
                                            {project.technologies.map(
                                              (tech, techIndex) => (
                                                <span
                                                  key={techIndex}
                                                  className="bg-gradient-to-r from-[#f2b31d]/20 to-orange-100 text-[#b38315] px-3 py-1 rounded-full text-sm font-medium"
                                                >
                                                  {tech}
                                                </span>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}

                                  </div>
                                </div>

                                {/* Timeline Connector */}
                                {index <
                                  state.userDetail?.projects?.length - 1 && (
                                  <div className="absolute -bottom-3 left-8 w-0.5 h-6 bg-gradient-to-b from-[#f2b31d]/50 to-transparent"></div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Empty State */}
                        {(state.userDetail?.projects?.length === 0 ||
                          !state.userDetail?.projects) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                          >
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FolderOpen className="w-12 h-12 text-[#f2b31d]/60" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">
                              No Projects Added
                            </h4>
                            <p className="text-gray-500 mb-6">
                              Showcase your work by adding your projects and
                              achievements
                            </p>
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
                className="bg-gradient-to-br from-white via-[#f2b31d]/10 to-orange-50/30 border-0 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-2xl"></div>

                <CardContent className="relative p-4 md:p-6">
                  <div
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => toggleSection("publications")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                        <Book className="w-4 h-4 text-white transform -rotate-3" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-[#f2b31d] to-orange-800 bg-clip-text text-transparent">
                          Publications
                        </h3>
                        <p className="text-sm text-gray-500">
                          Your research and publications
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {state.expandedSections.publications ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
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
                        {/* Publications List */}
                        <div className="space-y-4">
                          {state.userDetail?.publications?.map((pub, index) => (
                            <motion.div
                              key={pub.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="relative group"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-[#f2b31d]/5 to-orange-500/5 rounded-3xl blur-sm group-hover:from-[#f2b31d]/10 group-hover:to-orange-500/10 transition-all duration-300"></div>
                              <div className="relative bg-white/70 rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                                <div className="flex items-start gap-3">
                                  {/* Publication Icon */}
                                  <div className="flex-shrink-0 pt-1">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#b38315] transition-colors">
                                            {pub.publication_title}
                                          </h4>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">
                                          <span className="font-medium">
                                            {pub.publication_journal}
                                          </span>
                                          <span className="ml-2">
                                            | Year: {pub.publication_year}
                                          </span>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">
                                          Vol: {pub.publication_volume}
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">
                                          Issue: {pub.publication_issue}
                                        </div>
                                      </div>

                                      {/* Desktop Action Buttons - Top Right */}
                                      <div className="hidden md:flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="hover:bg-[#f2b31d]/10 border-[#f2b31d]/30 group/btn"
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
                                              publication_id: pub.id,
                                            });
                                          }}
                                        >
                                          <Edit className="w-4 h-4 text-[#f2b31d] group-hover/btn:scale-110 transition-transform" />
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Publication Description */}
                                    <div className="bg-gradient-to-r from-gray-50 to-[#f2b31d]/10 rounded-2xl p-4 border border-gray-100 mb-4">
                                      <p className="text-gray-700 leading-relaxed text-sm">
                                        {pub.publication_description}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Timeline Connector */}
                                {index <
                                  state.userDetail?.publications?.length -
                                    1 && (
                                  <div className="absolute -bottom-3 left-8 w-0.5 h-6 bg-gradient-to-b from-[#f2b31d]/50 to-transparent"></div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Empty State */}
                        {(state.userDetail?.publications?.length === 0 ||
                          !state.userDetail?.publications) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                          >
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Book className="w-12 h-12 text-[#f2b31d]/60" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">
                              No Publications Added
                            </h4>
                            <p className="text-gray-500 mb-6">
                              Showcase your research work by adding your
                              publications
                            </p>
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
                className="bg-gradient-to-br from-white via-[#f2b31d]/10 to-orange-50/30 border-0 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#f2b31d]/20 to-orange-400/20 rounded-full blur-2xl"></div>

                <CardContent className="relative p-4 md:p-6">
                  <div
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => toggleSection("achievements")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                        <Award className="w-4 h-4 text-white transform -rotate-3" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-[#f2b31d] to-orange-800 bg-clip-text text-transparent">
                          Achievements & Awards
                        </h3>
                        <p className="text-sm text-gray-500">
                          Your recognitions and honors
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {state.expandedSections.achievements ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
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
                        {/* Achievements List */}
                        <div className="space-y-4">
                          {state.userDetail?.achievements?.map(
                            (achievement, index) => (
                              <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative group"
                              >
                              <div className="absolute inset-0 bg-gradient-to-r from-[#f2b31d]/5 to-orange-500/5 rounded-3xl blur-sm group-hover:from-[#f2b31d]/10 group-hover:to-orange-500/10 transition-all duration-300"></div>
                                <div className="relative bg-white/70 rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                                  <div className="flex items-start gap-6">
                                    {/* Achievement Icon */}
                                    <div className="flex-shrink-0">
                                      <div className="w-10 h-10 bg-gradient-to-br from-[#f2b31d] to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <Award className="w-4 h-4 text-white" />
                                      </div>
                                    </div>

                                    {/* Achievement Details */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between md:mb-1">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#b38315] transition-colors">
                                              {achievement.achievement_title}
                                            </h4>
                                          </div>
                                          <p className="text-md font-semibold text-[#f2b31d] mb-1">
                                            {
                                              achievement.organization
                                            }
                                          </p>
                                        </div>

                                      </div>

                                      {/* Achievement Description */}
                                      <div className="bg-gradient-to-r from-gray-50 to-[#f2b31d]/10 rounded-2xl p-4 border border-gray-100 mb-4">
                                        <p className="text-gray-700 leading-relaxed text-sm">
                                          {achievement.achievement_description}
                                        </p>

                                        {achievement.achievement_file_url && (
                                          <a className="flex items-center text-gray-700 leading-relaxed text-sm"
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

                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ),
                          )}
                        </div>

                        {/* Empty State */}
                        {(state.userDetail?.achievements?.length === 0 ||
                          !state.userDetail?.achievements) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                          >
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Award className="w-12 h-12 text-[#f2b31d]/60" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">
                              No Achievements Added
                            </h4>
                            <p className="text-gray-500 mb-6">
                              Showcase your awards and recognitions
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
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
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Profile
                  </h2>
                  <button
                    onClick={() => setState({ isEditingProfile: false })}
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
                                profile_logo_preview: URL.createObjectURL(file),
                              });
                            }
                          }}
                          className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                        error={state?.errors?.last_name}
                      />
                    </div>

                    <div className="space-y-2">
                      <Input
                        title="Short Description"
                        value={state.short_desc}
                        onChange={(e) =>
                          handleFormChange("short_desc", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                        title=" Current Company"
                        value={state.current_company}
                        onChange={(e) =>
                          handleFormChange("current_company", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Input
                        title=" Current Position"
                        value={state.current_position}
                        onChange={(e) =>
                          handleFormChange("current_position", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Input
                        title="Location"
                        required
                        value={state.current_location}
                        onChange={(e) =>
                          handleFormChange("current_location", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                        error={state?.errors?.current_location}
                      />
                    </div>

                    <div className="space-y-2">
                      <Input
                        title="Phone"
                        required
                        value={state.phone}
                        onChange={(e) =>
                          handleFormChange("phone", e.target.value)
                        }
                        error={state?.errors?.phone}
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                        error={state?.errors?.email}
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
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                        error={state?.errors?.gender}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                  <Button
                    variant="outline"
                    onClick={() => setState({ isEditingProfile: false })}
                  >
                    Cancel
                  </Button>
                  <Button
                    // onClick={profileUpdate}
                    className="bg-[#f2b31d] hover:bg-[#d9a01a]"
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
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Experience
                  </h2>
                  <button
                    onClick={() => setState({ isEditingExperience: false })}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Company Name
                      </label>
                      <Input
                        placeholder="e.g., Google Inc."
                        value={state.company || ""}
                        onChange={(e) =>
                          handleFormChange("company", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                          handleFormChange("designation", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                      />
                    </div>

                    <div className="space-y-2">
                      <DatePicker
                        placeholder="End Date"
                        title="End Date"
                        closeIcon={true}
                        selectedDate={state.end_date}
                        onChange={(date) => {
                          setState({
                            end_date: date,
                          });
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Job Description
                      </label>
                      <Textarea
                        placeholder="Describe your key responsibilities and achievements..."
                        value={state.job_description}
                        onChange={(e) =>
                          handleFormChange("job_description", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d] min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                  <Button
                    variant="outline"
                    onClick={() => setState({ isEditingExperience: false })}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateEmployment}
                    className="bg-[#f2b31d] hover:bg-[#d9a01a]"
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
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Education
                  </h2>
                  <button
                    onClick={() => setState({ isEditingEducation: false })}
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
                          handleFormChange("institution", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Start Year
                      </label>
                      <Input
                        placeholder="e.g., 2016"
                        value={state.start_year || ""}
                        onChange={(e) =>
                          handleFormChange("start_year", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        End Year
                      </label>
                      <Input
                        placeholder="e.g., 2020"
                        value={state.end_year || ""}
                        onChange={(e) =>
                          handleFormChange("end_year", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                  <Button
                    variant="outline"
                    onClick={() => setState({ isEditingEducation: false })}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateEducation}
                    className="bg-[#f2b31d] hover:bg-[#d9a01a]"
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
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Project
                  </h2>
                  <button
                    onClick={() => setState({ isEditingProject: false })}
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
                          handleFormChange("project_title", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                          handleFormChange("project_link", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                      />
                    </div>
                    <div className="space-y-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="funded-edit"
                        className="h-4 w-4 rounded border-gray-300 text-[#f2b31d] focus:ring-[#f2b31d]"
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
                            handleFormChange("funding_details", e.target.value)
                          }
                          className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d] min-h-[100px]"
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
                            handleFormChange("technology", e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              // handleAddTechnology();
                            }
                          }}
                          className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                        />
                        <Button
                          variant="outline"
                          type="button"
                          // onClick={handleAddTechnology}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {state.technologies?.map(
                          (tech: string, index: number) => (
                            <div
                              key={index}
                              className="bg-[#f2b31d]/20 text-yellow-900 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center gap-2"
                            >
                              {tech}
                              <button
                                type="button"
                                // onClick={() => handleRemoveTechnology(tech)}
                                className="text-yellow-800 hover:text-yellow-900"
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
                        Technologies
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., React.js"
                          value={state.technology || ""}
                          onChange={(e) =>
                            handleFormChange("technology", e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              // handleAddTechnology();
                            }
                          }}
                          className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                        />
                        <Button
                          variant="outline"
                          type="button"
                          // onClick={handleAddTechnology}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {state.technologies?.map(
                          (tech: string, index: number) => (
                            <div
                              key={index}
                              className="bg-[#f2b31d]/20 text-yellow-900 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center gap-2"
                            >
                              {tech}
                              <button
                                type="button"
                                // onClick={() => handleRemoveTechnology(tech)}
                                className="text-yellow-800 hover:text-yellow-900"
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
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d] min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                  <Button
                    variant="outline"
                    onClick={() => setState({ isEditingProject: false })}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateProjects}
                    className="bg-[#f2b31d] hover:bg-[#d9a01a]"
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
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Publication
                  </h2>
                  <button
                    onClick={() => setState({ isEditingPublication: false })}
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
                          handleFormChange("publication_title", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                          handleFormChange("publication_journal", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                          handleFormChange("publication_volume", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                          handleFormChange("publication_issue", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Year
                      </label>
                      <Input
                        placeholder="e.g., 2023"
                        value={state.publication_year || ""}
                        onChange={(e) =>
                          handleFormChange("publication_year", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d] min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                  <Button
                    variant="outline"
                    onClick={() => setState({ isEditingPublication: false })}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updatePublication}
                    className="bg-[#f2b31d] hover:bg-[#d9a01a]"
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
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Achievements
                  </h2>
                  <button
                    onClick={() => setState({ isEditingAchievements: false })}
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
                          handleFormChange("achievement_title", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                          handleFormChange("organization", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
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
                          className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d]"
                        />
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                      {state.achievement_file && (
                        <div className="text-sm text-gray-600 mt-1">
                          Current file:{" "}
                          {typeof state.achievement_file === "string" ? (
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
                      className="border-gray-200 focus:border-[#f2b31d] focus:ring-[#f2b31d] min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                  <Button
                    variant="outline"
                    onClick={() => setState({ isEditingAchievements: false })}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateAchievement}
                    className="bg-[#f2b31d] hover:bg-[#d9a01a]"
                  >
                    Update
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>

    <Footer />
    </>
  );
}