"use client";

import Filterbar from "@/components/component/filterbar.component";
import useDebounce from "@/components/common-components/useDebounce";
import Breadcrumb from "@/components/common-components/Breadcrumb";

import { MOCK_JOBS } from "@/utils/constant.utils";
import {
  buildResumeFile,
  capitalizeFLetter,
  CharSlice,
  convertUrlToFile,
  Dropdown,
  Failure,
  generateMockJobs,
  getAvatarColor,
  getFileNameFromUrl,
  job_title,
  Success,
  useSetState,
} from "@/utils/function.utils";
import {
  MapPin,
  Search,
  Filter,
  ArrowLeft,
  Clock,
  DollarSign,
  Briefcase,
  GraduationCap,
  Star,
  Facebook,
  Twitter,
  Linkedin,
  X,
  Check,
  BriefcaseBusinessIcon,
  LogIn,
  UserPlus,
  Upload,
  Bookmark,
  Share2,
  IndianRupee,
  BookmarkCheck,
  Workflow,
  LayoutGrid,
  List,
  Building2,
  Mail,
  MailIcon,
  PhoneCall,
  Award,
  Building,
  ArrowRight,
  CrownIcon,
} from "lucide-react";
import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Modal from "@/components/common-components/modal";
import { Input } from "@/components/ui/input";
import TextArea from "@/components/common-components/textArea";
import CustomPhoneInput from "@/components/common-components/phoneInput";
import FileUpload from "@/components/common-components/fileUpload";
import { jobApplicationSchema } from "@/utils/validation.utils";
import * as Yup from "yup";
import Models from "@/imports/models.import";
import { JobCard } from "@/components/component/jobCard.component";
import { NewJobCard } from "@/components/component/newJobcard.component";
import PaginationCom from "@/components/component/PaginationCom";
import CustomSelect from "@/components/common-components/dropdown";
import CustomMultiSelect from "@/components/common-components/multi-select";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/common-components/new_components/Footer";

import { RWebShare } from "react-web-share";
import ChipFilters, {
  chipFiltersVisibleCount,
} from "@/components/component/chipFilters.component";
import LightboxGallery from "@/components/common-components/Lightbox.component";
import { set } from "date-fns";
import PaginationComTwo from "@/components/component/PaginationComTwo";
import SkeletonLoader from "./SkeletonLoader";
import FilterbarNew from "@/components/component/filterbarNew.component";
// import { Failure, Success } from "@/components/common-components/toast";
import { triggerLogout } from "@/utils/axios.utils";

type PromptSuggestionRow = {
  id: string;
  label: string;
  data: Record<string, unknown>;
  jobId?: number;
};

const PROMPT_SUGGESTIONS_UI_MAX = 15;

function clipPromptSuggestionsToMax(
  rows: PromptSuggestionRow[],
): PromptSuggestionRow[] {
  if (rows.length <= PROMPT_SUGGESTIONS_UI_MAX) return rows;
  return rows.slice(0, PROMPT_SUGGESTIONS_UI_MAX);
}

function normalizePromptLabel(s: string): string {
  return s.normalize("NFKD").replace(/\s+/g, " ").trim().toLowerCase();
}

/** Deterministic stringify for duplicate detection (sorted keys recursively). */
function stableStringifyForDedupe(val: unknown): string {
  if (val === null || typeof val !== "object") {
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return `[${val.map((x) => stableStringifyForDedupe(x)).join(",")}]`;
  }
  const obj = val as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys
    .map(
      (k) =>
        `${JSON.stringify(k)}:${stableStringifyForDedupe(obj[k] as unknown)}`,
    )
    .join(",")}}`;
}

function dedupePromptSuggestionRows(
  rows: PromptSuggestionRow[],
): PromptSuggestionRow[] {
  const seen = new Set<string>();
  const out: PromptSuggestionRow[] = [];
  for (const row of rows) {
    const key = `${normalizePromptLabel(row.label)}|${stableStringifyForDedupe(row.data ?? {})}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

/** Shorter labels first; longer `line6`-style strings last. */
function sortPromptRowsByAscendingLabelLength(
  rows: PromptSuggestionRow[],
): PromptSuggestionRow[] {
  return [...rows].sort((a, b) => {
    const d = a.label.length - b.label.length;
    if (d !== 0) return d;
    return normalizePromptLabel(a.label).localeCompare(
      normalizePromptLabel(b.label),
    );
  });
}

/** How many whitespace-separated tokens from `queryRaw` appear in `label`. */
function countQueryTokensMatchedInLabel(
  label: string,
  queryRaw: string,
): number {
  const nl = normalizePromptLabel(label);
  const tokens = normalizePromptLabel(queryRaw).split(/\s+/).filter(Boolean);
  if (!tokens.length) return 0;
  let n = 0;
  for (const t of tokens) {
    if (t.length && nl.includes(t)) n += 1;
  }
  return n;
}

/**
 * Prompt dropdown while user is typing: rows that contain more search tokens (e.g. "Chennai")
 * bubble to the top; ties use shorter labels like the initial list.
 */
function sortPromptRowsForActiveSearchQuery(
  rows: PromptSuggestionRow[],
  queryRaw: string,
): PromptSuggestionRow[] {
  const q = (queryRaw || "").trim();
  if (!q) return sortPromptRowsByAscendingLabelLength(rows);
  return [...rows].sort((a, b) => {
    const ta = countQueryTokensMatchedInLabel(a.label, q);
    const tb = countQueryTokensMatchedInLabel(b.label, q);
    if (tb !== ta) return tb - ta;
    const d = a.label.length - b.label.length;
    if (d !== 0) return d;
    return normalizePromptLabel(a.label).localeCompare(
      normalizePromptLabel(b.label),
    );
  });
}

/** One row per `display_name` line; deduped only (ordering applied by caller). */
function buildDedupedPromptJobsRows(jobs: any[]): PromptSuggestionRow[] {
  const rows: PromptSuggestionRow[] = [];
  if (!Array.isArray(jobs)) return rows;
  for (const job of jobs) {
    const list = Array.isArray(job?.display_name) ? job.display_name : [];
    let blockIndex = 0;
    for (const dn of list) {
      if (!dn || typeof dn !== "object") continue;
      const blob = dn as Record<string, unknown>;
      const data =
        blob.data && typeof blob.data === "object"
          ? (blob.data as Record<string, unknown>)
          : {};
      for (const [k, raw] of Object.entries(blob)) {
        if (k === "data") continue;
        if (!/^line\d+$/i.test(k)) continue;
        const label = String(raw ?? "").trim();
        if (!label) continue;
        rows.push({
          id: `${job?.id ?? "j"}-${blockIndex}-${k}-${rows.length}`,
          label,
          data,
          jobId: job?.id,
        });
      }
      blockIndex += 1;
    }
  }
  return dedupePromptSuggestionRows(rows);
}

/** Initial / prefetch: dedupe then sort by ascending label length. */
function flattenPromptJobsToRows(jobs: any[]): PromptSuggestionRow[] {
  return sortPromptRowsByAscendingLabelLength(buildDedupedPromptJobsRows(jobs));
}

function findBestPromptSuggestion(
  query: string,
  rows: PromptSuggestionRow[],
): PromptSuggestionRow | null {
  if (!rows.length) return null;
  const q = normalizePromptLabel(query);
  if (!q) return rows[0] ?? null;
  let best: PromptSuggestionRow | null = null;
  let bestScore = Infinity;

  const scorePair = (label: string) => {
    const t = normalizePromptLabel(label);
    if (t === q) return 0;
    if (t.includes(q)) return 4 + Math.abs(t.length - q.length) * 0.02;
    if (q.length >= 8 && q.includes(t)) return 10;
    const words = q.split(" ").filter(Boolean);
    if (words.length >= 2 && words.every((w) => t.includes(w))) return 18;
    return Infinity;
  };

  for (const row of rows) {
    const score = scorePair(row.label);
    if (score < bestScore) {
      bestScore = score;
      best = row;
    }
  }
  return Number.isFinite(bestScore) ? best : null;
}

/** Map AI `data` object (role_ids, college_id, …) into sidebar filter state. */
function applyPromptInsightToFilters(
  filters: any,
  data: Record<string, unknown>,
): any {
  const next = {
    ...filters,
    categories: [],
    locations: [],
    jobRole: [],
    department: [],
    colleges: [],
  };
  const has = Object.prototype.hasOwnProperty;

  if (has.call(data, "role_ids")) {
    const v = data.role_ids;
    next.jobRole = Array.isArray(v)
      ? v.map((x) => Number(x)).filter(Number.isFinite)
      : [];
  }
  if (has.call(data, "category_ids")) {
    const v = data.category_ids;
    next.categories = Array.isArray(v)
      ? v.map((x) => Number(x)).filter(Number.isFinite)
      : [];
  }
  if (has.call(data, "location_ids")) {
    const v = data.location_ids;
    next.locations = Array.isArray(v)
      ? v.map((x) => Number(x)).filter(Number.isFinite)
      : [];
  }
  if (has.call(data, "department_ids")) {
    const v = data.department_ids;
    next.department = Array.isArray(v)
      ? v.map((x) => Number(x)).filter(Number.isFinite)
      : [];
  }
  if (has.call(data, "college_id") && data.college_id != null) {
    const id = Number(data.college_id);
    next.colleges = Number.isFinite(id) ? [id] : [];
  }
  return next;
}

function JobSearchPromptSuggestions({
  open,
  rows,
  onPick,
  highlightedIndex,
  onHighlight,
}: {
  open: boolean;
  rows: PromptSuggestionRow[];
  onPick: (row: PromptSuggestionRow) => void;
  highlightedIndex: number;
  onHighlight: (index: number) => void;
}) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    if (highlightedIndex < 0) return;
    const item = itemRefs.current[highlightedIndex];
    if (!item) return;
    item.scrollIntoView({ block: "nearest" });
  }, [open, highlightedIndex, rows.length]);

  if (!open) return null;
  return (
    <div className="pointer-events-auto absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5 motion-safe:transition-[box-shadow]">
      <div className="min-h-[220px] max-h-[min(70vh,380px)] overflow-y-auto overscroll-contain scroll-smooth">
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            No suggestions yet. Try typing a job title or keyword.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 py-1">
            {rows.map((row, index) => (
              <li key={row.id}>
                <button
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  className={`flex w-full px-4 py-3 text-left text-sm text-slate-800 motion-safe:transition-colors ${
                    highlightedIndex === index
                      ? "bg-[#eff4ff]"
                      : "hover:bg-[#eff4ff]"
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onPick(row)}
                >
                  <span className="line-clamp-2">{row.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  const searchParams = useSearchParams();

  const router = useRouter();
  const jobSlugFromQuery = searchParams.get("slug");
  const jobIdRawFromQuery = searchParams.get("id");
  const jobIdFromQuery = (() => {
    const raw = `${jobIdRawFromQuery ?? ""}`.trim();
    if (!raw) return "";
    const m = raw.match(/^\d+/);
    return m?.[0] ?? "";
  })();
  const hasSimilarQuery = Boolean(jobSlugFromQuery && jobIdFromQuery);
  const searchParam = searchParams.get("search");
  const locationParam = searchParams.get("location");
  const collegeParam = searchParams.get("college");
  const jobRoleParam = searchParams.get("job-role");
  const jobcategoryParam = searchParams.get("job-category");
  const departmentParam = searchParams.get("department");

  const [state, setState] = useSetState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    resume: null,
    congratsOpen: false,
    loading: true,
    jobListLoading: false,
    isFetchingMore: false,
    page: 1,
    count: 0,
    jobList: [],
    similarJobs: null as any[] | null,
    similarJobLoading: hasSimilarQuery,
    next: null,
    prev: null,
    // search: "",
    search: searchParam || "",
    location: locationParam || null,
    sortBy: "",
    sortOrder: "",
    errors: {},
    jobID: null,
    collegeDetail: null,
    showCollegeModal: false,
    departmentDetail: null,
    showDepartmentModal: false,
    department_id: null,
    filterList: [],
    showApplyChoiceModal: false,
    isMessageEdited: false,
    masterDeptList: [],
    masterJobRoleList: [],
    college_id: null
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSaving, setIsSaving] = useState<number | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [isTabScreen, setIsTabScreen] = useState(false);
  const [isDesktopScreen, setIsDesktopScreen] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [preferredOnly, setPreferredOnly] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = !!localStorage.getItem("token");
    setIsLoggedIn(loggedIn);
    if (!loggedIn) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("openLoginModal"));
      }, 300);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // After login transition only — collegeIdRef is null means first login on this mount
  useEffect(() => {
    if (!isLoggedIn) return;
    if (collegeIdRef.current) return; // already fetched on mount
    userDetail().then(() => jobList(1));
  }, [isLoggedIn]);

  useEffect(() => {
    const handleLoginSuccess = () => {
      document.body.style.overflow = "";
      setIsLoggedIn(true);
    };
    window.addEventListener("loginSuccess", handleLoginSuccess);
    return () => window.removeEventListener("loginSuccess", handleLoginSuccess);
  }, []);

  const handlePreferredToggle = () => {
    const next = !preferredOnly;
    setPreferredOnly(next);
    jobList(1, false, next);
   
  };
  const [filters, setFilters] = useState({
    searchQuery: "",
    locations: locationParam ? [parseInt(locationParam, 10)] : [],
    categories: jobcategoryParam ? [parseInt(jobcategoryParam, 10)] : [],
    jobTypes: [],
    experienceLevels: [],
    datePosted: [],
    salaryRange: [],
    tags: [],
    experience: "",
    jobID: null,
    colleges: collegeParam ? [parseInt(collegeParam, 10)] : [],
    department: departmentParam ? [parseInt(departmentParam, 10)] : [],
    jobRole: jobRoleParam ? [parseInt(jobRoleParam, 10)] : [],
    jobRoleList: [],
    minExperience: "",
    maxExperience: "",
    academic_responsibilities: [],
  });

  const debouncedSearch = useDebounce(state.search, 500);

  const [promptSuggestions, setPromptSuggestions] = useState<
    PromptSuggestionRow[]
  >([]);
  const [promptSuggestionsHighlightIndex, setPromptSuggestionsHighlightIndex] =
    useState(-1);
  const [promptSuggestionsOpenMain, setPromptSuggestionsOpenMain] =
    useState(false);
  const [promptSuggestionsOpenSidebar, setPromptSuggestionsOpenSidebar] =
    useState(false);

  // Add this useEffect after your other useEffect hooks (around line 350-400)

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("jobs_page_visited");
    if (!hasVisited) {
      sessionStorage.setItem("jobs_page_visited", "true");
      return;
    }

    // Preserve all supported filter/query params on refresh.
    const allowedParams = new Set([
      "slug",
      "id",
      "search",
      "location",
      "college",
      "job-role",
      "job-category",
      "department",
    ]);

    const entries = Array.from(searchParams.entries());
    const hasUnknownParams = entries.some(([key]) => !allowedParams.has(key));

    // Remove only unknown params; keep slug/id and all supported filters.
    if (hasUnknownParams) {
      const cleaned = new URLSearchParams();
      entries.forEach(([key, value]) => {
        if (allowedParams.has(key)) cleaned.set(key, value);
      });
      const qs = cleaned.toString();
      router.replace(qs ? `/jobs?${qs}` : "/jobs");
      sessionStorage.removeItem("jobs_page_visited");
    }
  }, [searchParams, router]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("jobs_page_visited");
    };
  }, []);

  useEffect(() => {
    if (showApplicationModal && !state.isMessageEdited && state.jobDetail) {
      const collegeName =
        state.jobDetail?.college?.name ||
        state.jobDetail?.college?.college_name ||
        "[College Name]";
      let deptName = "[Department Name]";

      if (
        state.department_id &&
        Array.isArray(state.department_id) &&
        state.department_id.length > 0
      ) {
        const names = state.department_id
          .map((item: any) => {
            const id = typeof item === "object" ? item.value : item;
            return state.jobDetail?.department?.find((d: any) => d.id == id)
              ?.name;
          })
          .filter(Boolean);
        if (names.length > 0) deptName = names.join(", ");
      } else if (state.jobDetail?.department?.length === 1) {
        deptName = state.jobDetail.department[0].name;
      } else if (state.jobDetail?.department?.length > 0) {
        deptName = state.jobDetail.department[0].name;
      }

      const firstName = state.firstName || state.userDetail?.first_name || "";
      const lastName = state.lastName || state.userDetail?.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const userName = fullName || "[Your Name]";

      const title = capitalizeFLetter(job_title(state.jobDetail));

      const newMessage = `Dear HR,

I am writing to apply for the ${title} position at ${collegeName}, in the ${deptName} Department. I am interested in contributing my skills and supporting the team in achieving its goals.

I am a dedicated and responsible individual, willing to learn and adapt to new challenges. I am confident that I can perform my duties sincerely and contribute positively to the institution.

Thank you for considering my application.

Sincerely,
${userName}`;

      if (newMessage !== state.message) {
        setState({ message: newMessage });
      }
    }
  }, [
    state.firstName,
    state.lastName,
    state.department_id,
    showApplicationModal,
    state.jobDetail,
    state.isMessageEdited,
    state.userDetail,
  ]);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarWrapperRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const jobListContainerRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchBarWrapperRef = useRef<HTMLDivElement>(null);
  const jobListSidebarRef = useRef<HTMLDivElement>(null);
  const jobListSidebarWrapperRef = useRef<HTMLDivElement>(null);
  const jobDetailContainerRef = useRef<HTMLDivElement>(null);
  const jobListSidebarScrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const isIntentionalNav = useRef(false);
  const prevFilterBodyRef = useRef<string>("");
  const structuredSearchFreezeRef = useRef<{ keyword: string } | null>(null);
  /** Previous visible chip count; if any chip is removed, clear search text. */
  const prevVisibleChipCountRef = useRef(0);
  /** Skip one chip-decrease clear after suggestion apply. */
  const suppressChipClearOnNextFilterSyncRef = useRef(false);
  /** Enter-typed query mode: `bodyData` should send only `search`. */
  const strictSearchOnlyModeRef = useRef(false);
  const promptJobsCacheRef = useRef<any[]>([]);
  /** Prefetched once: `jobs/search?limit=10` (no `prompt`; API 400 on empty `prompt=`) — shown on focus without API. */
  const promptEmptyPrefetchRef = useRef<any[]>([]);
  const promptSuggestPopoverMainRef = useRef<HTMLDivElement | null>(null);
  const promptSuggestPopoverSidebarRef = useRef<HTMLDivElement | null>(null);
  /** Read in mount prefetch resolver so list fills when API returns after fast focus. */
  const promptSuggestAnyOpenRef = useRef(false);
  const searchTrimForSuggestionsRef = useRef("");
  /** Stable invoker for prompt Enter — avoids hook deps on a re-created `jobList`. */
  const promptJobListInvokerRef = useRef<any>(null);

  promptSuggestAnyOpenRef.current =
    promptSuggestionsOpenMain || promptSuggestionsOpenSidebar;
  searchTrimForSuggestionsRef.current = (state.search || "").trim();

  const filtersRef = useRef(filters);
  filtersRef.current = filters; // always sync, no useEffect needed

  const collegeIdRef = useRef<any>(null);

  useEffect(() => {
    const f = structuredSearchFreezeRef.current;
    if (!f) return;
    const left = (debouncedSearch ?? "").trim();
    const right = (f.keyword ?? "").trim();
    if (left === right) structuredSearchFreezeRef.current = null;
  }, [debouncedSearch]);

  const chipFiltersSyncContext = useMemo(
    () => ({
      categoryList: state?.categoryList,
      jobTypeList: state?.jobTypeList,
      experienceList: state?.experienceList,
      salaryRangeList: state?.salaryRangeList,
      tagsList: state?.tagsList,
      collegeList: state?.collegeList,
      datePostedList: state?.datePostedList,
      locationList: state?.locationList,
      deptList: state?.masterDeptList,
      jobRoleList: state?.masterJobRoleList,
      academicResponsibilityList: state?.academicResponsibilityList ?? [],
    }),
    [
      state?.categoryList,
      state?.jobTypeList,
      state?.experienceList,
      state?.salaryRangeList,
      state?.tagsList,
      state?.collegeList,
      state?.datePostedList,
      state?.locationList,
      state?.masterDeptList,
      state?.masterJobRoleList,
      state?.academicResponsibilityList,
    ],
  );

  useEffect(() => {
    const visibleChipCount = chipFiltersVisibleCount(
      filters,
      chipFiltersSyncContext,
    );
    if (suppressChipClearOnNextFilterSyncRef.current) {
      suppressChipClearOnNextFilterSyncRef.current = false;
      prevVisibleChipCountRef.current = visibleChipCount;
      return;
    }
    if (visibleChipCount < prevVisibleChipCountRef.current) {
      structuredSearchFreezeRef.current = null;
      setState({ search: "" });
    }
    prevVisibleChipCountRef.current = visibleChipCount;
  }, [filters, chipFiltersSyncContext, setState]);

  useEffect(() => {
    const handleScroll = () => {
      const sidebar = sidebarRef.current;
      const wrapper = sidebarWrapperRef.current;
      const footer = footerRef.current;
      const jobListContainer = jobListContainerRef.current;
      const searchBar = searchBarRef.current;
      const searchBarWrapper = searchBarWrapperRef.current;

      if (!sidebar || !wrapper || !footer || !jobListContainer || !searchBar)
        return;

      // Ensure the job list container is at least as tall as the sidebar
      // to prevent the footer from coming up too early on short content.
      jobListContainer.style.minHeight = `${sidebar.offsetHeight}px`;

      const offset = 100;

      const wrapperRect = wrapper.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();

      const sidebarHeight = sidebar.offsetHeight;

      const startSticky = wrapperRect.top <= offset;
      const reachFooter = footerRect.top <= sidebarHeight + offset;

      if (startSticky && !reachFooter) {
        sidebar.style.position = "fixed";
        sidebar.style.top = offset + "px";
        sidebar.style.width = wrapper.offsetWidth + "px";
      } else if (reachFooter) {
        sidebar.style.position = "absolute";
        sidebar.style.top = wrapper.offsetHeight - sidebarHeight + "px";
        sidebar.style.width = wrapper.offsetWidth + "px";
      } else {
        sidebar.style.position = "relative";
        sidebar.style.top = "0px";
        sidebar.style.width = "auto";
      }

      // Search Bar Sticky Logic
      if (searchBar && searchBarWrapper) {
        const searchBarHeight = searchBar.offsetHeight;
        const containerRect = jobListContainer.getBoundingClientRect();
        const searchWrapperRect = searchBarWrapper.getBoundingClientRect();

        // Use the same offset or adjust as needed
        const startStickySearch = containerRect.top <= offset;
        const reachFooterSearch = footerRect.top <= searchBarHeight + offset;

        if (startStickySearch) {
          searchBarWrapper.style.height = `${searchBarHeight}px`; // Prevent layout shift
          if (!reachFooterSearch) {
            searchBarWrapper.style.position = "fixed";
            searchBarWrapper.style.top = `${offset}px`;
            searchBarWrapper.style.left = `${searchWrapperRect.left}px`;
            searchBarWrapper.style.width = `${searchWrapperRect.width}px`;
            searchBarWrapper.style.zIndex = "50";
            searchBar.style.position = "relative";
            searchBar.style.top = "0px";
            searchBar.style.width = "100%";
            searchBar.style.backgroundColor = "white";

            // Fade out job cards scrolling behind the search bar
            const searchBarHeight = searchBar.offsetHeight;
            const searchBarTop = offset - 30;
            const searchBarBottom = searchBarTop + searchBarHeight;

            const jobCards =
              jobListContainer.querySelectorAll(".job-card-item");
            jobCards.forEach((card) => {
              const cardEl = card as HTMLElement;
              const cardRect = cardEl.getBoundingClientRect();
              const startFadePosition = searchBarTop;
              const endFadePosition = searchBarTop - searchBarHeight; // Fade out as it goes behind the search bar
              const transitionZone = startFadePosition - endFadePosition;

              if (cardRect.top < startFadePosition) {
                const opacity = Math.max(
                  0.6,
                  Math.min(
                    1,
                    (cardRect.top - endFadePosition) / transitionZone,
                  ),
                );
                const blur = (1 - opacity) * 4;

                cardEl.style.opacity = opacity.toString();
                cardEl.style.filter = `blur(${blur}px)`;
                cardEl.style.transition =
                  "opacity 0.09s linear, filter 0.05s linear";

                if (opacity < 0.1) {
                  cardEl.style.pointerEvents = "none";
                } else {
                  cardEl.style.pointerEvents = "auto";
                }
              } else {
                cardEl.style.opacity = "1";
                cardEl.style.filter = "none";
                cardEl.style.pointerEvents = "auto";
              }
            });
          } else {
            // Keep fixed near footer too; only adjust `top` so dropdown anchor stays stable.
            const footerSafeTop = Math.max(
              16,
              footerRect.top - searchBarHeight - 8,
            );
            searchBarWrapper.style.position = "fixed";
            searchBarWrapper.style.top = `${footerSafeTop}px`;
            searchBarWrapper.style.left = `${searchWrapperRect.left}px`;
            searchBarWrapper.style.width = `${searchWrapperRect.width}px`;
            searchBarWrapper.style.zIndex = "50";
            searchBar.style.position = "relative";
            searchBar.style.top = "0px";
            searchBar.style.width = "100%";
            searchBar.style.backgroundColor = "white";
          }
        } else {
          searchBarWrapper.style.height = "auto";
          searchBarWrapper.style.position = "relative";
          searchBarWrapper.style.top = "0px";
          searchBarWrapper.style.left = "0px";
          searchBarWrapper.style.width = "auto";
          searchBarWrapper.style.zIndex = "";
          searchBar.style.position = "relative";
          searchBar.style.top = "0px";
          searchBar.style.width = "auto";
          searchBar.style.backgroundColor = "";

          // Reset job card styles when search bar is not sticky
          const jobCards = jobListContainer.querySelectorAll(".job-card-item");
          jobCards.forEach((card) => {
            const cardEl = card as HTMLElement;
            cardEl.style.opacity = "1";
            cardEl.style.filter = "none";
            cardEl.style.pointerEvents = "auto";
          });
        }
      }
    };

    // Using ResizeObserver to handle sidebar height changes (e.g. accordion collapse/expand)
    // and recalculate scroll logic.
    const resizeObserver = new ResizeObserver(handleScroll);
    if (sidebarRef.current) {
      resizeObserver.observe(sidebarRef.current);
    }
    if (searchBarWrapperRef.current) {
      resizeObserver.observe(searchBarWrapperRef.current);
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call to set position correctly

    return () => {
      window.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [state.loading]);

  useEffect(() => {
    // This effect is for the two-column layout (desktop, job selected)
    if (!isDesktopScreen || !selectedJob) return;

    const handleStickyJobList = () => {
      const sidebar = jobListSidebarRef.current;
      const wrapper = jobListSidebarWrapperRef.current;
      const footer = footerRef.current;
      const jobDetailContainer = jobDetailContainerRef.current;

      if (!sidebar || !wrapper || !footer || !jobDetailContainer) return;

      // This is important for the absolute positioning at the end.
      wrapper.style.minHeight = `${jobDetailContainer.offsetHeight}px`;

      const offset = 100; // As requested for "top 100"
      const wrapperRect = wrapper.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const sidebarHeight = sidebar.offsetHeight;

      const startSticky = wrapperRect.top <= offset;
      const reachFooter = footerRect.top <= sidebarHeight + offset;

      if (startSticky && !reachFooter) {
        sidebar.style.position = "fixed";
        sidebar.style.top = `${offset}px`;
        sidebar.style.bottom = "auto";
        sidebar.style.width = `${wrapper.offsetWidth}px`;
      } else if (reachFooter) {
        sidebar.style.position = "absolute";
        sidebar.style.top = "auto";
        sidebar.style.bottom = "0px";
        sidebar.style.width = `${wrapper.offsetWidth}px`;
      } else {
        sidebar.style.position = "relative";
        sidebar.style.top = "0px";
        sidebar.style.bottom = "auto";
        sidebar.style.width = "auto";
      }
    };

    const resizeObserver = new ResizeObserver(handleStickyJobList);
    if (jobListSidebarRef.current)
      resizeObserver.observe(jobListSidebarRef.current);
    if (jobDetailContainerRef.current)
      resizeObserver.observe(jobDetailContainerRef.current);
    if (footerRef.current) resizeObserver.observe(footerRef.current);

    window.addEventListener("scroll", handleStickyJobList);
    handleStickyJobList();

    return () => {
      window.removeEventListener("scroll", handleStickyJobList);
      resizeObserver.disconnect();
    };
  }, [isDesktopScreen, selectedJob, state.loading]);

  useLayoutEffect(() => {
    if (isDesktopScreen && selectedJob && showJobDetail) {
      const scrollContainer = jobListSidebarScrollContainerRef.current;
      const jobElement = document.getElementById(
        `job-list-item-${selectedJob.id}`,
      );

      if (scrollContainer && jobElement) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = jobElement.getBoundingClientRect();
        const offset = elementRect.top - containerRect.top;

        scrollContainer.scrollTo({
          top: scrollContainer.scrollTop + offset,
          behavior: "smooth",
        });
      }
    }
  }, [selectedJob, showJobDetail, isDesktopScreen]);
  const initialFiltersRef = useRef(filters);

  const isFilterApplied = () => {
    return (
      JSON.stringify(filters) !== JSON.stringify(initialFiltersRef.current)
    );
  };

  useEffect(() => {
    if (selectedJob && isTabScreen) {
      setTimeout(() => setIsAnimating(true), 100);
    }
  }, [selectedJob, isTabScreen]);

  useEffect(() => {
    userDetail().then(() => {
      locationList();
      jobTypeList();
      filterList();
      masterExperienceList();
      masterDeptList();
      masterJobRoleList();
      if (hasSimilarQuery) {
        similarJob();
      } else {
        jobList(1);
      }
    });
  }, []);

  useEffect(() => {
    const query = searchParam || "";
    if (query !== state.search) {
      setState({ search: query });
    }
  }, [searchParam]);

  useEffect(() => {
    const locationQuery = locationParam ? [parseInt(locationParam, 10)] : [];
    if (JSON.stringify(locationQuery) !== JSON.stringify(filters.locations)) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        locations: locationQuery,
      }));
    }
  }, [locationParam]);

  useEffect(() => {
    const collegeQuery = collegeParam ? [parseInt(collegeParam, 10)] : [];
    if (
      filters.colleges.length !== collegeQuery.length ||
      (collegeQuery.length > 0 && filters.colleges[0] !== collegeQuery[0])
    ) {
      setFilters((prevFilters) => ({ ...prevFilters, colleges: collegeQuery }));
    }
  }, [collegeParam]);

  useEffect(() => {
    const jobRoleQuery = jobRoleParam ? [parseInt(jobRoleParam, 10)] : [];
    if (
      filters.jobRole.length !== jobRoleQuery.length ||
      (jobRoleQuery.length > 0 && filters.jobRole[0] !== jobRoleQuery[0])
    ) {
      setFilters((prevFilters) => ({ ...prevFilters, jobRole: jobRoleQuery }));
    }
  }, [jobRoleParam]);

  useEffect(() => {
    const jobCategoryQuery = jobcategoryParam
      ? [parseInt(jobcategoryParam, 10)]
      : [];
    if (
      filters.categories.length !== jobCategoryQuery.length ||
      (jobCategoryQuery.length > 0 &&
        filters.categories[0] !== jobCategoryQuery[0])
    ) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        categories: jobCategoryQuery,
      }));
    }
  }, [jobcategoryParam]);

  useEffect(() => {
    const departmentQuery = departmentParam
      ? [parseInt(departmentParam, 10)]
      : [];
    if (
      filters.department.length !== departmentQuery.length ||
      (departmentQuery.length > 0 &&
        filters.department[0] !== departmentQuery[0])
    ) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        department: departmentQuery,
      }));
    }
  }, [departmentParam]);

  // Filter change effect - runs when filters actually change
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      // Store the initial body
      prevFilterBodyRef.current = JSON.stringify(bodyData());
      return;
    }

    const currentBody = JSON.stringify(bodyData());

    // Only call API if the filter body has actually changed
    if (currentBody !== prevFilterBodyRef.current) {
      prevFilterBodyRef.current = currentBody;
      if (hasSimilarQuery) {
        similarJob();
      } else {
        jobList(1);
      }
      filterList();
    }
  }, [
    hasSimilarQuery,
    debouncedSearch,
    filters?.categories,
    filters.locations,
    filters.jobTypes,
    filters.experienceLevels,
    filters.datePosted,
    filters.salaryRange,
    filters?.tags,
    filters?.colleges,
    filters?.department,
    filters?.jobRole,
    filters?.academic_responsibilities,
  ]);

  const categoryList = async () => {
    try {
      const res: any = await Models.category.list();
      const dropdown = Dropdown(res?.results, "name");
      setState({
        categoryList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const filterList = async () => {
    if (!collegeIdRef.current || !Array.isArray(collegeIdRef.current) || collegeIdRef.current.length === 0) return;
    try {
      const body = bodyData();
      const res: any = await Models.job.filterList(body);
      const locationList =
        res?.data?.locations?.map((item) => ({
          value: item.id,
          label: item.city,
          job_count: item.job_count,
        })) || [];

      // Keep selected locations stable; backend facet truncation should not silently drop chips.

      const deptList =
        res?.data?.departments?.map((item) => ({
          value: item.id,
          label: item.department_name,
          job_count: item.job_count,
        })) || [];

      // Keep selected departments stable; avoid auto-removing chips on facet updates.

      const collegeList = res?.data?.colleges?.map((item) => ({
        value: item.id,
        label: item.college_name,
        job_count: item.job_count,
      }));
      const categoryList = res?.data?.job_categories?.map((item) => ({
        value: item.id,
        label: item.name,
        job_count: item.job_count,
      }));
      const jobRoleList = res?.data?.job_roles?.map((item) => ({
        value: item.id,
        label: item.role_name,
        job_count: item.job_count,
      }));

      const experienceList = res?.data?.experiences?.map((item) => ({
        value: item.name,
        label: item.name,
      }));

      const academicResponsibilityList =
        res?.data?.additional_academic_responsibilities?.map((item) => ({
          value: item.id,
          label: item.responsibility_title,
          job_count: item.job_count,
        }));

      setState({
        filterList: res?.data,
        filterExperienceRaw: res?.data?.experiences ?? [],
        locationList,
        collegeList,
        deptList,
        categoryList,
        jobRoleList,
        experienceList,
        academicResponsibilityList,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const locationList = async () => {
    try {
      const res: any = await Models.location.list(1);
      const dropdown = Dropdown(res?.results, "city");
      setState({
        locationList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const jobTypeList = async () => {
    try {
      const res: any = await Models.jobtype.list();
      const dropdown = Dropdown(res?.results, "name");
      setState({
        jobTypeList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const masterExperienceList = async () => {
    try {
      let page = 1;
      let allResults: any[] = [];
      let hasNext = true;

      while (hasNext) {
        const res: any = await Models.masterExperience.list(page);

        if (res?.results?.length) {
          allResults = [...allResults, ...res.results];
        }

        // ✅ Works for both cases (now + future)
        hasNext = !!res?.next;
        page++;

        // 🛑 Safety break (if backend doesn't paginate yet)
        if (!res?.next) break;
      }

      const dropdown = allResults.map((item: any) => ({
        value: item.name,
        label: item.name,
      }));

      setState({
        masterExperienceList: dropdown,
        masterExperienceRaw: allResults, // raw with id, name for range matching
      });
    } catch (error) {
      console.log("Error fetching experience list:", error);
    }
  };

  const collegeList = async () => {
    try {
      const body = {
        pagination: "No",
      };
      const res: any = await Models.colleges.collegeList(body);
      const dropdown = Dropdown(res?.results, "college_name");

      setState({
        collegeList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const departmentList = async () => {
    try {
      const body = {
        pagination: "No",
      };
      const res: any = await Models.department.list(body);
      const dropdown = Dropdown(res?.results, "department_name");

      setState({
        deptList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const DatePosted = async () => {
    try {
      const datePosted = [
        { value: "24h", label: "Last 24 hours" },
        { value: "7d", label: "Last 7 days" },
        { value: "15d", label: "Last 15 days" },
        { value: "30d", label: "Last 30 days" },
        { value: "last-mon", label: "Last Month" },
        // { value: "all", label: "All" },
      ];

      setState({
        datePostedList: datePosted,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const salaryRangeList = async () => {
    try {
      const res: any = await Models.salaryRange.list();
      const dropdown = Dropdown(res?.results, "name");
      setState({
        salaryRangeList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const tagsList = async () => {
    try {
      const res: any = await Models.jobtags.list();
      const dropdown = Dropdown(res?.results, "name");
      setState({
        tagsList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const masterDeptList = async () => {
    try {
      let page = 1;
      let hasNext = true;
      let allResults: any[] = [];

      while (hasNext) {
        const res: any = await Models.department.masterDep({
          page,
          has_jobs: true,
        });

        if (res?.results?.length) {
          allResults = [...allResults, ...res.results];
        }

        hasNext = !!res?.next; // 👈 check next page
        page++; // 👈 increment page
      }

      const dropdown =
        allResults?.map((item: any) => ({
          value: item?.id,
          label:
            item?.department_name ||
            item?.name ||
            item?.label ||
            `${item?.id ?? ""}`,
        })) ?? [];

      setState({
        masterDeptList: dropdown,
      });
    } catch (error) {
      console.error("Error fetching master departments:", error);
    }
  };

  const masterJobRoleList = async () => {
    try {
      let page = 1;
      let allResults: any[] = [];
      let hasNext = true;
      while (hasNext) {
        const res: any = await Models.category.jobRoleList(page);
        if (res?.results?.length) {
          allResults = [...allResults, ...res.results];
        }
        hasNext = !!res?.next;
        page++;
      }
      const dropdown = Dropdown(allResults, "role_name");
      setState({
        masterJobRoleList: dropdown,
      });
    } catch (error) {
      console.error("Error fetching master job roles:", error);
    }
  };

  const jobList = async (
    page = 1,
    append = false,
    preferred = preferredOnly,
  ) => {
    // Never call job list API without college_id
    if (!collegeIdRef.current || !Array.isArray(collegeIdRef.current) || collegeIdRef.current.length === 0) return;
    try {
      if (append) {
        setState({ isFetchingMore: true });
      } else {
        setState({ jobListLoading: true });
      }

      const body = bodyData();
      console.log("body", body);
      
      if (preferred) body.preferred_jobs = true;

      const res: any = await Models.job.list(page, body);
      setState({
        loading: false, // For initial load
        jobListLoading: false,
        isFetchingMore: false,
        count: res?.count,
        jobList: append
          ? [...state.jobList, ...(res?.results || [])]
          : res?.results || [],
        next: res?.next,
        prev: res?.previous,
        page: page,
      });
    } catch (error) {
      setState({ loading: false, jobListLoading: false });
      // Failure("Failed to fetch jobs");
    }
  };
  promptJobListInvokerRef.current = jobList;

  const applyEmptyPromptSuggestionsFromCache = useCallback(() => {
    const jobs = promptEmptyPrefetchRef.current;
    promptJobsCacheRef.current = jobs;
    setPromptSuggestions(
      clipPromptSuggestionsToMax(flattenPromptJobsToRows(jobs)),
    );
  }, []);

  /** Non-empty query only hits the network; empty uses mount prefetch. */
  const fetchPromptSuggestionsForQuery = useCallback(
    async (raw: string) => {
      const q = (raw || "").trim();
      if (!q) {
        applyEmptyPromptSuggestionsFromCache();
        return;
      }
      try {
        const res: any = await Models.job.prompt_job({
          prompt: q,
          limit: 10,
        });
        const jobs = Array.isArray(res?.data) ? res.data : [];
        const deduped = buildDedupedPromptJobsRows(jobs);
        const rows = sortPromptRowsForActiveSearchQuery(deduped, q);
        if (!rows.length) {
          applyEmptyPromptSuggestionsFromCache();
          return;
        }
        promptJobsCacheRef.current = jobs;
        setPromptSuggestions(clipPromptSuggestionsToMax(rows));
      } catch {
        applyEmptyPromptSuggestionsFromCache();
      }
    },
    [applyEmptyPromptSuggestionsFromCache],
  );

  /** Refocus same field: `onFocus` does not run; `onMouseDown` still opens the list. */
  const openSidebarPromptSuggestionsFromValue = useCallback(
    (raw: string) => {
      setPromptSuggestionsOpenSidebar(true);
      setPromptSuggestionsOpenMain(false);
      const v = (raw || "").trim();
      if (!v) applyEmptyPromptSuggestionsFromCache();
      else void fetchPromptSuggestionsForQuery(v);
    },
    [applyEmptyPromptSuggestionsFromCache, fetchPromptSuggestionsForQuery],
  );

  const openMainPromptSuggestionsFromValue = useCallback(
    (raw: string) => {
      setPromptSuggestionsOpenMain(true);
      setPromptSuggestionsOpenSidebar(false);
      const v = (raw || "").trim();
      if (!v) applyEmptyPromptSuggestionsFromCache();
      else void fetchPromptSuggestionsForQuery(v);
    },
    [applyEmptyPromptSuggestionsFromCache, fetchPromptSuggestionsForQuery],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res: any = await Models.job.prompt_job({
          prompt: "",
          limit: 10,
        });
        if (cancelled) return;
        const jobs = Array.isArray(res?.data) ? res.data : [];
        promptEmptyPrefetchRef.current = jobs;
        promptJobsCacheRef.current = jobs;
        if (
          promptSuggestAnyOpenRef.current &&
          searchTrimForSuggestionsRef.current === ""
        ) {
          setPromptSuggestions(
            clipPromptSuggestionsToMax(flattenPromptJobsToRows(jobs)),
          );
        }
      } catch {
        if (!cancelled) promptEmptyPrefetchRef.current = [];
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePromptSuggestionPick = useCallback(
    (row: PromptSuggestionRow) => {
      // Show chosen line in the box; suppress keyword search in list API (`bodyData` uses freeze).
      strictSearchOnlyModeRef.current = false;
      suppressChipClearOnNextFilterSyncRef.current = true;
      structuredSearchFreezeRef.current = { keyword: "" };
      setFilters((prev) => applyPromptInsightToFilters(prev, row.data));
      setState({ search: row.label });
      setPromptSuggestionsHighlightIndex(-1);
      setPromptSuggestionsOpenMain(false);
      setPromptSuggestionsOpenSidebar(false);
    },
    [setFilters, setState],
  );

  const handlePromptSearchCommit = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      setPromptSuggestionsHighlightIndex(-1);
      setPromptSuggestionsOpenMain(false);
      setPromptSuggestionsOpenSidebar(false);
      if (!q) {
        strictSearchOnlyModeRef.current = false;
        structuredSearchFreezeRef.current = null;
        setState({ search: "" });
        await promptJobListInvokerRef.current?.(1);
        return;
      }

      // If current value comes from a picked suggestion, keep suggestion-filter mode.
      if (
        structuredSearchFreezeRef.current?.keyword === "" &&
        q === (state.search || "").trim()
      ) {
        strictSearchOnlyModeRef.current = false;
        await promptJobListInvokerRef.current?.(1);
        return;
      }

      // Enter key must use exactly what user typed; no auto-pick from suggestion rows.
      strictSearchOnlyModeRef.current = true;
      structuredSearchFreezeRef.current = { keyword: q };
      setState({ search: q });
      await promptJobListInvokerRef.current?.(1);
    },
    [setState, state.search],
  );

  const handlePromptInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isOpen = promptSuggestionsOpenMain || promptSuggestionsOpenSidebar;
      if (!isOpen || promptSuggestions.length === 0) {
        if (e.key === "Enter") {
          e.preventDefault();
          void handlePromptSearchCommit((e.target as HTMLInputElement).value);
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setPromptSuggestionsHighlightIndex((prev) =>
          prev < 0 ? 0 : Math.min(prev + 1, promptSuggestions.length - 1),
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setPromptSuggestionsHighlightIndex((prev) =>
          prev <= 0 ? promptSuggestions.length - 1 : prev - 1,
        );
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (promptSuggestionsHighlightIndex >= 0) {
          const chosen = promptSuggestions[promptSuggestionsHighlightIndex];
          if (chosen) {
            handlePromptSuggestionPick(chosen);
            return;
          }
        }
        void handlePromptSearchCommit((e.target as HTMLInputElement).value);
      }
    },
    [
      promptSuggestionsOpenMain,
      promptSuggestionsOpenSidebar,
      promptSuggestions,
      promptSuggestionsHighlightIndex,
      handlePromptSuggestionPick,
      handlePromptSearchCommit,
    ],
  );

  useEffect(() => {
    setPromptSuggestionsHighlightIndex(-1);
  }, [promptSuggestions]);

  // Typing: debounced by `state.search`; empty → cached `prompt=""` data only (no API).
  useEffect(() => {
    if (!promptSuggestionsOpenMain && !promptSuggestionsOpenSidebar) return;
    const q = (state.search || "").trim();
    const t = window.setTimeout(() => {
      if (!q) applyEmptyPromptSuggestionsFromCache();
      else void fetchPromptSuggestionsForQuery(q);
    }, 200);
    return () => window.clearTimeout(t);
  }, [
    state.search,
    promptSuggestionsOpenMain,
    promptSuggestionsOpenSidebar,
    applyEmptyPromptSuggestionsFromCache,
    fetchPromptSuggestionsForQuery,
  ]);

  useEffect(() => {
    if (!promptSuggestionsOpenMain && !promptSuggestionsOpenSidebar) return;
    const onDocDown = (e: MouseEvent) => {
      const el = e.target as Node;
      if (promptSuggestPopoverMainRef.current?.contains(el)) return;
      if (promptSuggestPopoverSidebarRef.current?.contains(el)) return;
      setPromptSuggestionsOpenMain(false);
      setPromptSuggestionsOpenSidebar(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [promptSuggestionsOpenMain, promptSuggestionsOpenSidebar]);

  useEffect(() => {
    const handleInfiniteScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 800
      ) {
        if (state.next && !state.isFetchingMore && !state.loading) {
          jobList(state.page + 1, true);
        }
      }
    };

    window.addEventListener("scroll", handleInfiniteScroll);
    return () => window.removeEventListener("scroll", handleInfiniteScroll);
  }, [state.next, state.isFetchingMore, state.loading, state.page]);

  const jobDetail = async (jobId) => {
    try {
      setState({ loading: true });

      const res: any = await Models.job.details(jobId);

      const responsibilities =
        res?.responsibility?.blocks?.flatMap((block) => {
          if (block.type === "list") {
            return block.data.items.map((item) => ({
              type: "list",
              text: item,
            }));
          }

          if (block.type === "paragraph") {
            return [{ type: "paragraph", text: block.data.text }];
          }

          return [];
        }) || [];

      const new_description =
        res?.new_job_qualification?.blocks?.flatMap((block) => {
          if (block.type === "list") {
            return block.data.items.map((item) => ({
              type: "list",
              text: item,
            }));
          }

          if (block.type === "paragraph") {
            return [{ type: "paragraph", text: block.data.text }];
          }

          return [];
        }) || [];

      setState({
        loading: false,
        jobDetail: res,
        responsibilities: responsibilities || null,
        new_job_qualification: new_description || null,
      });

      return res;
    } catch (error) {
      setState({ loading: false });
      // Failure("Failed to fetch jobs");
    }
  };

  const similarJob = async (job = null) => {
    if (!collegeIdRef.current || !Array.isArray(collegeIdRef.current) || collegeIdRef.current.length === 0) return;
    console.log("jobId", job);
    setState({ similarJobLoading: true });
    try {
      const body: any = {
        id: job?.id || jobIdFromQuery,
        slug: job?.slug || jobSlugFromQuery,
        ...bodyData(),
      };
      if (debouncedSearch) body.search = debouncedSearch;

      const res: any = await Models.job.similar_job(body);
      console.log("similarJob", res);
      setState({
        similarJobs: res?.results ?? [],
        similarJobLoading: false,
      });
    } catch (error) {
      console.log("error", error);
      setState({ similarJobs: [], similarJobLoading: false });
    }
  };

  const jobSidebarLoading = hasSimilarQuery
    ? state.similarJobLoading
    : state.jobListLoading;
  const showSimilarJobsEmpty =
    hasSimilarQuery &&
    !state.similarJobLoading &&
    Array.isArray(state.similarJobs) &&
    state.similarJobs.length === 0;
  const jobSidebarList = hasSimilarQuery ? state.similarJobs : state.jobList;

  useEffect(() => {
    if (hasSimilarQuery) {
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Fetch job detail directly using the ID
      setState({ jobID: jobIdFromQuery });
      jobDetail(jobIdFromQuery).then((res) => {
        if (res) {
          setSelectedJob(res);
          setShowJobDetail(true);
        }
      });
      similarJob();
      return;
    }
    // Leaving detail query (`slug` + `id`) back to plain `/jobs` should rehydrate list mode.
    setSelectedJob(null);
    setShowJobDetail(false);
    setState({
      jobID: null,
      similarJobs: null,
      similarJobLoading: false,
    });
    void jobList(1);
    void filterList();
  }, [hasSimilarQuery, jobIdFromQuery]);

  useEffect(() => {
    const checkPendingApply = () => {
      const profileStr = localStorage.getItem("user");
      if (!profileStr) return;

      const profile = JSON.parse(profileStr);
      const pendingJobId = sessionStorage.getItem("pending_apply_job_id");

      if (profile?.id && pendingJobId && state.jobDetail?.id == pendingJobId) {
        sessionStorage.removeItem("pending_apply_job_id");
        setState({ jobID: state.jobDetail.id });
        const departmentIds =
          state.jobDetail?.department?.length === 1
            ? [state.jobDetail.department[0].id]
            : [];
        handleFormSubmitWithprofile(profile.id, departmentIds);
      }
    };

    window.addEventListener("focus", checkPendingApply);
    window.addEventListener("loginSuccess", checkPendingApply);
    return () => {
      window.removeEventListener("focus", checkPendingApply);
      window.removeEventListener("loginSuccess", checkPendingApply);
    };
  }, [state.jobDetail]);

  const handleApply = () => {
    const profile = JSON.parse(localStorage.getItem("user"));
    const userId = profile?.id;

    if (state.jobDetail?.apply_link) {
      window.open(state.jobDetail.apply_link, "_blank");
      return;
    }

    const departmentIds =
      state.jobDetail?.department?.length === 1
        ? [state.jobDetail.department[0].id]
        : [];

    if (profile) {
      handleFormSubmitWithprofile(userId, departmentIds);
    } else {
      setState({ showApplyChoiceModal: true, department_id: departmentIds });
    }
  };

  const handleLoginRedirect = () => {
    setState({ showApplyChoiceModal: false });
    sessionStorage.setItem("pending_apply_job_id", state.jobDetail?.id);
    window.dispatchEvent(new CustomEvent("openLoginModal"));
  };

  const handleRegisterRedirect = () => {
    setState({ showApplyChoiceModal: false });
    sessionStorage.setItem("pending_apply_job_id", state.jobDetail?.id);
    window.dispatchEvent(new CustomEvent("openRegisterModal"));
  };

  const handleContinueAsGuest = () => {
    const departmentIds =
      state.jobDetail?.department?.length === 1
        ? [state.jobDetail.department[0].id]
        : [];

    const newState: any = {
      showApplyChoiceModal: false,
      colleges:
        state.jobDetail?.college?.name ||
        state.jobDetail?.college?.college_name ||
        "",
      department_id: departmentIds,
      errors: {},
      isMessageEdited: false,
    };
    setState(newState);
    setShowApplicationModal(true);
  };

  const handleFormSubmitWithprofile = async (userId, deptIds = []) => {
    try {
      const res: any = await Models.profile.details(userId);

      setState({
        userDetail: res,
        firstName: res.first_name,
        lastName: res.last_name,
        phone: res.phone,
        message: "",
        colleges:
          state.jobDetail?.college?.name ||
          state.jobDetail?.college?.college_name ||
          "",
        resume: await buildResumeFile(res.resume_url, `${res.username} Resume`),
        email: res.email?.trim(),
        experience: res.experience,
        department_id: deptIds,
        isMessageEdited: false,
      });
      setShowApplicationModal(true);
    } catch (error) {
      console.log("error", error);

      // Failure("Failed to fetch jobs");
    }
  };

  const handleSaveToggle = async (job) => {
    // e.stopPropagation();
    const profile = JSON.parse(localStorage.getItem("user") || "null");
    if (!profile?.id) {
      Failure("Please log in to save jobs.");
      return;
    }

    setIsSaving(job.id);
    try {
      // if (isSaved) {
      //   if (!saveId) {
      //     console.error("Cannot unsave job without a save_id.");
      //     Failure("Could not unsave job. Please refresh and try again.");
      //     setIsSaving(null);
      //     return;
      //   }
      //   await Models.save.delete(saveId);
      //   Success("Job removed from saved list.");
      // }
      // else {

      const body = {
        job_id: job?.id,
        user_id: profile?.id,
      };
      if (job?.is_saved) {
        await Models.save.delete(profile.id, job.id);
        Success("Job removed from saved list.");
      } else {
        await Models.save.create(body);
        Success("Job saved successfully.");
      }
      // Update is_saved in place without refetching
      setState({
        jobList: state.jobList.map((j: any) =>
          j.id === job.id ? { ...j, is_saved: !job.is_saved } : j,
        ),
        jobDetail:
          state.jobDetail?.id === job.id
            ? { ...state.jobDetail, is_saved: !job.is_saved }
            : state.jobDetail,
      });
      // }

      // Refetch job list to get the latest saved status and save_id
    } catch (error) {
      console.error("Failed to save/unsave job", error);
      Failure("An error occurred. Please try again.");
    } finally {
      setIsSaving(null);
    }
  };

  const getCollege = async (e, id) => {
    e.stopPropagation();
    try {
      setState({ loading: true });
      const res: any = await Models.colleges.details(id);
      setState({
        collegeDetail: res,
        showCollegeModal: true,
        loading: false,
      });
    } catch (error) {
      setState({ loading: false });
      Failure("Failed to fetch college details");
    }
  };

  const userDetail = async () => {
   
     const profileStr = localStorage.getItem("user");
      if (!profileStr) return;

      const profile = JSON.parse(profileStr);
       console.log("fetching user details for userId:", profile.id);
    try {
      console.log("fetching user details for userId in try:", profile.id);
      const res: any = await Models.profile.details(profile.id);
      collegeIdRef.current = res.college_ids;
      setState({
        loading: false,
        college_id: res.college_ids,
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

  const getDepartment = async (e, id) => {
    e.stopPropagation();
    try {
      setState({ loading: true });
      const res: any = await Models.department.depdetails(id);
      console.log("department res", res);
      setState({
        departmentDetail: res,
        showDepartmentModal: true,
        loading: false,
      });
    } catch (error) {
      setState({ loading: false });
      // Failure("Failed to fetch department details");
    }
  };

  const handleFormSubmit = async () => {
    try {
      //  never overwrite state
      setState({ btnLoading: true, errors: {} });

      // Manual validation for department
      if (
        state.jobDetail?.department?.length > 1 &&
        (!state.department_id || state.department_id.length === 0)
      ) {
        setState({
          errors: {
            ...state.errors,
            department_id: "Please select at least one department.",
          },
          btnLoading: false,
        });
        return;
      }

      const profile = JSON.parse(localStorage.getItem("user") || "null");

      //  GUEST USER (WITH RESUME)

      const validateBody = {
        first_name: state.firstName,
        last_name: state.lastName,
        phone: state.phone,
        resume: state.resume,
        email: state.email?.trim(),
        experience: state.experience,
      };

      await jobApplicationSchema.validate(validateBody, {
        abortEarly: false,
      });

      //  FormData
      const formData = new FormData();

      formData.append("job_id", state.jobID);
      formData.append("first_name", state.firstName);
      formData.append("last_name", state.lastName);
      formData.append("email", state.email?.trim());
      formData.append("phone", state.phone);
      formData.append("experience", state.experience);
      formData.append("message", state.message || "");
      formData.append("status", "Applied");

      if (state.department_id && state.department_id.length > 0) {
        const ids = state.department_id.map((item: any) =>
          typeof item === "object" ? Number(item.value) : Number(item),
        );
        formData.append("department_id", JSON.stringify(ids));
      }

      if (state.resume) {
        formData.append("resume", state.resume); // FILE OBJECT
      }

      //  LOGGED-IN USER (NO RESUME)

      if (profile?.id) {
        formData.append("applicant", profile.id);
      }

      //  Debug FormData
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await Models.applications.create(formData);

      //  COMMON SUCCESS STATE

      setShowApplicationModal(false);
      // Success("Application submitted successfully");

      setState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
        experience: "",
        resume: null,
        colleges: "",
        department_id: [],
        congratsOpen: true,
        isMessageEdited: false,
        btnLoading: false,
      });
    } catch (error) {
      //  YUP VALIDATION ERROR

      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({
          errors: validationErrors,
          btnLoading: false,
        });
      }

      // API ERROR
      else {
        console.log(error);

        const apiError = error?.data?.error || "Something went wrong";

        Failure(apiError);

        setState((prev) => ({
          ...prev,
          btnLoading: false,
        }));
        setShowApplicationModal(false);
      }
    }
  };

  const bodyData = () => {
    const f = filtersRef.current;
    const body: any = {};
    const freeze = structuredSearchFreezeRef.current;
    let searchKeyword: string | null = null;

    if (collegeIdRef.current) {
      body.college_id = collegeIdRef.current;
    }

    if (freeze !== null) {
      searchKeyword = freeze.keyword ?? "";
    } else if (debouncedSearch) {
      searchKeyword = debouncedSearch;
    }
    if (searchKeyword !== null && `${searchKeyword}`.trim()) {
      body.search = `${searchKeyword}`.trim();
    }

    if (strictSearchOnlyModeRef.current) {
      return body.search ? { search: body.search } : {};
    }

    body.ordering = "-updated_at";

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }

    if (f?.categories?.length > 0) {
      body.category = f.categories;
    }

    if (f?.jobRole?.length > 0) {
      body.job_role = f.jobRole;
    }

    if (f?.department?.length > 0) {
      body.department = f.department;
    }

    if (f?.locations?.length > 0) {
      body.location = f.locations;
    }

    if (f?.jobTypes?.length > 0) {
      body.jobTypes = f.jobTypes;
    }

    if (f?.experienceLevels?.length > 0) {
      body.experience_id = f.experienceLevels;
    }

    if (f?.salaryRange?.length > 0) {
      body.salary_range = f.salaryRange;
    }

    if (f?.academic_responsibilities?.length > 0) {
      body.additional_academic_responsibilities_ids =
        f.academic_responsibilities;
    }

    if (f?.colleges?.length > 0) {
      body.colleges = f.colleges;
    }

    if (f?.tags?.length > 0) {
      body.tags = f.tags?.map((tag) => tag.value).join(",");
    }

    if (f?.datePosted?.length > 0) {
      const durationMap = {
        "24h": 1,
        "7d": 7,
        "15d": 15,
        "30d": 30,
        "last-mon": 30,
      };
      const maxDays = Math.max(...f.datePosted.map((d) => durationMap[d] || 0));

      if (maxDays === 1) {
        body.date_posted_after = moment()
          .subtract(24, "hours")
          .format("YYYY-MM-DD");
      } else if (maxDays > 1) {
        body.date_posted_after = moment()
          .subtract(maxDays, "days")
          .format("YYYY-MM-DD");
        body.date_posted_before = moment().format("YYYY-MM-DD");
      }
    }

    return body;
  };

  const naccData = [
    { label: "A++", highlight: true },
    { label: "NBA Accredited" },
    { label: "Autonomous" },
    { label: "UGC Approved" },
  ];

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobileScreen(width < 768);
      setIsTabScreen(width >= 768 && width < 1024);
      setIsDesktopScreen(width >= 1024);
      setIsWideScreen(width >= 1200);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNext = () => {
    if (!state.next) return;
    const nextPage = state.page + 1;
    setState({ page: nextPage });
    jobList(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (!state.prev) return;
    const prevPage = state.page - 1;
    setState({ page: prevPage });
    jobList(prevPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormChange = (field, value) => {
    setState({
      [field]: value,
      ...(field === "message" ? { isMessageEdited: true } : {}),
      errors: {
        ...state.errors,
        [field]: "",
      },
    });
  };

  const handleClearFilters = () => {
    strictSearchOnlyModeRef.current = false;
    structuredSearchFreezeRef.current = null;
    setFilters({
      searchQuery: "",
      locations: [],
      categories: [],
      jobTypes: [],
      experienceLevels: [],
      minExperience: "",
      maxExperience: "",
      datePosted: [],
      salaryRange: [],
      tags: [],
      experience: "",
      jobID: null,
      colleges: [],
      department: [],
      academic_responsibilities: [],
      jobRole: [],
      jobRoleList: [],
    });
    setIsMobileFilterOpen(false);
    setState({ search: "" });
  };

  const handleSearchInputChange = useCallback(
    (nextRaw: string) => {
      const next = nextRaw ?? "";
      structuredSearchFreezeRef.current = null;
      strictSearchOnlyModeRef.current = false;
      if (next.trim() === "") {
        handleClearFilters();
        return;
      }
      setState({ search: next });
    },
    [setState],
  );

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber });
    jobList(pageNumber);
  };

  const handleSidebarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (state.next && !state.isFetchingMore && !state.loading) {
        jobList(state.page + 1, true);
      }
    }
  };

  return (
    <>
      {" "}
      <div className=" bg-clr1">
        <div className="bg-[#1E3786] py-[10px] md:py-[10px] px-4 ">
          <div className="max-w-7xl 0px] mx-auto text-center">
            <h1 className="!text-white text-[24px] md:text-[35px] font-medium md:font-semibold">
              Jobs
            </h1>
          </div>
        </div>

        <div className="section-wid  py-8 lg:py-6">
          <main>
            {isTabScreen && selectedJob ? (
              <div
                className={`space-y-6 transition-all duration-500 ease-in-out transform ${
                  isAnimating
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                {/* Back Button */}

                {/* <ArrowLeft size={20} /> */}
                <div className="flex justify-between w-full">
                  <Breadcrumb />
                  <div>
                    <button
                      onClick={() => {
                        setSelectedJob(null);
                        router.replace("/jobs");
                      }}
                      className="bg-[#1E3786]  text-md border border-xl border-[#1E3786] rounded rounded-full text-sm   px-4 py-1  hover:bg-[#1E3786] transition-colors text-white hover:text-white flex gap-2"
                    >
                      <ArrowLeft size={14} className="mt-[3px]" />
                      Back
                    </button>
                  </div>
                </div>
                {/* <span className="font-medium">Back to Jobs</span> */}

                {/* Job Header */}
                {/* Job Header Card */}
                <div className="bg-clr2 rounded-lg   p-6 ">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-5">
                        <div className="w-fit bg-[#1E37861A] rounded-3xl px-5 py-1 text-[10px] text-[#000]">
                          {moment(state?.jobDetail?.created_at).isValid() &&
                          moment(state?.jobDetail?.created_at).year() > 1900
                            ? moment(state?.jobDetail?.created_at).fromNow()
                            : "Just now"}
                        </div>
                        {state?.jobDetail?.immediate_join && (
                          <div className="w-fit bg-green-100 rounded-3xl px-3 py-1 text-[10px] text-green-700 font-semibold">
                            ⚡ Immediate Hiring
                          </div>
                        )}
                      </div>
                      <div className="flex items-start gap-4">
                        {state?.jobDetail?.college?.college_logo ? (
                          <img
                            src={state?.jobDetail?.college?.college_logo}
                            alt={state?.jobDetail?.college?.name}
                            className="w-14 h-14  object-contain"
                            onClick={(e) =>
                              getCollege(e, state?.jobDetail.college?.id)
                            }
                          />
                        ) : (
                          <div
                            className={`w-14 h-14 rounded-lg  flex items-center justify-center bg-gray-400 text-black bg-white font-semibold text-lg`}
                            onClick={(e) =>
                              getCollege(e, state?.jobDetail.college?.id)
                            }
                          >
                            {state?.jobDetail?.college?.name
                              ?.slice(0, 1)
                              .toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 flex-col">
                          <div className="flex items-start gap-2 flex-wrap mb-1">
                            <h1
                              className="text-xl font-semibold text-[#313131] mb-1"
                              onClick={(e) =>
                                getCollege(e, state?.jobDetail.college?.id)
                              }
                            >
                              {capitalizeFLetter(job_title(state?.jobDetail))}
                            </h1>
                            {state?.jobDetail?.department.length == 1 && (
                              <>
                                {state?.jobDetail?.department?.map(
                                  (item, index) => (
                                    <button
                                      key={index}
                                      onClick={(e) => getDepartment(e, item.id)}
                                      className="mt-1 px-3 py-0.5 text-xs font-semibold rounded-full border bg-blue-50 text-[#1E3786]
                       border border-[#1E3786]
                       hover:bg-[#1E3786] hover:text-white transition-all duration-200 whitespace-nowrap"
                                    >
                                      {item.name}
                                    </button>
                                  ),
                                )}
                                {state?.jobDetail?.categories.length == 1 &&
                                  state?.jobDetail?.categories?.map(
                                    (item, index) => (
                                      <button
                                        key={index}
                                        className="mt-1 px-3 py-0.5 text-xs font-semibold rounded-full border bg-blue-50 text-[#1E3786]
                       border border-[#1E3786]
                       hover:bg-[#1E3786] hover:text-white transition-all duration-200 whitespace-nowrap cursor-default"
                                      >
                                        {item.name}
                                      </button>
                                    ),
                                  )}
                              </>
                            )}
                          </div>
                          <p className="text-md text-gray-700 mb-2">
                            {state?.jobDetail?.college?.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      className="p-1"
                      onClick={() => setSelectedJob(null)}
                    >
                      <X size={25} className=" hover:text-gray-600" />
                    </button>
                  </div>

                  <div className="mb-3">
                    {/* <p className="text-sm text-gray-500 mb-3">
                      {capitalizeFLetter(
                        state?.jobDetail?.locations
                          ?.map((item) => item.city)
                          .join(", "),
                      )}{" "}
                      • Posted {state?.jobDetail?.postedDate || "2 days ago"}
                    </p> */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4 text-[#F2B31D]" />
                        {state?.jobDetail?.experiences?.name}
                      </span>
                      {/* <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {state?.jobDetail?.job_type_obj?.name}
                  </span> */}
                      <span className="flex items-center gap-1">
                        {selectedJob.salary_range?.includes("$") ? (
                          <DollarSign className="w-4 h-4 text-[#F2B31D]" />
                        ) : (
                          <IndianRupee className="w-4 h-4 text-[#F2B31D]" />
                        )}
                        {state?.jobDetail?.salary_range_obj?.name}
                      </span>

                      {state?.jobDetail?.locations?.length > 0 && (
                        <span className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-[#E6AB1D]" />
                          {capitalizeFLetter(
                            state?.jobDetail?.locations
                              ?.map((item) => item.city)
                              .join(", "),
                          )}{" "}
                          {/* {state?.jobDetail?.college?.address} */}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {state.jobDetail?.user_is_applied === false ? (
                      <button
                        onClick={() => {
                          setState({ jobID: state?.jobDetail?.id });
                          handleApply();
                        }}
                        className="bg-[#1E3786]  text-md border border-xl border-[#1E3786] rounded rounded-3xl  px-6 py-1  hover:bg-[#1E3786] transition-colors text-white hover:text-white whitespace-nowrap"
                      >
                        {state.jobDetail?.apply_link
                          ? " Apply on company's site"
                          : " Apply Now"}
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-4 py-1">
                        ✓ Applied
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveToggle(state.jobDetail)}
                        disabled={isSaving === state?.jobDetail?.id}
                        className="p-1 -m-1"
                        // aria-label={
                        //   state.jobDetail.is_saved ? "Unsave job" : "Save job"
                        // }
                      >
                        {state.jobDetail?.is_saved ? (
                          <div className="flex items-center ">
                            <BookmarkCheck
                              className={`w-5 h-5 fill-[#1E3786] text-white cursor-pointer `}
                            />
                          </div>
                        ) : (
                          <>
                            <Bookmark className="w-5 h-5" />
                          </>
                        )}
                      </button>
                      <RWebShare
                        data={{
                          title: "Faculty Plus",
                          text: "Check this out!",
                          url: window.location.href,
                        }}
                        onClick={() => console.log("shared successfully!")}
                      >
                        <Share2 className="w-5 h-5  hover:text-gray-600 cursor-pointer" />
                      </RWebShare>
                    </div>
                  </div>
                </div>

                <div className="bg-clr2 rounded-lg   p-6 ">
                  {/* Job Description */}
                  <div className="border-b  px-2 py-2 pb-5">
                    <h2 className="text-lg font-semibold text-black mb-4">
                      About the job
                    </h2>
                    <div className="leading-relaxed space-y-4">
                      <div className="leading-relaxed space-y-6">
                        {state?.jobDetail?.department?.length > 0 && (
                          <div>
                            <h3 className="text-md font-semibold text-gray-800  tracking-wide mb-2">
                              Departments
                            </h3>

                            <div className="flex flex-wrap gap-3">
                              {state?.jobDetail?.department?.map(
                                (item, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => getDepartment(e, item.id)}
                                    className="px-4 py-2 text-sm font-medium rounded-full
                       bg-blue-50 text-[#1E3786]
                       border border-blue-100
                       hover:bg-[#1E3786] hover:text-white
                       transition-all duration-200"
                                  >
                                    {item.name}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                        {/* Job Description Section */}
                        {state?.jobDetail?.job_description && (
                          <div>
                            <h3 className="text-md font-semibold text-gray-800  tracking-wide mb-2">
                              Job Description
                            </h3>

                            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                              {state?.jobDetail?.job_description}
                            </p>
                          </div>
                        )}

                        {state?.new_job_qualification?.length > 0 ? (
                          <div>
                            <h3 className="text-md font-semibold text-gray-800  tracking-wide mb-2">
                              Job Qualification
                            </h3>
                            <ul className="space-y-3">
                              {state?.new_job_qualification?.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-3"
                                  >
                                    {item?.type === "list" && (
                                      <Check className="w-5 h-5 text-[#F2B31D] mt-1 flex-shrink-0" />
                                    )}

                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: item?.text ?? item,
                                      }}
                                    />
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        ) : (
                          state?.jobDetail?.new_job_qualification && (
                            <div>
                              <h3 className="text-md font-semibold text-gray-800  tracking-wide mb-2">
                                Job Qualification
                              </h3>

                              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                                {state?.jobDetail?.qualification}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                      <p>
                        {state?.jobDetail?.job_description ||
                          "Looking for a skilled professional to join our team. Great opportunity for career growth and development in a dynamic work environment."}
                        {/* We are looking for a talented professional to join our
                        dynamic team. This role offers an excellent opportunity
                        to work with cutting-edge technologies and contribute to
                        meaningful projects that impact thousands of users. */}
                      </p>
                      {/* <p>
                        The ideal candidate will have strong technical skills,
                        excellent communication abilities, and a passion for
                        innovation. You'll be working in a collaborative
                        environment where your ideas and contributions are
                        valued.
                      </p> */}
                    </div>
                  </div>

                  {/* Responsibilities */}
                  {state?.responsibilities?.length > 0 && (
                    <div className="border-b  px-2 py-2 pb-5">
                      <h2 className="text-lg font-semibold text-black mb-4">
                        Key responsibilities
                      </h2>
                      <ul className="space-y-3">
                        {state?.responsibilities?.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            {item?.type === "list" && (
                              <Check className="w-5 h-5 text-[#F2B31D] mt-1 flex-shrink-0" />
                            )}

                            <span
                              dangerouslySetInnerHTML={{
                                __html: item?.text ?? item,
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requirements */}
                  {/* {state?.jobDetail?.requirements && (
                    <div className="border-b  px-2 py-2 pb-5">
                      <h2 className="text-lg font-semibold text-black mb-4">
                        Requirements
                      </h2>
                      <ul className="space-y-3">
                        {state?.jobDetail?.requirements?.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            {(item?.type === "list" || typeof item === "string") && <Check className="w-5 h-5 text-[#F2B31D] mt-1 flex-shrink-0" />}
                            <span dangerouslySetInnerHTML={{ __html: item?.text ?? item }} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )} */}

                  {/* Skills */}
                  {/* {state?.jobDetail?.skills && (
                    <div className="  px-2 py-2 pb-5">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {state?.jobDetail?.skills?.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-clr1 text-gray-700 rounded-full text-sm font-medium"
                          >
                            {skill?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )} */}
                </div>

                {/* Job Details */}

                <div className="bg-clr2 rounded-lg   p-6">
                  <h3 className="text-lg font-semibold text-black mb-4">
                    Job Overview
                  </h3>
                  <div className="space-y-2">
                    {/* <div>
                  <p className="text-md font-medium  pb-1">Job type</p>
                  <p className="text-md text-black">
                    {state?.jobDetail?.job_type_obj?.name}
                  </p>
                </div> */}
                    <div>
                      <span className=" flex gap-2 text-md font-medium  pb-1">
                        <Workflow className="w-4 h-4 mt-1 text-[#E6AB1D]" /> Job
                        Title
                      </span>
                      <p className="text-md text-gray-500  ps-6">
                        {capitalizeFLetter(job_title(state?.jobDetail))}
                      </p>
                    </div>
                    <div>
                      <span className="flex gap-2 text-md font-medium  pb-1">
                        <Building2 className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                        Department
                      </span>
                      <div className="text-md text-gray-500 ps-6">
                        {state?.jobDetail?.department?.map((item, index) => (
                          <div key={index}>
                            <span
                              className="text-md text-gray-500 hover:text-[#1E3786] cursor-pointer hover:underline"
                              onClick={(e) => getDepartment(e, item.id)}
                            >
                              {item.name}
                            </span>
                            {index < state.jobDetail.department.length - 1 &&
                              ", "}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className=" flex gap-2 text-md font-medium  pb-1">
                        <Briefcase className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                        Experience level
                      </span>
                      <p className="text-md text-gray-500  ps-6">
                        {state?.jobDetail?.experiences?.name}
                      </p>
                    </div>
                    <div>
                      <span className="flex gap-2 text-md font-medium  pb-1">
                        <IndianRupee className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                        Salary
                      </span>
                      <p className="text-md text-gray-500 ps-6">
                        {state?.jobDetail?.salary_range_obj?.name}
                      </p>
                    </div>

                    {state?.jobDetail?.locations?.length > 0 && (
                      <div>
                        <span className="flex gap-2 text-md font-medium  pb-1">
                          <MapPin className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                          Location
                        </span>
                        <p className="text-md text-gray-500  ps-6">
                          {state?.jobDetail?.locations
                            ?.map((item) => item.city)
                            .join(", ")}
                          {/* {state?.jobDetail?.college?.address} */}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Info */}

                {state?.jobDetail?.job_image && (
                  <div
                    className="bg-clr2 w-fit rounded-lg  p-6 cursor-pointer"
                    onClick={() => setState({ imgOpen: true })}
                  >
                    <img
                      src={state?.jobDetail?.job_image}
                      alt={state?.jobDetail?.job_title}
                      className="w-100 max-h-[400px]"
                    />
                  </div>
                )}
                <div className="bg-clr2 rounded-lg  p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    About
                  </h3>
                  <div className="flex items-start gap-3 mb-4">
                    {selectedJob.college?.college_logo ? (
                      <img
                        src={selectedJob.college?.college_logo}
                        alt={selectedJob.college?.name}
                        className="w-12 h-12 rounded-lg object-contain"
                        onClick={(e) =>
                          getCollege(e, state?.jobDetail.college?.id)
                        }
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-lg bg-gray-400 flex items-center justify-center text-white bg-gray-400 font-semibold`}
                        onClick={(e) =>
                          getCollege(e, state?.jobDetail.college?.id)
                        }
                      >
                        {selectedJob.college?.name?.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4
                        className="font-medium text-gray-900"
                        onClick={(e) =>
                          getCollege(e, state?.jobDetail.college?.id)
                        }
                      >
                        {state?.jobDetail?.college?.name}
                      </h4>
                      {/* <p className="text-sm text-gray-500">
                        Technology Company
                      </p> */}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        isIntentionalNav.current = true;
                        setSelectedJob(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        router.push(
                          `/jobs?college=${state?.jobDetail?.college?.id}`,
                        );
                      }}
                      className="px-6 py-2 rounded-full text-sm font-medium transition-colors bg-[#1E3786] text-white group-hover:bg-[#F2B31D] group-hover:text-black"
                    >
                      {state?.jobDetail?.college?.total_jobs || 0} Openings
                    </button>
                  </div>
                  <p className="leading-relaxed">
                    {state?.jobDetail?.company_detail}
                  </p>
                </div>
              </div>
            ) : isDesktopScreen && selectedJob && showJobDetail ? (
              <>
                <div className="flex justify-between">
                  <Breadcrumb />
                </div>

                <div className="flex gap-2 pb-4 pt-2 items-start">
                  {/* Left Sidebar - Jobs List */}
                  <div
                    ref={jobListSidebarWrapperRef}
                    className="w-80 flex-shrink-0 relative"
                  >
                    <div
                      ref={jobListSidebarRef}
                      className="bg-white py-5 border border-[#c7c7c787]  flex flex-col max-h-[calc(100vh-100px)]"
                    >
                      <div className="mb-4 flex flex-col  w-full bg-clr2  rounded-sm py-1 flex-shrink-0 overflow-visible">
                        <div
                          ref={(node) => {
                            promptSuggestPopoverSidebarRef.current = node;
                          }}
                          className="relative z-40 mx-4 overflow-visible"
                        >
                          <div className="flex-grow flex gap-3 items-center rounded-full px-4 py-3 lg:py-0 w-full lg:w-auto border border-[#c7c7c787] bg-[#F5F5F5]">
                            <Search color="#E4E4E4" size={22} />
                            <input
                              type="text"
                              placeholder="Search by: Job tittle, Position, Keyword..."
                              className="w-full px-2 py-3  bg-transparent text-sm text-slate-600 focus:outline-none placeholder:text-[#AFAFAF] placeholder:font-normal"
                              value={state.search}
                              onChange={(e) => {
                                handleSearchInputChange(e.target.value);
                              }}
                              onFocus={(e) => {
                                openSidebarPromptSuggestionsFromValue(
                                  e.currentTarget.value,
                                );
                              }}
                              onMouseDown={(e) => {
                                if (e.button !== 0) return;
                                openSidebarPromptSuggestionsFromValue(
                                  (e.target as HTMLInputElement).value,
                                );
                              }}
                              onKeyDown={(e) => {
                                void handlePromptInputKeyDown(e);
                              }}
                            />
                            {state.search?.trim() && (
                              <button
                                type="button"
                                onClick={handleClearFilters}
                                className="border-none flex items-center justify-center w-8 h-8 rounded-full border border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                aria-label="Clear search and filters"
                                title="Clear search"
                              >
                                <X size={18} color="#ef4444" />
                              </button>
                            )}
                          </div>
                          <JobSearchPromptSuggestions
                            open={promptSuggestionsOpenSidebar}
                            rows={promptSuggestions}
                            onPick={handlePromptSuggestionPick}
                            highlightedIndex={promptSuggestionsHighlightIndex}
                            onHighlight={setPromptSuggestionsHighlightIndex}
                          />
                        </div>
                        <h3 className="text-black px-6 font-semibold mt-4">
                          Job List
                        </h3>

                        {/* <div className="hidden lg:block w-px h-10 bg-slate-100"></div> */}
                      </div>

                      <div
                        ref={jobListSidebarScrollContainerRef}
                        className="flex-1 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 pr-2 px-3"
                        onScroll={handleSidebarScroll}
                      >
                        {jobSidebarLoading ? (
                          Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="px-2 py-5 border-b border-[#c7c7c787]"
                            >
                              <div className="flex flex-row gap-4">
                                <SkeletonLoader
                                  type="rect"
                                  width={24}
                                  height={24}
                                  className="rounded-lg flex-shrink-0"
                                />
                                <div className="flex-1">
                                  <SkeletonLoader
                                    type="text"
                                    width="70%"
                                    height={14}
                                    className="mb-2"
                                  />
                                  <SkeletonLoader
                                    type="text"
                                    width="50%"
                                    height={12}
                                    className="mb-2"
                                  />
                                  <SkeletonLoader
                                    type="text"
                                    width="40%"
                                    height={12}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        ) : showSimilarJobsEmpty ? (
                          <p className="px-4 py-10 text-center text-sm text-slate-500">
                            No job found
                          </p>
                        ) : (
                          (jobSidebarList || []).map((job) => (
                            <div
                              key={job.id}
                              id={`job-list-item-${job.id}`}
                              onClick={() => {
                                router.push(`/jobs?slug=${job.slug}`);

                                setSelectedJob(job);
                                setState({ jobID: job.id });
                                jobDetail(job.id);
                                similarJob(job);
                              }}
                              className={`cursor-pointer px-2 py-5 transition-all   ${
                                selectedJob?.id === job.id
                                  ? "border border-[#1E3786] bg-[#fff]  "
                                  : "border-b border-[#c7c7c787]"
                              }`}
                            >
                              <div className="flex flex-row gap-4 justify-between">
                                <div className="flex flex-row gap-4">
                                  <div>
                                    {job?.college?.college_logo ? (
                                      <img
                                        src={job?.college?.college_logo}
                                        alt={job?.college?.name}
                                        className="w-6 h-6  object-contain"
                                      />
                                    ) : (
                                      <div
                                        className={`w-6 h-6 rounded-lg bg-gray-400  flex items-center justify-center ${
                                          selectedJob?.id === job.id
                                            ? "text-white bg-gray-400 text-xs"
                                            : " text-white bg-gray-400 text-xs"
                                        }  font-semibold flex-shrink-0`}
                                      >
                                        {job.college?.name
                                          ?.slice(0, 1)
                                          .toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-start gap-3">
                                      <div className="min-w-0 flex-1">
                                        <h3
                                          className={`font-semibold  leading-tight mb-1 ${
                                            selectedJob?.id === job.id
                                              ? ""
                                              : "text-gray-900"
                                          }`}
                                          title={job_title(job)}
                                        >
                                          {capitalizeFLetter(
                                            CharSlice(job_title(job), 20),
                                          )}
                                        </h3>
                                        <p
                                          className={`cursor-pointer ${
                                            selectedJob?.id === job.id
                                              ? ""
                                              : "text-gray-600 hover:underline"
                                          } text-sm font-normal`}
                                          // onClick={(e) => getCollege(e, job.college?.id)}
                                        >
                                          {CharSlice(job.college?.name, 20)}
                                        </p>
                                      </div>
                                    </div>
                                    {/* Header */}
                                    {/* Experience and Salary */}
                                    <div
                                      className={`flex  justify-start gap-3 flex-wrap  mb-3 border-none mt-4 ${
                                        selectedJob?.id === job.id
                                          ? ""
                                          : "text-gray-600"
                                      }`}
                                    >
                                      <div className="flex gap-2">
                                        <Briefcase
                                          className={`${
                                            selectedJob?.id === job.id && ""
                                          } w-3 h-3 flex-1 text-[#E6AB1D]`}
                                        />
                                        <span
                                          className={`text-[12px] pt-[-2px] ${
                                            selectedJob?.id === job.id && ""
                                          }`}
                                        >
                                          {job.experiences?.name}
                                        </span>
                                      </div>

                                      {job.locations?.length > 0 && (
                                        <div className="flex  gap-1">
                                          <MapPin
                                            className={`${
                                              selectedJob?.id === job.id && ""
                                            } w-3 h-3 text-[#E6AB1D] flex-1`}
                                          />
                                          <span
                                            className={`text-[12px] pt-[-2px] ${
                                              selectedJob?.id === job.id &&
                                              "text-[12px]"
                                            }`}
                                          >
                                            {job.locations
                                              ?.map((item) => item.city)
                                              .join(", ")}
                                            {/* {job?.college?.address} */}
                                          </span>
                                        </div>
                                      )}

                                      {/* <div className="flex items-center gap-1">
                                {job.salary_range_obj?.name?.includes("$") ? (
                                  <DollarSign
                                    className={`${
                                      selectedJob?.id === job.id && "text-white"
                                    } w-3 h-3`}
                                  />
                                ) : (
                                  <IndianRupee
                                    className={`${
                                      selectedJob?.id === job.id && "text-white"
                                    } w-3 h-3`}
                                  />
                                )}
                                <span
                                  className={`font-semibold ${
                                    selectedJob?.id === job.id
                                      ? "text-white"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {job?.salary_range_obj?.name}
                                </span>
                              </div> */}
                                    </div>
                                    <div className="flex gap-2">
                                      <Building2 className="w-4 h-4 text-[#ffb400] " />

                                      <span className="flex items-center gap-2">
                                        {job?.department
                                          ?.slice(0, 1)
                                          .map((item, index) => (
                                            <span
                                              key={index}
                                              className="cursor-pointer text-[12px]"
                                              // onClick={(e) => {
                                              //   e.stopPropagation();
                                              //   onDepartmentClick && onDepartmentClick(e, item.id);
                                              // }}
                                            >
                                              {item.name}
                                            </span>
                                          ))}

                                        {/* If more than 2 departments */}
                                        {job?.department?.length > 2 && (
                                          <div className="w-5 h-5 px-2 py-2 flex items-center justify-center rounded-full bg-[#1E3786] text-white text-[10px] font-medium">
                                            +{job.department.length - 2}
                                          </div>
                                        )}
                                      </span>
                                    </div>
                                    {/* Location
                            <div
                              className={`flex items-center gap-1 text-xs mb-3 ${
                                selectedJob?.id === job.id
                                  ? "text-white"
                                  : "text-gray-600"
                              }`}
                            >
                              <MapPin
                                className={`${
                                  selectedJob?.id === job.id && "text-white"
                                } w-3 h-3`}
                              />
                              <span
                                className={`${
                                  selectedJob?.id === job.id && "text-white"
                                }`}
                              >
                                {job.locations
                                  ?.map((item) => item.city)
                                  .join(", ")}
                              </span>
                            </div> */}
                                    {/* Footer */}
                                    {/* <div
                              className={`flex items-center justify-between pt-3 border-t ${
                                selectedJob?.id === job.id
                                  ? "border-gray-400"
                                  : "border-gray-300"
                              }`}
                            > */}
                                    {/* <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        {job?.job_type_obj?.name}
                      </span> */}
                                    {/* <div
                                className={`flex items-center gap-1 text-xs ${
                                  selectedJob?.id === job.id
                                    ? "text-white"
                                    : "text-gray-500"
                                }`}
                              >
                                <Clock
                                  className={`${
                                    selectedJob?.id === job.id && "text-white"
                                  } w-3 h-3`}
                                />
                                <span
                                  className={`${
                                    selectedJob?.id === job.id && "text-white"
                                  }`}
                                >
                                  {moment(job.created_at).isValid() &&
                                  moment(job.created_at).year() > 1900
                                    ? moment(job.created_at).fromNow()
                                    : "Just now"}
                                </span>
                              </div> */}
                                    {/* </div> */}
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleSaveToggle(job)}
                                        disabled={isSaving === job.id}
                                        className="p-1 -m-1"
                                        // aria-label={
                                        //   state.jobDetail.is_saved ? "Unsave job" : "Save job"
                                        // }
                                      >
                                        {job?.is_saved ? (
                                          <div className="flex items-center ">
                                            <BookmarkCheck
                                              className={`w-5 h-5 fill-[#1E3786] text-white cursor-pointer `}
                                            />
                                          </div>
                                        ) : (
                                          <>
                                            <Bookmark className="w-5 h-5 " />
                                          </>
                                        )}
                                      </button>

                                      {/* <RWebShare
                              data={{
                                title: "Faculty Plus",
                                text: "Check this out!",
                                url: window.location.href,
                              }}
                              onClick={() =>
                                console.log("shared successfully!")
                              }
                            >
                              <Share2 className="w-5 h-5  hover:text-gray-600 cursor-pointer" />
                            </RWebShare> */}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        {state.isFetchingMore && (
                          <div className="space-y-4 px-2">
                            {[1, 2].map((i) => (
                              <div
                                key={i}
                                className="py-5 border-b border-[#c7c7c787]"
                              >
                                <div className="flex gap-4">
                                  <SkeletonLoader
                                    type="rect"
                                    width={24}
                                    height={24}
                                    className="rounded-lg flex-shrink-0"
                                  />
                                  <div className="flex-1">
                                    <SkeletonLoader
                                      type="text"
                                      width="80%"
                                      height={16}
                                      className="mb-2"
                                    />
                                    <SkeletonLoader
                                      type="text"
                                      width="50%"
                                      height={14}
                                      className="mb-3"
                                    />
                                    <div className="flex gap-3">
                                      <SkeletonLoader
                                        type="text"
                                        width={50}
                                        height={10}
                                      />
                                      <SkeletonLoader
                                        type="text"
                                        width={50}
                                        height={10}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1" ref={jobDetailContainerRef}>
                    {/* Job Header Card */}
                    {state.loading ? (
                      <div className="bg-white p-6 rounded-lg border border-[#c7c7c787] mb-6">
                        <div className="flex gap-4 mb-6">
                          <SkeletonLoader
                            type="rect"
                            width={64}
                            height={64}
                            className="rounded-3xl"
                          />
                          <div className="flex-1">
                            <SkeletonLoader
                              type="text"
                              width="40%"
                              height={32}
                              className="mb-2"
                            />
                            <SkeletonLoader
                              type="text"
                              width="20%"
                              height={20}
                            />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <SkeletonLoader type="text" width={100} />
                          <SkeletonLoader type="text" width={100} />
                          <SkeletonLoader type="text" width={100} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className=" border-b    pb-2">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-fit bg-[#1E37861A] rounded-3xl px-3 py-1 text-[12px] text-[#000]">
                                  {moment(
                                    state?.jobDetail?.created_at,
                                  ).isValid() &&
                                  moment(state?.jobDetail?.created_at).year() >
                                    1900
                                    ? moment(
                                        state?.jobDetail?.created_at,
                                      ).fromNow()
                                    : "Just now"}
                                </div>
                                {state?.jobDetail?.immediate_join && (
                                  <div className="w-fit bg-green-100 rounded-3xl px-3 py-1 text-[12px] text-green-700 font-semibold">
                                    ⚡ Immediate Hiring
                                  </div>
                                )}
                              </div>
                              <div className="flex items-start gap-4 h-full mb-1">
                                {state?.jobDetail?.college?.college_logo ? (
                                  <img
                                    src={
                                      state?.jobDetail?.college?.college_logo
                                    }
                                    alt={state?.jobDetail?.college?.name}
                                    className="w-12 h-12  object-contain  rounded-3xl"
                                    onClick={(e) =>
                                      getCollege(
                                        e,
                                        state?.jobDetail.college?.id,
                                      )
                                    }
                                  />
                                ) : (
                                  <div
                                    className={`w-12 h-12 rounded-3xl bg-gray-400 flex items-center justify-center text-white bg-gray-400 font-semibold text-lg`}
                                    onClick={(e) =>
                                      getCollege(
                                        e,
                                        state?.jobDetail.college?.id,
                                      )
                                    }
                                  >
                                    {state?.jobDetail?.college?.name
                                      ?.slice(0, 1)
                                      .toUpperCase()}
                                  </div>
                                )}
                                <div className="flex-1 flex-col">
                                  <div className="flex items-start gap-2 flex-wrap mb-1">
                                    <h1 className="text-2xl font-semibold text-gray-900">
                                      {capitalizeFLetter(
                                        job_title(state?.jobDetail),
                                      )}
                                    </h1>
                                    {state?.jobDetail?.department.length ==
                                      1 && (
                                      <>
                                        {state?.jobDetail?.department?.map(
                                          (item, index) => (
                                            <button
                                              key={index}
                                              onClick={(e) =>
                                                getDepartment(e, item.id)
                                              }
                                              className="mt-1 px-3 py-0.5 text-xs font-semibold rounded-full border bg-blue-50 text-[#1E3786]
                       border border-[#1E3786]
                       hover:bg-[#1E3786] hover:text-white transition-all duration-200 whitespace-nowrap"
                                            >
                                              {item.name}
                                            </button>
                                          ),
                                        )}
                                        {state?.jobDetail?.categories.length ==
                                          1 &&
                                          state?.jobDetail?.categories?.map(
                                            (item, index) => (
                                              <button
                                                key={index}
                                                className="mt-1 px-3 py-0.5 text-xs font-semibold rounded-full border bg-blue-50 text-[#1E3786]
                       border border-[#1E3786]
                       hover:bg-[#1E3786] hover:text-white transition-all duration-200 whitespace-nowrap cursor-default"
                                              >
                                                {item.name}
                                              </button>
                                            ),
                                          )}
                                      </>
                                    )}
                                  </div>
                                  <p
                                    className="text-md text-gray-700 mb-2 cursor-pointer hover:underline"
                                    onClick={(e) =>
                                      getCollege(
                                        e,
                                        state?.jobDetail.college?.id,
                                      )
                                    }
                                  >
                                    {capitalizeFLetter(
                                      state?.jobDetail?.college?.name,
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className=" ">
                                <div className="flex items-center gap-5 text-sm text-gray-600">
                                  <span className="flex items-center gap-3">
                                    <Briefcase className="w-4 h-4 text-[#E6AB1D]" />
                                    {state?.jobDetail?.experiences?.name}
                                  </span>
                                  {/* <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {state?.jobDetail?.job_type_obj?.name}
                        </span> */}
                                  <span className="flex items-center gap-3">
                                    {selectedJob.salary_range?.includes("$") ? (
                                      <DollarSign className="w-4 h-4 text-[#E6AB1D]" />
                                    ) : (
                                      <IndianRupee className="w-4 h-4 text-[#E6AB1D]" />
                                    )}
                                    {state?.jobDetail?.salary_range_obj?.name}
                                  </span>
                                  {state?.jobDetail?.locations?.length > 0 && (
                                    <span className="flex items-center gap-3">
                                      <MapPin className="w-4 h-4 text-[#E6AB1D]" />
                                      {capitalizeFLetter(
                                        state?.jobDetail?.locations
                                          ?.map((item) => item.city)
                                          .join(", "),
                                      )}{" "}
                                      {/* {state?.jobDetail?.college?.address} */}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col  justify-between items-end h-full">
                              {/* <button
                                className="p-1"
                                onClick={() => setSelectedJob(null)}
                              >
                                <X size={20} className=" hover:text-gray-600" />
                              </button> */}
                              <div>
                                <button
                                  onClick={() => {
                                    setSelectedJob(null);
                                    router.replace("/jobs");
                                  }}
                                  className="bg-[#1E3786]  text-md border border-xl border-[#1E3786] rounded rounded-full text-sm   px-4 py-1  hover:bg-[#1E3786] transition-colors text-white hover:text-white flex gap-2"
                                >
                                  <ArrowLeft size={14} className="mt-[3px]" />
                                  Back
                                </button>
                              </div>
                              <div className="flex flex-col items-end justify-between pt-6 gap-6  border-gray-100">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleSaveToggle(state.jobDetail)
                                    }
                                    disabled={isSaving == state?.jobDetail?.id}
                                    className="p-1 -m-1"
                                    // aria-label={
                                    //   state.jobDetail.is_saved ? "Unsave job" : "Save job"
                                    // }
                                  >
                                    {state.jobDetail?.is_saved ? (
                                      <div className="flex items-center ">
                                        <BookmarkCheck
                                          className={`w-6 h-6 fill-[#1E3786] text-white cursor-pointer `}
                                        />
                                      </div>
                                    ) : (
                                      <>
                                        <Bookmark className="w-5 h-5" />
                                      </>
                                    )}
                                  </button>
                                  <RWebShare
                                    data={{
                                      title: "Faculty Plus",
                                      text: "Check this out!",
                                      url: window.location.href,
                                    }}
                                    onClick={() =>
                                      console.log("shared successfully!")
                                    }
                                  >
                                    <Share2 className="w-5 h-5  hover:text-gray-600 cursor-pointer" />
                                  </RWebShare>
                                </div>

                                {state.jobDetail?.user_is_applied === false ? (
                                  <button
                                    onClick={() => {
                                      setState({ jobID: state?.jobDetail?.id });
                                      handleApply();
                                    }}
                                    className=" bg-[#1E3786]  text-md border border-xl border-[#1E3786] rounded rounded-3xl  px-6 py-1  hover:bg-[#1E3786] transition-colors text-white hover:text-white whitespace-nowrap"
                                  >
                                    {state.jobDetail?.apply_link
                                      ? " Apply on company's site"
                                      : " Apply Now"}
                                  </button>
                                ) : (
                                  <span className="text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-4 py-1">
                                    ✓ Applied
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {state.loading ? (
                      <div className="flex gap-6 flex-col xl:flex-row">
                        <div className="flex-1 space-y-4 p-3">
                          <SkeletonLoader type="text" width="30%" height={24} />
                          <SkeletonLoader type="text" count={10} />
                        </div>
                        <div className="w-full xl:w-80 flex-shrink-0 mt-5">
                          <div className="bg-clr2 border border-[#c7c7c787] p-6 space-y-4">
                            <SkeletonLoader
                              type="text"
                              width="50%"
                              height={24}
                            />
                            <SkeletonLoader type="text" count={4} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2  flex-col xl:flex-row ">
                        {/* Main Content */}
                        <div className="flex-1 space-y-4 mt-3 p-3 bg-clr2   border border-[#c7c7c787]">
                          <div>
                            {/* Job Description */}
                            <div className="border-b  pb-3">
                              <h2 className="text-lg font-semibold text-black mb-2">
                                About the job
                              </h2>
                              {/* Department Section */}
                              <div className="leading-relaxed space-y-4">
                                {state?.jobDetail?.department?.length > 0 && (
                                  <div>
                                    <h3 className="text-md font-semibold text-gray-800  tracking-wide mb-2">
                                      Departments
                                    </h3>

                                    <div className="flex flex-wrap gap-3">
                                      {state?.jobDetail?.department?.map(
                                        (item, index) => (
                                          <button
                                            key={index}
                                            onClick={(e) =>
                                              getDepartment(e, item.id)
                                            }
                                            className="px-4 py-1 text-sm font-medium rounded-full
                       bg-blue-50 text-[#1E3786]
                       border border-blue-100
                       hover:bg-[#1E3786] hover:text-white
                       transition-all duration-200"
                                          >
                                            {item.name}
                                          </button>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                                {/* Job Description Section */}
                                {state?.jobDetail?.job_description && (
                                  <div>
                                    <h3 className="text-md font-semibold text-gray-800  tracking-wide mb-2">
                                      Job Description
                                    </h3>

                                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                                      {state?.jobDetail?.job_description}
                                    </p>
                                  </div>
                                )}

                                {state?.new_job_qualification?.length > 0 ? (
                                  <div className="">
                                    <h3 className="text-md font-semibold text-gray-800  tracking-wide mb-2">
                                      Job Qualification
                                    </h3>
                                    <ul className="space-y-1">
                                      {state?.new_job_qualification?.map(
                                        (item, index) => (
                                          <li
                                            key={index}
                                            className="flex items-start gap-3"
                                          >
                                            {item?.type === "list" && (
                                              <Check className="w-5 h-5 text-[#F2B31D] mt-1 flex-shrink-0" />
                                            )}

                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: item?.text ?? item,
                                              }}
                                            />
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                ) : (
                                  state?.jobDetail?.qualification && (
                                    <div>
                                      <h3 className="text-md font-semibold text-gray-800  tracking-wide mb-2">
                                        Job Qualification
                                      </h3>

                                      <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                                        {state?.jobDetail?.qualification}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Responsibilities */}
                            {state?.responsibilities?.length > 0 && (
                              <div className="border-b pt-3  py-2 pb-5">
                                <h2 className="text-lg font-semibold text-black mb-2">
                                  Key responsibilities
                                </h2>
                                <ul className="space-y-1">
                                  {state?.responsibilities?.map(
                                    (item, index) => (
                                      <li
                                        key={index}
                                        className="flex items-start gap-3"
                                      >
                                        {item?.type === "list" && (
                                          <Check className="w-5 h-5 text-[#F2B31D] mt-1 flex-shrink-0" />
                                        )}

                                        <span
                                          dangerouslySetInnerHTML={{
                                            __html: item?.text ?? item,
                                          }}
                                        />
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}

                            {/* Requirements */}
                            {/* {state?.jobDetail?.requirements && (
                          <div className="border-b  px-2 py-2 pb-5">
                            <h2 className="text-lg font-semibold text-black mb-4">
                              Requirements
                            </h2>
                            <ul className="space-y-3">
                              {state?.jobDetail?.requirements?.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-3"
                                  >
                                    {(item?.type === "list" || typeof item === "string") && <Check className="w-5 h-5 text-[#F2B31D] mt-1 flex-shrink-0" />}
                                    <span dangerouslySetInnerHTML={{ __html: item?.text ?? item }} />
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )} */}

                            {/* Skills */}
                            {/* {state?.jobDetail?.skills && (
                          <div className="  px-2 py-2 pb-5">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                              Skills
                            </h2>
                            <div className="flex flex-wrap gap-2">
                              {state?.jobDetail?.skills?.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-clr1 text-gray-700 rounded-full text-sm font-medium"
                                >
                                  {skill?.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )} */}
                          </div>

                          {state.jobDetail?.user_is_applied === false ? (
                            <button
                              onClick={() => {
                                setState({ jobID: state?.jobDetail?.id });
                                handleApply();
                              }}
                              className="bg-[#1E3786]  text-md border border-xl border-[#1E3786] rounded rounded-3xl  px-6 py-1  hover:bg-[#1E3786] transition-colors text-white hover:text-white !mt-[10px] whitespace-nowrap"
                            >
                              {state.jobDetail?.apply_link
                                ? " Apply on company's site"
                                : " Apply Now"}
                            </button>
                          ) : (
                            <div
                              className="text-sm font-medium text-green-600 bg-green-50 border border-green-200 w-fit rounded-full px-4 py-1 "
                              style={{ marginTop: "20px" }}
                            >
                              ✓ Applied
                            </div>
                          )}
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-full xl:w-80 flex-shrink-0 mt-3 ">
                          <div className="sticky top-20 space-y-4 ">
                            {/* Job Details */}
                            <div className="bg-clr2   border border-[#c7c7c787]  px-5 py-5">
                              <h3 className="text-lg font-semibold text-black mb-2">
                                Job Overview
                              </h3>
                              <div className="space-y-2">
                                {/* <div>
                          <p className="text-md font-medium  pb-1">Job type</p>
                          <p className="text-md text-black">
                            {state?.jobDetail?.job_type_obj?.name}
                          </p>
                        </div> */}
                                <div>
                                  <span className=" flex gap-2 text-md font-medium  pb-1">
                                    <Workflow className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                                    Job Title
                                  </span>
                                  <p className="text-md text-gray-500  ps-6">
                                    {job_title(state?.jobDetail)}
                                  </p>
                                </div>

                                <div>
                                  <span className="flex gap-2 text-md font-medium  pb-1">
                                    <Building2 className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                                    Department
                                  </span>
                                  <div className="text-md text-gray-500 ps-6">
                                    {state?.jobDetail?.department?.map(
                                      (item, index) => (
                                        <div key={index}>
                                          <span
                                            className="hover:text-[#1E3786] cursor-pointer hover:underline"
                                            onClick={(e) =>
                                              getDepartment(e, item.id)
                                            }
                                          >
                                            {item.name}
                                          </span>
                                          {index <
                                            state.jobDetail.department.length -
                                              1 && ", "}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <span className=" flex gap-2 text-md font-medium  pb-1">
                                    <Briefcase className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                                    Experience level
                                  </span>
                                  <p className="text-md text-gray-500  ps-6">
                                    {state?.jobDetail?.experiences?.name}
                                  </p>
                                </div>
                                <div>
                                  <span className="flex gap-2 text-md font-medium  pb-1">
                                    <IndianRupee className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                                    Salary
                                  </span>
                                  <p className="text-md text-gray-500 ps-6">
                                    {state?.jobDetail?.salary_range_obj?.name}
                                  </p>
                                </div>

                                {state?.jobDetail?.locations?.length > 0 && (
                                  <div>
                                    <span className="flex gap-2 text-md font-medium  pb-1">
                                      <MapPin className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                                      Location
                                    </span>
                                    <p className="text-md text-gray-500  ps-6">
                                      {state?.jobDetail?.locations
                                        ?.map((item) => item.city)
                                        .join(", ")}
                                      {/* {state?.jobDetail?.college?.address} */}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Company Info */}

                            {state?.jobDetail?.job_image && (
                              <div
                                className="bg-white  border border-[#c7c7c787] cursor-pointer  p-5"
                                onClick={() => setState({ imgOpen: true })}
                              >
                                <img
                                  src={state?.jobDetail?.job_image}
                                  alt={state?.jobDetail?.job_title}
                                  className="w-100 max-h-[400px]"
                                />
                              </div>
                            )}
                            <div className="bg-white  border border-[#c7c7c787]  p-5">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                About
                              </h3>
                              <div className="flex items-start gap-3 mb-4">
                                {selectedJob?.college?.college_logo ? (
                                  <img
                                    src={selectedJob.college.college_logo}
                                    alt={selectedJob.college.name}
                                    className="w-12 h-12 rounded-3xl object-contain"
                                  />
                                ) : (
                                  <div
                                    className={`w-12 h-8 rounded-3xl bg-gray-400  flex items-center justify-center text-white bg-gray-400 font-semibold`}
                                  >
                                    {selectedJob.college?.name
                                      ?.slice(0, 1)
                                      .toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <h4
                                    className="font-medium text-gray-900 cursor-pointer hover:underline"
                                    onClick={(e) =>
                                      getCollege(
                                        e,
                                        state?.jobDetail.college?.id,
                                      )
                                    }
                                  >
                                    {state?.jobDetail?.college?.name}
                                  </h4>
                                  {/* <p className="text-sm text-gray-500">
                                Technology Company
                              </p> */}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  isIntentionalNav.current = true;
                                  setSelectedJob(null);
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });

                                  router.push(
                                    `/jobs?college=${state?.jobDetail?.college?.id}`,
                                  );
                                }}
                                className="px-6 py-2 rounded-full text-sm font-medium transition-colors bg-[#1E3786] text-white group-hover:bg-[#F2B31D] group-hover:text-black"
                              >
                                {state?.jobDetail?.college?.total_jobs || 0} Job
                                Openings
                              </button>
                              <p className="leading-relaxed">
                                {state?.jobDetail?.college_detail}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="relative flex flex-col lg:flex-row gap-4">
                <div
                  className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
                    isSidebarOpen
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                />

                {/* Mobile STICKY SIDEBAR */}
                <div
                  className={`fixed lg:hidden z-50 left-0 top-0 h-full w-80 bg-clr1 transition-transform ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                  }`}
                >
                  <Filterbar
                    filters={filters}
                    onFilterChange={setFilters}
                    categoryList={state?.categoryList}
                    locationList={state?.locationList}
                    jobTypeList={state?.jobTypeList}
                    experienceList={state?.experienceList}
                    collegeList={state?.collegeList}
                    deptList={state?.deptList}
                    datePostedList={state?.datePostedList}
                    salaryRangeList={state?.salaryRangeList}
                    jobRoleList={state?.jobRoleList}
                    tagsList={state?.tagsList}
                    loading={state.loading}
                    masterExperienceRaw={state?.masterExperienceRaw ?? []}
                    filterExperienceRaw={state?.filterExperienceRaw ?? []}
                    academicResponsibilityList={
                      state?.academicResponsibilityList ?? []
                    }
                    closeModal={() => {
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                      setIsMobileFilterOpen(false);
                    }}

                    // filterList={state.filterList}
                    // filters={filters}
                    // // onFilterChange={(data: any) => setFilters(data)}
                    // onFilterChange={(data: any) => {
                    //   console.log("✌️data --->", data);

                    //   setFilters(data);
                    // }}
                    // loading={state.loading}
                  />
                </div>

                {/* DESKTOP STICKY SIDEBAR */}
                <div
                  className="w-80 hidden lg:block shrink-0 relative"
                  ref={sidebarWrapperRef}
                >
                  {/* make the filter wrapper scrollable if it grows taller than viewport */}
                  <div
                    className="bg-clr2 border border-[#c7c7c787] overflow-y-scroll max-h-[85vh] scrollbar-thin  scrollbar-hide hover:scrollbar-default pb-14 jobs-filter-sidebar"
                    ref={sidebarRef}
                  >
                    <Filterbar
                      // filterList={state.filterList}
                      // filters={filters}
                      // // onFilterChange={setFilters}
                      // onFilterChange={(data: any) => {
                      //   console.log("✌️data --->", data);

                      //   setFilters(data);
                      // }}
                      // loading={state.loading}
                      filters={filters}
                      onFilterChange={setFilters}
                      categoryList={state?.categoryList}
                      locationList={state?.locationList}
                      jobTypeList={state?.jobTypeList}
                      experienceList={state?.experienceList}
                      collegeList={state?.collegeList}
                      deptList={state?.deptList}
                      datePostedList={state?.datePostedList}
                      salaryRangeList={state?.salaryRangeList}
                      jobRoleList={state?.jobRoleList}
                      tagsList={state?.tagsList}
                      loading={state.loading}
                      masterExperienceRaw={state?.masterExperienceRaw ?? []}
                      filterExperienceRaw={state?.filterExperienceRaw ?? []}
                      academicResponsibilityList={
                        state?.academicResponsibilityList ?? []
                      }
                      closeModal={() => {
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                        setIsMobileFilterOpen(false);
                      }}
                    />
                  </div>
                </div>

                <div className="flex-grow relative" ref={jobListContainerRef}>
                  {/* content input header start */}
                  <div
                    ref={(node) => {
                      searchBarWrapperRef.current = node;
                      promptSuggestPopoverMainRef.current = node;
                    }}
                    className="relative z-30"
                  >
                    <div
                      ref={(node) => {
                        searchBarRef.current = node;
                      }}
                      className="jobs-search-bar z-30 bg-white  self-start items-center flex justify-center border border-[#c7c7c787] rounded-3xl"
                    >
                      <div className="flex flex-row items-center w-full bg-clr2  rounded-3xl  p-1">
                        <div className="flex-grow flex items-center ps-3 md:px-6 py-2  lg:py-0 w-full lg:w-auto ">
                          <Search color="#5c5a5a93" size={22} />
                          <input
                            type="text"
                            placeholder="Search by: Job tittle, Position, Keyword..."
                            className="w-full pl-4 bg-transparent text-sm  focus:outline-none placeholder:text-[#313131] placeholder:font-normal font-medium  text-black"
                            value={state.search}
                            onChange={(e) => {
                              handleSearchInputChange(e.target.value);
                            }}
                            onFocus={(e) => {
                              openMainPromptSuggestionsFromValue(
                                e.currentTarget.value,
                              );
                            }}
                            onMouseDown={(e) => {
                              if (e.button !== 0) return;
                              openMainPromptSuggestionsFromValue(
                                (e.target as HTMLInputElement).value,
                              );
                            }}
                            onKeyDown={(e) => {
                              void handlePromptInputKeyDown(e);
                            }}
                          />
                          {state.search?.trim() && (
                            <button
                              type="button"
                              onClick={handleClearFilters}
                              className="border-none flex items-center justify-center w-8 h-8 rounded-full border border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                              aria-label="Clear search and filters"
                              title="Clear search"
                            >
                              <X size={18} color="#374151" />
                            </button>
                          )}
                        </div>

                        {/* {isWideScreen && (
                          <div className="hidden lg:block w-px h-6 bg-[#000]/40"></div>
                        )} */}

                        <div className="hidden lg:flex items-center w-full lg:w-auto lg:p-1 gap-2 border-t lg:border-t-0 border-slate-100">
                          {/* <div className="flex items-center px-4 flex-grow lg:w-64 ">
                            <MapPin color="#5c5a5a93" size={22} />

                            <CustomSelect
                              options={state.locationList}
                              value={filters.locations}
                              onChange={(selected) =>
                                setFilters({
                                  ...filters,
                                  locations: selected ? selected.value : null,
                                })
                              }
                              className="py-0 border-none"
                              placeholder="Location"
                            />
                           
                            <button className="p-2 text-slate-400 hover:text-amber-500 transition-colors"></button>
                          </div> */}

                          {/* {isWideScreen && (
                            <div className="hidden lg:block w-px h-6 bg-[#000]/40"></div>
                          )} */}

                          {isLoggedIn && (
                            <button
                              onClick={handlePreferredToggle}
                              className={`jobs-preferred-btn hidden lg:flex items-center gap-1 px-3 py-1.5 me-3 rounded-full text-xs font-medium transition-colors ${
                                preferredOnly
                                  ? "bg-[#1E3786] text-white border-none"
                                  : "bg-gray-100 text-[#1E3786] border border-[#1E3786] hover:bg-gray-200"
                              }`}
                            >
                              <CrownIcon
                                size={13}
                                className={` ${preferredOnly ? "text-white" : "text-[#1E3786]"} `}
                              />
                              Preferred Jobs
                            </button>
                          )}

                          {isWideScreen && (
                            <div className="hidden lg:flex items-center gap-1 px-2 ">
                              <button
                                onClick={() => setViewType("grid")}
                                className={`p-2 rounded-md transition-colors ${
                                  viewType === "grid"
                                    ? "bg-[#1E3786] text-white"
                                    : "text-gray-400 hover:bg-gray-100"
                                }`}
                              >
                                <LayoutGrid size={15} />
                              </button>

                              <button
                                onClick={() => setViewType("list")}
                                className={`p-2 rounded-md transition-colors ${
                                  viewType === "list"
                                    ? "bg-[#1E3786] text-white"
                                    : "text-gray-400 hover:bg-gray-100"
                                }`}
                              >
                                <List size={15} />
                              </button>
                            </div>
                          )}

                          {/* <button
                      className="hover-bg-[#F2B31D]  text-md border border-xl border-[#F2B31D] rounded rounded-3xl  px-6 py-1  hover:bg-[#E5A519] transition-colors text-black hover:text-white"
                      onClick={() => jobList(state?.page)}
                    >
                      Find Job
                    </button> */}
                        </div>
                      </div>

                      {/* content body job list */}
                    </div>
                    <JobSearchPromptSuggestions
                      open={promptSuggestionsOpenMain}
                      rows={promptSuggestions}
                      onPick={handlePromptSuggestionPick}
                      highlightedIndex={promptSuggestionsHighlightIndex}
                      onHighlight={setPromptSuggestionsHighlightIndex}
                    />
                  </div>

                  <div className="py-4 lg:hidden flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="lg:hidden">
                        <Sheet
                          open={isMobileFilterOpen}
                          onOpenChange={setIsMobileFilterOpen}
                          modal={false}
                        >
                          <SheetTrigger asChild>
                            <Button variant="outline" className="w-auto">
                              <Filter className="mr-2 h-4 w-4" />
                              Filters
                            </Button>
                          </SheetTrigger>
                          <SheetContent
                            side="bottom"
                            className="h-[80vh] overflow-y-scroll scrollbar-hide scrollbar-thin hover:scrollbar-default rounded-t-3xl [&>button]:hidden"
                            onInteractOutside={(e) => e.preventDefault()}
                            onPointerDownOutside={(e) => e.preventDefault()}
                          >
                            <div className="flex items-center justify-between px-4 pb-3 border-b">
                              <SheetTitle className="text-lg font-semibold">
                                Filter Jobs
                              </SheetTitle>
                              <div className="flex items-center gap-2 justify-center">
                                {isFilterApplied() && (
                                  <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className=" bg-[#1E3786] w-fit  text-sm border border-xl border-[#1E3786] rounded rounded-3xl  px-6 py-1  hover:bg-[#1E3786] transition-colors text-white hover:text-white"
                                  >
                                    Apply
                                  </button>
                                )}
                                <button
                                  onClick={() => setIsMobileFilterOpen(false)}
                                  className="p-1 hover:bg-clr2 rounded-full"
                                >
                                  <X size={20} className="text-gray-500" />
                                </button>
                              </div>
                            </div>
                            <div className="px-4 overflow-y-scroll scrollbar-hide hover:scrollbar-default max-h-[calc(80vh-100px)]">
                              <Filterbar
                                // filterList={state.filterList}
                                // filters={filters}
                                // // onFilterChange={setFilters}
                                // onFilterChange={(data: any) => {
                                //   console.log("✌️data --->", data);

                                //   setFilters(data);
                                // }}
                                filters={filters}
                                onFilterChange={setFilters}
                                categoryList={state?.categoryList}
                                locationList={state?.locationList}
                                jobTypeList={state?.jobTypeList}
                                experienceList={state?.experienceList}
                                collegeList={state?.collegeList}
                                deptList={state?.deptList}
                                datePostedList={state?.datePostedList}
                                salaryRangeList={state?.salaryRangeList}
                                jobRoleList={state?.jobRoleList}
                                tagsList={state?.tagsList}
                                loading={state.loading}
                                masterExperienceRaw={
                                  state?.masterExperienceRaw ?? []
                                }
                                filterExperienceRaw={
                                  state?.filterExperienceRaw ?? []
                                }
                                closeModal={() => {
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                  setIsMobileFilterOpen(false);
                                }}
                              />
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                      {/* <button
                        onClick={handlePreferredToggle}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          preferredOnly
                            ? "bg-[#1E3786] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <BookmarkCheck size={13} />
                        Preferred Jobs
                      </button> */}
                      {isLoggedIn && (
                        <button
                          onClick={handlePreferredToggle}
                          className={`flex items-center gap-1 px-3 py-1.5 me-3 rounded-full text-xs font-medium transition-colors ${
                            preferredOnly
                              ? "bg-[#1E3786] text-white border-none"
                              : "bg-gray-100 text-[#1E3786] border border-[#1E3786] hover:bg-gray-200"
                          }`}
                        >
                          <CrownIcon
                            size={13}
                            className={` ${preferredOnly ? "text-white" : "text-[#1E3786]"} `}
                          />
                          Preferred Jobs
                        </button>
                      )}
                    </div>
                  </div>

                  <ChipFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    categoryList={state?.categoryList}
                    jobTypeList={state?.jobTypeList}
                    experienceList={state?.experienceList}
                    datePostedList={state?.datePostedList}
                    salaryRangeList={state?.salaryRangeList}
                    tagsList={state?.tagsList}
                    collegeList={state?.collegeList}
                    deptList={state?.masterDeptList}
                    locationList={state?.locationList}
                    jobRoleList={state?.masterJobRoleList}
                    academicResponsibilityList={
                      state?.academicResponsibilityList ?? []
                    }
                  />

                  {state.loading || state.jobListLoading ? (
                    <div
                      className={`grid mt-5 ${
                        viewType === "grid" || !isWideScreen
                          ? "grid-cols-1 xl:grid-cols-2"
                          : "grid-cols-1"
                      }`}
                      style={{ gap: "20px" }}
                    >
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={index}
                          className="bg-white p-6 rounded-lg border border-[#c7c7c787]"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-4 w-full">
                              <SkeletonLoader
                                type="circle"
                                width={48}
                                height={48}
                              />
                              <div className="flex-1">
                                <SkeletonLoader
                                  type="text"
                                  width="60%"
                                  height={20}
                                  style={{ marginBottom: 8 }}
                                />
                                <SkeletonLoader
                                  type="text"
                                  width="40%"
                                  height={16}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mb-4">
                            <SkeletonLoader
                              type="rect"
                              width={80}
                              height={24}
                              className="rounded-full"
                            />
                            <SkeletonLoader
                              type="rect"
                              width={80}
                              height={24}
                              className="rounded-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <SkeletonLoader type="text" width="100%" />
                            <SkeletonLoader type="text" width="80%" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : state.jobList?.length > 0 ? (
                    <>
                      {(() => {
                        const isGridView = viewType === "grid" || !isWideScreen;
                        return (
                          <div
                            className={`grid mt-5 ${
                              isGridView
                                ? "grid-cols-1 xl:grid-cols-2"
                                : "grid-cols-1"
                            } ${
                              !isGridView &&
                              "bg-white px-5 border border-[#c7c7c787]"
                            }`}
                            style={{
                              gap: "10px",
                            }}
                          >
                            {/* {filteredJobs.map((job) => ( */}
                            {state.jobList?.map((job: any) => (
                              <div
                                key={job.id}
                                // onClick={() => {
                                //   if (isMobileScreen) {
                                //     router.push(`/jobs?id=${job.id}`);
                                //   } else {
                                //     setSelectedJob(job);
                                //     setState({ jobID: job.id });
                                //     jobDetail(job.id);
                                //     if (isDesktopScreen) setShowJobDetail(true);
                                //     window.scrollTo({ top: 0, behavior: "smooth" });
                                //   }
                                // }}
                                onClick={() => {
                                  if (isTabScreen) {
                                    setIsAnimating(false);
                                    setTimeout(() => {
                                      setSelectedJob(job);
                                      setState({ jobID: job.id });
                                      setIsAnimating(true);
                                      jobDetail(job.id);
                                      window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                      });
                                    }, 100);
                                  } else {
                                    setSelectedJob(job);
                                    setState({ jobID: job.id });
                                    jobDetail(job.id);
                                    if (isDesktopScreen) setShowJobDetail(true);
                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });
                                  }
                                }}
                                className="cursor-pointer transition-transform hover:scale-10 job-card-item jobs-card-first h-full"
                              >
                                {isGridView ? (
                                  <JobCard
                                    job={job}
                                    updateList={(jobId, isSaved) =>
                                      setState({
                                        jobList: state.jobList.map((j: any) =>
                                          j.id === jobId
                                            ? { ...j, is_saved: isSaved }
                                            : j,
                                        ),
                                      })
                                    }
                                    onCollegeClick={(e, id) =>
                                      getCollege(e, id)
                                    }
                                    onDepartmentClick={(e, id) =>
                                      getDepartment(e, id)
                                    }
                                    onClick={() => {
                                      router.push(`/jobs?slug=${job?.slug}`);
                                      similarJob(job);
                                    }}
                                  />
                                ) : (
                                  <NewJobCard
                                    job={job}
                                    updateList={(jobId, isSaved) =>
                                      setState({
                                        jobList: state.jobList.map((j: any) =>
                                          j.id === jobId
                                            ? { ...j, is_saved: isSaved }
                                            : j,
                                        ),
                                      })
                                    }
                                    onCollegeClick={(e, id) =>
                                      getCollege(e, id)
                                    }
                                    onDepartmentClick={(e, id) =>
                                      getDepartment(e, id)
                                    }
                                    onClick={() => {
                                      router.push(`/jobs?slug=${job?.slug}`);
                                      similarJob(job);
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      {/* {(state.next || state?.prev) && (
                        <div className="flex justify-end items-center mt-10">
                          <PaginationComTwo
                            activeNumber={handlePageChange}
                            totalPage={state.count}
                            currentPages={state.page}
                            pageSize={state.pageSize}
                          />
                        </div>
                      )} */}

                      {state.isFetchingMore && (
                        <div
                          className={`grid mt-5 ${
                            viewType === "grid" || !isWideScreen
                              ? "grid-cols-1 xl:grid-cols-2"
                              : "grid-cols-1"
                          }`}
                          style={{ gap: "20px" }}
                        >
                          {Array.from({ length: 2 }).map((_, index) => (
                            <div
                              key={index}
                              className="bg-white p-6 rounded-lg border border-[#c7c7c787]"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4 w-full">
                                  <SkeletonLoader
                                    type="circle"
                                    width={48}
                                    height={48}
                                  />
                                  <div className="flex-1">
                                    <SkeletonLoader
                                      type="text"
                                      width="60%"
                                      height={20}
                                      style={{ marginBottom: 8 }}
                                    />
                                    <SkeletonLoader
                                      type="text"
                                      width="40%"
                                      height={16}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 mb-4">
                                <SkeletonLoader
                                  type="rect"
                                  width={80}
                                  height={24}
                                  className="rounded-full"
                                />
                                <SkeletonLoader
                                  type="rect"
                                  width={80}
                                  height={24}
                                  className="rounded-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <SkeletonLoader type="text" width="100%" />
                                <SkeletonLoader type="text" width="80%" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-clr1 rounded-2xl border border-slate-100">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <svg
                          className="w-10 h-10 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        No jobs found
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Try adjusting your filters to find more results.
                      </p>
                      <button
                        // onClick={() =>
                        //   setFilters({
                        //     searchQuery: "",
                        //     location: "",
                        //     categories: [],
                        //     jobTypes: [],
                        //     experienceLevels: [],
                        //     datePosted: "All",
                        //     salaryRange: [0, 9999],
                        //     tags: [],
                        //     experience: "",
                        //   })
                        // }
                        className="mt-6 text-amber-600 font-bold hover:underline"
                        onClick={handleClearFilters}
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Job Detail Sheet */}
            {isMobileScreen && (
              <Sheet
                open={!!selectedJob}
                onOpenChange={() => setSelectedJob(null)}
              >
                <SheetContent
                  side="bottom"
                  className="h-[90vh] rounded-t-3xl flex flex-col"
                >
                  {selectedJob && (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-6 pb-20">
                        <SheetHeader>
                          <div className="flex items-start gap-4">
                            {state.jobDetail?.college?.college_logo ? (
                              <img
                                src={state.jobDetail.college?.college_logo}
                                alt={state.jobDetail.college?.name}
                                className="w-10 h-10 rounded-lg object-contain"
                                onClick={(e) =>
                                  getCollege(e, state?.jobDetail.college?.id)
                                }
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-lg bg-gray-400 flex items-center justify-center text-white bg-gray-400 font-semibold text-sm`}
                                onClick={(e) =>
                                  getCollege(e, state?.jobDetail.college?.id)
                                }
                              >
                                {state.jobDetail?.college?.name
                                  ?.slice(0, 1)
                                  .toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 text-left">
                              <SheetTitle className="text-xl font-bold text-gray-900 text-left">
                                {capitalizeFLetter(job_title(state.jobDetail))}
                              </SheetTitle>
                              <p
                                className="text-gray-600 text-left"
                                onClick={(e) =>
                                  getCollege(e, state?.jobDetail.college?.id)
                                }
                              >
                                {state.jobDetail?.college?.name}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm text-gray-600">
                                  {moment(state.jobDetail?.created_at).isValid()
                                    ? moment(
                                        state.jobDetail?.created_at,
                                      ).fromNow()
                                    : "Just now"}
                                </span>
                                {state?.jobDetail?.immediate_join && (
                                  <span className="bg-green-100 rounded-full px-2 py-0.5 text-[10px] text-green-700 font-semibold">
                                    ⚡ Immediate Hiring
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </SheetHeader>

                        <div className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2 bg-clr2 px-2 py-1 rounded text-xs">
                            <Briefcase className="w-3 h-3 text-[#E6AB1D]" />
                            <span>{state.jobDetail?.experiences?.name} </span>
                          </div>
                          {/* <div className="flex items-center gap-1 bg-clr2 px-2 py-1 rounded text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{state.jobDetail?.job_type_obj?.name}</span>
                      </div> */}
                          <div className="flex items-center gap-2 bg-clr2 px-2 py-1 rounded text-xs">
                            <IndianRupee className="w-3 h-3 text-[#E6AB1D]" />
                            <span>
                              {state.jobDetail?.salary_range_obj?.name}
                            </span>
                          </div>
                          {state?.jobDetail?.college?.address && (
                            <div className="flex items-center gap-2 bg-clr2 px-2 py-1 rounded text-xs">
                              <MapPin className="w-3 h-3 text-[#E6AB1D]" />
                              <span>
                                {state.jobDetail?.locations
                                  ?.map((item) => item.city)
                                  .join(", ")}
                                {/* {state?.jobDetail?.college?.address} */}
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="leading-relaxed space-y-6 ">
                            {state?.jobDetail?.department?.length > 0 && (
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">
                                  Departments
                                </h3>

                                <div className="flex flex-wrap gap-3 mb-5">
                                  {state?.jobDetail?.department?.map(
                                    (item, index) => (
                                      <button
                                        key={index}
                                        onClick={(e) =>
                                          getDepartment(e, item.id)
                                        }
                                        className="px-3 py-1 text-xs leading-relaxed rounded-full
                       bg-blue-50 text-[#1E3786]
                       border border-blue-100
                       hover:bg-[#1E3786] hover:text-white
                       transition-all duration-200"
                                      >
                                        {item.name}
                                      </button>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {state?.new_job_qualification?.length > 0 ? (
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-3">
                                Job Qualification
                              </h3>
                              <div className="space-y-2">
                                {state.new_job_qualification?.map(
                                  (responsibility, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start gap-2"
                                    >
                                      {responsibility?.type === "list" && (
                                        <Check className="w-5 h-5 text-[#F2B31D] mt-1 flex-shrink-0 text-sm" />
                                      )}
                                      <p
                                        className="text-gray-600 text-sm"
                                        dangerouslySetInnerHTML={{
                                          __html:
                                            responsibility?.text ??
                                            responsibility,
                                        }}
                                      ></p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-lg font-bold text-gray-900 mb-3 mt-2">
                                Job Qualification
                              </h3>
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {state.jobDetail?.qualification}
                              </p>
                            </>
                          )}
                        </div>

                        {state?.responsibilities?.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">
                              Key Responsibilities
                            </h3>
                            <div className="space-y-2">
                              {state.responsibilities?.map(
                                (responsibility, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    {responsibility?.type === "list" && (
                                      <Check className="w-5 h-5 text-[#F2B31D] mt-1 flex-shrink-0 text-sm" />
                                    )}
                                    <p
                                      className="text-gray-600 text-sm"
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          responsibility?.text ??
                                          responsibility,
                                      }}
                                    ></p>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {/* {state?.jobDetail?.requirements && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">
                              Requirements
                            </h3>
                            <div className="space-y-2">
                              {state?.jobDetail?.requirements?.map(
                                (requirements, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-gray-600 text-sm">
                                      {requirements}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )} */}

                        {/* {state?.jobDetail?.skills && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">
                              Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {state?.jobDetail?.skills?.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-clr2 text-gray-700 rounded-full text-sm font-medium"
                                >
                                  {skill?.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )} */}

                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-3">
                            Job Overview
                          </h3>

                          <div className="space-y-3">
                            {/* <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Job type
                          </p>
                          <p className="text-sm text-gray-900">
                            {state.jobDetail?.job_type_obj?.name}
                          </p>
                        </div> */}
                            <div>
                              <span className=" flex gap-2 text-sm font-medium  pb-1">
                                <Workflow className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                                Job Title
                              </span>
                              <p className="text-sm text-gray-500  ps-6">
                                {/* {capitalizeFLetter(state?.jobDetail?.job_title)} */}
                                {capitalizeFLetter(job_title(state.jobDetail))}
                              </p>
                            </div>

                            <div>
                              <span className="flex gap-2 text-md font-medium  pb-1">
                                <Building2 className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                                Department
                              </span>
                              <div className="text-md text-gray-500 ps-6">
                                {state?.jobDetail?.department?.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="text-sm text-gray-500"
                                    >
                                      <span
                                        className="text-sm text-gray-500 hover:text-[#1E3786] cursor-pointer hover:underline"
                                        onClick={(e) =>
                                          getDepartment(e, item.id)
                                        }
                                      >
                                        {item.name}
                                      </span>
                                      {index <
                                        state.jobDetail.department.length - 1 &&
                                        ", "}
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                            <div>
                              <span className=" flex gap-2 text-sm font-medium  pb-1">
                                <Briefcase className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                                Experience level
                              </span>
                              <p className="text-sm text-gray-500  ps-6">
                                {state?.jobDetail?.experiences?.name}
                              </p>
                            </div>
                            <div>
                              <span className="flex gap-2 text-sm font-medium  pb-1">
                                <IndianRupee className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                                Salary
                              </span>
                              <p className="text-sm text-gray-500 ps-6">
                                {state?.jobDetail?.salary_range_obj?.name}
                              </p>
                            </div>

                            {state?.jobDetail?.locations?.length > 0 && (
                              <div>
                                <span className="flex gap-2 text-sm font-medium  pb-1">
                                  <MapPin className="w-4 h-4 mt-1 text-[#E6AB1D]" />{" "}
                                  Location
                                </span>
                                <p className="text-sm text-gray-500  ps-6">
                                  {state?.jobDetail?.locations
                                    ?.map((item) => item.city)
                                    .join(", ")}
                                  {/* {state?.jobDetail?.college?.address} */}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {state?.jobDetail?.job_image && (
                          <div
                            className="pt-4 cursor-pointer"
                            onClick={() => {
                              setSelectedJob(null);
                              setState({ imgOpen: true });
                            }}
                          >
                            <img
                              src={state?.jobDetail?.job_image}
                              alt={state?.jobDetail?.job_title}
                              className="w-100 max-h-[400px]"
                            />
                          </div>
                        )}

                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-3">
                            About
                          </h3>
                          <div className="flex items-start gap-3 mb-4">
                            {state.jobDetail?.college?.college_logo ? (
                              <img
                                src={state.jobDetail?.college?.college_logo}
                                alt={state.jobDetail?.college?.name}
                                className="w-12 h-12 rounded-lg object-contain"
                                onClick={(e) =>
                                  getCollege(e, state?.jobDetail.college?.id)
                                }
                              />
                            ) : (
                              <div
                                className={`w-12 h-12 rounded-lg bg-gray-400  flex items-center justify-center text-white bg-gray-400 font-semibold`}
                                onClick={(e) =>
                                  getCollege(e, state?.jobDetail.college?.id)
                                }
                              >
                                {state.jobDetail?.college?.name
                                  ?.slice(0, 1)
                                  .toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4
                                className="font-medium text-gray-900"
                                onClick={(e) =>
                                  getCollege(e, state?.jobDetail.college?.id)
                                }
                              >
                                {state.jobDetail?.college?.name}
                              </h4>
                              {/* <p className="text-sm text-gray-500">
                                Technology Company
                              </p> */}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              isIntentionalNav.current = true;
                              setSelectedJob(null);
                              window.scrollTo({ top: 0, behavior: "smooth" });

                              router.push(
                                `/jobs?college=${state?.jobDetail?.college?.id}`,
                              );
                            }}
                            className="px-6 py-2 rounded-full text-sm font-medium transition-colors bg-[#1E3786] text-white group-hover:bg-[#F2B31D] group-hover:text-black"
                          >
                            {state?.jobDetail?.college?.total_jobs || 0}{" "}
                            Openings
                          </button>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {state.jobDetail?.company_detail}
                          </p>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-clr1 border-t">
                        {state.jobDetail?.user_is_applied === false ? (
                          <button
                            onClick={() => {
                              setState({ jobID: state.jobDetail?.id });
                              handleApply();
                            }}
                            className="bg-[#1E3786] w-full py-3 text-md border border-xl border-[#1E3786] rounded rounded-3xl  px-6 py-1  hover:bg-[#1E3786] transition-colors text-white hover:text-white whitespace-nowrap"
                          >
                            {state.jobDetail?.apply_link
                              ? " Apply on company's site"
                              : " Apply Now"}
                          </button>
                        ) : (
                          <span className="w-full text-center text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-4 py-2 block">
                            ✓ Applied
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </SheetContent>
              </Sheet>
            )}

            <Modal
              isOpen={showApplicationModal}
              setIsOpen={() => {
                setState({ errors: {} });
                setShowApplicationModal(false);
              }}
              title={capitalizeFLetter(job_title(selectedJob))}
              width="700px"
              renderComponent={() => (
                <div className="space-y-2 bg-[#EFF2F6] overflow-y-auto py-4 px-2 max-h-[85vh] ">
                  <div className="flex items-center justify-center w-full mb-6">
                    <img
                      src="/assets/images/recruitmen.gif"
                      height={200}
                      width={150}
                      alt="Job Application"
                      className="object-contain w-[100px] h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
                    <Input
                      placeholder="First Name*"
                      value={state.firstName}
                      bg="ffffff"
                      onChange={(e) =>
                        handleFormChange("firstName", e.target.value)
                      }
                      required
                      error={state.errors?.first_name}
                    />
                    <Input
                      placeholder="Last Name*"
                      value={state.lastName}
                      onChange={(e) =>
                        handleFormChange("lastName", e.target.value)
                      }
                      required
                      bg="ffffff"
                      error={state.errors?.last_name}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="email"
                      placeholder="Email*"
                      value={state.email}
                      onChange={(e) =>
                        handleFormChange("email", e.target.value)
                      }
                      required
                      bg="ffffff"
                      error={state.errors?.email}
                    />
                    {/* <Input
                  type="tel"
                  placeholder="Phone Number*"
                  value={state.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  required
                  bg="ffffff"

                /> */}

                    <CustomPhoneInput
                      // title="Phone Number"
                      value={state.phone}
                      onChange={(value) => handleFormChange("phone", value)}
                      error={state.errors?.phone}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <CustomSelect
                        // title="Experience"
                        required
                        className="border border-gray-200 bg-white placeholder:!text-gray-500 placeholder:!text-sm h-fit"
                        options={state.masterExperienceList}
                        value={state?.experience || ""}
                        onChange={(selected) =>
                          setState({
                            ...state,
                            experience: selected ? selected.value : "",
                          })
                        }
                        error={state?.errors?.experience}
                        placeholder="Experience"
                      />
                    </div>

                    <Input
                      type="colleges"
                      placeholder="colleges*"
                      value={state.colleges}
                      className="border border-gray-100 !bg-[#fff] placeholder:!text-gray-500 placeholder:!text-sm"
                      required
                      disabled
                    />
                  </div>

                  {state.jobDetail?.department?.length > 0 && (
                    <CustomMultiSelect
                      title="Choose Department"
                      options={state.jobDetail.department.map((d) => ({
                        value: d.id,
                        label: d.name,
                      }))}
                      className="border border-gray-200 bg-white placeholder:!text-gray-500 placeholder:!text-sm h-fit"
                      value={state.department_id || []}
                      onChange={(selected: any) => {
                        handleFormChange("department_id", selected);
                      }}
                      placeholder="Select a department"
                      isMulti={true}
                      error={state.errors.department_id}
                      disabled={state.jobDetail.department.length === 1}
                    />
                  )}

                  <div className="grid grid-cols-1 !gap-4 !mt-4">
                    <TextArea
                      title="Cover Letter (Edit as your wish)"
                      value={state.message}
                      onChange={(e) =>
                        handleFormChange("message", e.target.value)
                      }
                      className="min-h-[100px] bg-white"
                    />

                    {/* <TextArea
                  type="email"
                  placeholder="Email*"
                  value={state.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  required
                  bg="ffffff"
                /> */}

                    <FileUpload
                      value={state.resume || null}
                      onChange={(file) => handleFormChange("resume", file)}
                      error={state.errors?.resume}
                    />
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      type="button"
                      onClick={handleFormSubmit}
                      className="px-12 py-3 bg-[#1E3786] hover:bg-[#1E3786] text-white font-semibold rounded-full"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              )}
            />

            <Modal
              isOpen={state.showApplyChoiceModal}
              setIsOpen={() => setState({ showApplyChoiceModal: false })}
              title="Apply for Job"
              width="500px"
              renderComponent={() => (
                <div className="p-6 space-y-2">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Choose how you want to apply
                    </h3>
                    <p className="text-sm text-gray-500">
                      Log in for a faster application process or continue as a
                      guest.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 !gap-2">
                    <Button
                      onClick={handleLoginRedirect}
                      className="w-full py-6 bg-[#1E3786] hover:bg-[#1E3786]/90 flex items-center justify-start gap-4 px-6 text-white text-base font-medium rounded-xl transition-all"
                    >
                      <div className="p-2 bg-white/10 rounded-lg">
                        <LogIn size={20} className="text-white" />
                      </div>
                      Login to apply
                    </Button>

                    <Button
                      onClick={handleRegisterRedirect}
                      variant="outline"
                      className="w-full mt-3 py-6 border-2 border-gray-100 hover:border-[#1E3786] hover:bg-blue-50 flex items-center justify-start gap-4 px-6 text-gray-700 text-base font-medium rounded-xl transition-all"
                    >
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <UserPlus size={20} />
                      </div>
                      Register to apply
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#eff2f6] px-2 text-gray-500">
                          Or
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleContinueAsGuest}
                      className="w-full py-0 text-[#1E3786] font-semibold hover:underline transition-all"
                    >
                      Continue as Unregistered User
                    </button>
                  </div>
                </div>
              )}
            />

            {state.imgOpen && (
              <LightboxGallery
                isOpen={state.imgOpen}
                onClose={() => {
                  if (isMobileScreen) {
                    setSelectedJob(state.jobDetail);
                  }
                  setState({ imgOpen: false });
                }}
                images={[state?.jobDetail?.job_image]}
              />
            )}
            <Modal
              isOpen={state.congratsOpen}
              setIsOpen={() => {
                setState({ errors: {}, congratsOpen: false });
              }}
              title="Job Application Success"
              width="750px"
              hideHeader={true}
              renderComponent={() => (
                <div className="relative min-h-[500px] bg-[#f3f4f6] flex flex-col items-center justify-center text-center p-12 overflow-hidden">
                  {/* Large background circles */}
                  <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-gray-300 opacity-30 rounded-full"></div>
                  <div className="absolute -top-20 right-[-100px] w-[380px] h-[380px] bg-gray-300 opacity-30 rounded-full"></div>

                  {/* Small decorative circles */}
                  <div className="absolute top-24 left-32 w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div className="absolute top-28 right-40 w-4 h-4 bg-[#1E3786] rounded-full"></div>
                  <div className="absolute bottom-32 left-40 w-3 h-3 bg-gray-300 rounded-full"></div>

                  {/* Success star badge */}
                  <div className="relative mb-8 z-10">
                    <div className="w-40 h-40 relative">
                      <img
                        src="/assets/images/job-check.png"
                        alt="Success Star"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <h2 className="text-4xl font-bold text-gray-900 mb-6 z-10">
                    Congrats, your job applied!
                  </h2>

                  {typeof window !== "undefined" &&
                  localStorage.getItem("user") ? (
                    <Button
                      onClick={() =>
                        router.push("/profile?tab=My Applications")
                      }
                      className="mt-5 bg-[#1E3786] hover:bg-[#1E3786]"
                    >
                      Go to Applied Job List
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setState({ congratsOpen: false });
                        setSelectedJob(null);
                        setShowJobDetail(false);
                      }}
                      className="mt-5 bg-[#1E3786] hover:bg-[#1E3786]"
                    >
                      Search More Jobs
                      <Search className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}
            />
            <Modal
              isOpen={state.showCollegeModal}
              setIsOpen={() => {
                setState({ showCollegeModal: false, collegeDetail: null });
              }}
              title="College Details"
              width="700px"
              renderComponent={() => (
                <div className="p-4 sm:p-5 md:p-6 space-y-5 md:space-y-6 max-h-[75vh] overflow-y-auto">
                  {state.loading ? (
                    <div className="space-y-6">
                      <div className="flex gap-4 items-center border-b pb-4">
                        <SkeletonLoader
                          type="rect"
                          width={80}
                          height={80}
                          className="rounded-xl"
                        />
                        <div className="flex-1">
                          <SkeletonLoader
                            type="text"
                            width="60%"
                            height={24}
                            style={{ marginBottom: 8 }}
                          />
                          <SkeletonLoader type="text" width="40%" height={16} />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <SkeletonLoader type="text" count={3} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <SkeletonLoader
                          type="rect"
                          height={80}
                          className="rounded-xl"
                        />
                        <SkeletonLoader
                          type="rect"
                          height={80}
                          className="rounded-xl"
                        />
                      </div>
                      <SkeletonLoader type="text" count={4} />
                    </div>
                  ) : (
                    <>
                      {/* ================= College Header ================= */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-5 pb-4 md:pb-5 border-b text-center sm:text-left">
                        {state.collegeDetail?.college_logo ? (
                          <img
                            src={state.collegeDetail.college_logo}
                            alt={state.collegeDetail.college_name}
                            className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl object-cover border shadow-sm"
                          />
                        ) : (
                          <div
                            className={`w-14 h-14 bg-gray-400 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl  flex items-center justify-center text-white font-bold text-lg sm:text-xl md:text-2xl shadow`}
                          >
                            {state.collegeDetail?.college_name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>
                        )}

                        <div>
                          <h2 className="text-xl sm:text-2xl font-semibold text-[#1E3786]">
                            {state.collegeDetail?.college_name}
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {state.collegeDetail?.institution_name}
                          </p>
                        </div>
                      </div>

                      {/* ================= Contact Info ================= */}
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
                          Contact Info
                        </h3>

                        <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MailIcon className="w-4 h-4 text-[#F2B31D]" />
                            <span className="truncate">
                              {state.collegeDetail?.college_email}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <PhoneCall className="w-4 h-4 text-[#F2B31D]" />
                            {state.collegeDetail?.college_phone}
                          </div>

                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-[#F2B31D]" />
                            <span className="line-clamp-2">
                              {state.collegeDetail?.college_address}
                            </span>
                          </div>

                          {state.collegeDetail?.college_types && (
                            <div className="flex items-start gap-2">
                              <Building className="w-4 h-4 text-[#F2B31D] " />
                              <span className="line-clamp-2">
                                {state.collegeDetail?.college_types
                                  ?.map((item) => item?.name)
                                  ?.join(" ,")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ================= NAAC Accreditation ================= */}
                      {state.collegeDetail?.naac_accreditations?.length > 0 && (
                        <div className="bg-white shadow-md rounded-2xl p-4 sm:p-5 md:p-6">
                          <div className="flex flex-col sm:flex-row items-center gap-3 mb-3 md:mb-4 text-center sm:text-left">
                            <img
                              src="/assets/images/naac.png"
                              alt="NAAC Logo"
                              className="h-10 sm:h-12 object-contain"
                            />
                            <h3 className="text-base sm:text-lg font-semibold text-[#1E3786]">
                              NAAC & Accreditation
                            </h3>
                          </div>

                          <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                            {state.collegeDetail?.naac_accreditations?.map(
                              (item, index) => (
                                <span
                                  key={index}
                                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-green-100 text-green-700"
                                >
                                  {item.grade}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* ================= NIRF Details ================= */}
                      {(state.collegeDetail?.nirf_band ||
                        state.collegeDetail?.nirf_categories?.length > 0) && (
                        <div className="bg-white shadow-md rounded-2xl p-4 sm:p-5 md:p-6">
                          <div className="flex flex-col sm:flex-row items-center gap-3 mb-3 md:mb-4 text-center sm:text-left">
                            <img
                              src="/assets/images/nirf.png"
                              alt="NIRF Logo"
                              className="h-6 sm:h-8 object-contain"
                            />
                            <h3 className="text-base sm:text-lg font-semibold text-[#1E3786]">
                              NIRF Rankings
                            </h3>
                          </div>

                          <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center sm:justify-start">
                            {state.collegeDetail?.nirf_band?.is_active && (
                              <span className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-blue-100 text-blue-700">
                                Band: {state.collegeDetail?.nirf_band?.band}
                              </span>
                            )}

                            {state.collegeDetail?.nirf_categories?.map(
                              (item) =>
                                item.is_active ? (
                                  <span
                                    key={item.id}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-700"
                                  >
                                    {item.category}
                                  </span>
                                ) : null,
                            )}
                          </div>
                        </div>
                      )}

                      {/* ================= Stats ================= */}
                      {(state?.collegeDetail?.intake_per_year ||
                        state?.collegeDetail?.total_strength) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                          {state.collegeDetail?.intake_per_year && (
                            <div className="bg-[#1E3786] text-white rounded-xl p-4 md:p-5 text-center">
                              <p className="text-sm sm:text-lg font-semibold text-[#fff]">
                                Intake Per Year
                              </p>
                              <h3 className="text-xl sm:text-2xl font-bold mt-1">
                                {state.collegeDetail?.intake_per_year}
                              </h3>
                            </div>
                          )}

                          {state.collegeDetail?.total_strength && (
                            <div className="bg-[#F2B31D] text-white rounded-xl p-4 md:p-5 text-center">
                              <p className="text-sm sm:text-lg font-semibold text-[#fff]">
                                Total Strength
                              </p>
                              <h3 className="text-xl sm:text-2xl font-bold mt-1">
                                {state.collegeDetail?.total_strength}
                              </h3>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ================= Achievements ================= */}
                      {state.collegeDetail?.recent_achievements?.length > 0 && (
                        <div className="space-y-2 sm:space-y-3">
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                            Achievements
                          </h4>

                          <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                            {state.collegeDetail?.recent_achievements?.map(
                              (item, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <Award className="w-5 h-5 text-[#F2B31D] shrink-0" />
                                  {item.achievement}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      {/* ================= Summary ================= */}
                      {state.collegeDetail?.summary &&
                        state.collegeDetail?.summary !== "null" && (
                          <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                            <h4 className="font-semibold mb-2 text-gray-800 text-sm sm:text-base">
                              Summary
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                              {state.collegeDetail?.summary}
                            </p>
                          </div>
                        )}
                    </>
                  )}
                </div>
              )}
            />
            {state.departmentDetail && (
              <Modal
                isOpen={state.showDepartmentModal}
                setIsOpen={() => {
                  setState({
                    showDepartmentModal: false,
                    departmentDetail: null,
                  });
                }}
                title="Department Details"
                width="700px"
                renderComponent={() => (
                  <div className="p-5 sm:p-6 md:p-8 space-y-6 md:space-y-8 max-h-[75vh] overflow-y-auto">
                    {state.loading ? (
                      <div className="space-y-6">
                        <div className="border-b pb-4">
                          <SkeletonLoader
                            type="text"
                            width="70%"
                            height={32}
                            style={{ marginBottom: 8 }}
                          />
                          <SkeletonLoader type="text" width="40%" height={16} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <SkeletonLoader
                            type="rect"
                            height={100}
                            className="rounded-2xl"
                          />
                          <SkeletonLoader
                            type="rect"
                            height={100}
                            className="rounded-2xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <SkeletonLoader
                            type="text"
                            width="30%"
                            height={24}
                            style={{ marginBottom: 12 }}
                          />
                          <SkeletonLoader type="text" count={3} />
                        </div>
                      </div>
                    ) : (
                      state.departmentDetail && (
                        <>
                          {/* ================= Header ================= */}
                          <div className="pb-4 md:pb-6  text-center sm:text-left">
                            <h2 className="text-2xl sm:text-3xl font-semibold text-[#1E3786]">
                              {state.departmentDetail?.department_name}
                            </h2>

                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                              {state.departmentDetail.college_name}
                            </p>
                          </div>

                          {/* ================= Stats Section ================= */}
                          {(state.departmentDetail?.department_extras?.[0]
                            .nba_accreditation ||
                            state.departmentDetail?.department_extras?.[0]
                              ?.intake_per_year > 0) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 border-t">
                              {state.departmentDetail?.department_extras?.[0]
                                .nba_accreditation && (
                                <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-5 md:p-6">
                                  <div className="flex items-center gap-3 mb-3">
                                    <img
                                      src="/assets/images/nba.png"
                                      alt="NBA Logo"
                                      className="h-6 sm:h-8 object-contain"
                                    />
                                    <p className="text-base sm:text-lg font-semibold text-[#1E3786]">
                                      NBA Accreditation
                                    </p>
                                  </div>

                                  <span className="inline-flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-green-100 text-green-700">
                                    Accredited
                                  </span>
                                </div>
                              )}

                              {state.departmentDetail?.department_extras?.[0]
                                ?.intake_per_year > 0 && (
                                <div className="bg-[#1E3786] text-white rounded-2xl p-5 md:p-6 text-center shadow-sm">
                                  <p className="text-sm sm:text-lg font-semibold text-[#fff]">
                                    Intake Per Year
                                  </p>
                                  <h3 className="text-2xl sm:text-3xl font-bold mt-2">
                                    {
                                      state.departmentDetail
                                        ?.department_extras?.[0]
                                        ?.intake_per_year
                                    }
                                  </h3>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ================= Achievements ================= */}
                          {state.departmentDetail?.department_extras?.[0]
                            .recent_achievements?.length > 0 && (
                            <div>
                              <h3 className="text-base sm:text-lg font-semibold text-[#1E3786] mb-3 sm:mb-4">
                                Recent Achievements
                              </h3>

                              <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                                {state.departmentDetail?.department_extras?.[0].recent_achievements?.map(
                                  (item, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2"
                                    >
                                      <Award className="w-5 h-5 text-[#F2B31D] shrink-0" />
                                      {item.achievement}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                          {/* ================= Summary ================= */}
                          {state.departmentDetail?.department_extras?.[0]
                            .summary && (
                            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 md:p-6">
                              <h3 className="text-base sm:text-lg font-semibold text-[#1E3786] mb-2 sm:mb-3">
                                Summary
                              </h3>

                              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                {
                                  state.departmentDetail?.department_extras?.[0]
                                    .summary
                                }
                              </p>
                            </div>
                          )}
                        </>
                      )
                    )}
                  </div>
                )}
              />
            )}
          </main>
        </div>
      </div>
      <div ref={footerRef}>
        <Footer />
      </div>
    </>
  );
}
