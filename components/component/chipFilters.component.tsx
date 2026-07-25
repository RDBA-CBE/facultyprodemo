import React from "react";
import { X } from "lucide-react";

const findLabel = (list: any, value: any) =>
  list?.find((item: any) => String(item?.value) === String(value))?.label ??
  null;

type ChipFiltersCtx = {
  categoryList?: any[];
  jobTypeList?: any[];
  experienceList?: any[];
  salaryRangeList?: any[];
  tagsList?: any[];
  collegeList?: any[];
  datePostedList?: any[];
  locationList?: any[];
  deptList?: any[];
  jobRoleList?: any[];
  academicResponsibilityList?: any[];
};

/**
 * Same criteria as visible chips in this file — used to sync search bar with
 * chip add/remove actions on the jobs page.
 */
export function chipFiltersVisibleCount(
  filters: any,
  ctx: ChipFiltersCtx = {},
): number {
  const {
    categoryList = [],
    jobTypeList = [],
    salaryRangeList = [],
    tagsList = [],
    collegeList = [],
    datePostedList = [],
    locationList = [],
    deptList = [],
    jobRoleList = [],
    academicResponsibilityList = [],
  } = ctx;

  let count = 0;

  if (filters.searchQuery) count += 1;

  count += Array.isArray(filters.locations) ? filters.locations.length : 0;

  count += Array.isArray(filters.jobTypes) ? filters.jobTypes.length : 0;

  if (filters.experienceLevels?.includes("Open to all experience levels"))
    count += 1;
  if (filters.minExperience || filters.maxExperience) count += 1;

  count += Array.isArray(filters.categories) ? filters.categories.length : 0;

  count += Array.isArray(filters.jobRole) ? filters.jobRole.length : 0;

  count += Array.isArray(filters?.datePosted) ? filters.datePosted.length : 0;

  if (filters.salaryRange?.length > 0) {
    const selectedRanges = filters.salaryRange
      .map((value: any) => findLabel(salaryRangeList, value))
      .filter(Boolean);
    const numbers = selectedRanges.flatMap((range: string) => {
      const match = range.match(/\d+/g);
      return match ? match.map(Number) : [];
    });
    if (numbers.length > 0) count += 1;
  }

  count += Array.isArray(filters.colleges) ? filters.colleges.length : 0;

  count += Array.isArray(filters.department) ? filters.department.length : 0;

  count += Array.isArray(filters.academic_responsibilities)
    ? filters.academic_responsibilities.length
    : 0;

  count += Array.isArray(filters.tags) ? filters.tags.length : 0;

  return count;
}

export function chipFiltersHasAnyVisibleChip(
  filters: any,
  ctx: ChipFiltersCtx = {},
): boolean {
  return chipFiltersVisibleCount(filters, ctx) > 0;
}

const Chip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <div className="flex items-center bg-amber-100 text-amber-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
    <span className="text-[10px] md:text-[12px]">{label}</span>
    <button
      onClick={onRemove}
      className="ml-2 p-0.5 rounded-full hover:bg-amber-200"
      aria-label={`Remove ${label} filter`}
    >
      <X size={14} />
    </button>
  </div>
);

const ChipFilters = ({
  filters,
  onFilterChange,
  categoryList = [],
  jobTypeList = [],
  experienceList = [],
  salaryRangeList = [],
  tagsList = [],
  collegeList = [],
  datePostedList = [],
  locationList = [],
  deptList = [],
  jobRoleList = [],
  academicResponsibilityList = [],
}: any) => {
  const activeFilters: { label: string; onRemove: () => void }[] = [];
  const labelCacheRef = React.useRef<Record<string, string>>({});

  const cacheList = (prefix: string, list: any[]) => {
    (list ?? []).forEach((item: any) => {
      if (item?.value == null || item?.label == null) return;
      labelCacheRef.current[`${prefix}:${String(item.value)}`] = String(
        item.label,
      );
    });
  };

  cacheList("location", locationList);
  cacheList("jobType", jobTypeList);
  cacheList("category", categoryList);
  cacheList("jobRole", jobRoleList);
  cacheList("datePosted", datePostedList);
  cacheList("salaryRange", salaryRangeList);
  cacheList("college", collegeList);
  cacheList("department", deptList);
  cacheList("academic", academicResponsibilityList);
  cacheList("tag", tagsList);

  const getLabel = (prefix: string, list: any[], value: any) => {
    const direct = findLabel(list, value);
    if (direct) return direct;

    const cached = labelCacheRef.current[`${prefix}:${String(value)}`];
    if (cached) return cached;

    if (typeof value === "object" && value !== null) {
      const objLabel = String((value as any).label ?? (value as any).value ?? "");
      return objLabel || null;
    }

    // Avoid flashing raw numeric IDs (e.g. 1/61/7) before async label lists load.
    const asText = String(value ?? "").trim();
    if (/^\d+$/.test(asText)) return null;
    return asText || null;
  };

  const push = (label: string | null | undefined, onRemove: () => void) => {
    if (label !== null && label !== undefined) activeFilters.push({ label, onRemove });
  };

  // Search Query
  if (filters.searchQuery) {
    push(`Search: "${filters.searchQuery}"`, () => onFilterChange({ ...filters, searchQuery: "" }));
  }

  // Location
  filters.locations?.forEach((value) => {
    push(getLabel("location", locationList, value), () =>
      onFilterChange({ ...filters, locations: filters.locations.filter((v) => v !== value) })
    );
  });

  // Job Types
  filters.jobTypes?.forEach((value) => {
    push(getLabel("jobType", jobTypeList, value), () =>
      onFilterChange({ ...filters, jobTypes: filters.jobTypes.filter((v) => v !== value) })
    );
  });

  // Experience Range
  if (filters.experienceLevels?.includes("Open to all experience levels")) {
    push("Open to all experience levels", () =>
      onFilterChange({ ...filters, minExperience: "", maxExperience: "", experienceLevels: [] })
    );
  } else if (filters.minExperience || filters.maxExperience) {
    const min = filters.minExperience || "0";
    const max = filters.maxExperience || "";
    push(
      max ? `Experience: ${min} - ${max} Years` : `Experience: ${min}+ Years`,
      () => onFilterChange({ ...filters, minExperience: "", maxExperience: "", experienceLevels: [] })
    );
  }

  // Categories
  filters.categories?.forEach((value) => {
    push(getLabel("category", categoryList, value), () =>
      onFilterChange({ ...filters, categories: filters.categories.filter((v) => v !== value) })
    );
  });

  // Job Role
  filters.jobRole?.forEach((value) => {
    push(getLabel("jobRole", jobRoleList, value), () =>
      onFilterChange({ ...filters, jobRole: filters.jobRole.filter((v) => v !== value) })
    );
  });

  // Date Posted
  filters?.datePosted?.forEach((value) => {
    push(getLabel("datePosted", datePostedList, value), () =>
      onFilterChange({ ...filters, datePosted: filters.datePosted.filter((v) => v !== value) })
    );
  });

  // Salary Range
  if (filters.salaryRange?.length > 0) {
    const selectedRanges = filters.salaryRange
      .map((value) => findLabel(salaryRangeList, value))
      .filter(Boolean);
    const numbers = selectedRanges.flatMap((range) => {
      const match = range.match(/\d+/g);
      return match ? match.map(Number) : [];
    });
    if (numbers.length > 0) {
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      push(`Salary: ${min} - ${max} Lakhs`, () =>
        onFilterChange({ ...filters, salaryRange: [] })
      );
    }
  }

  // Colleges
  filters.colleges?.forEach((value) => {
    push(getLabel("college", collegeList, value), () =>
      onFilterChange({ ...filters, colleges: filters.colleges.filter((v) => v !== value) })
    );
  });

  // Department
  filters.department?.forEach((value) => {
    push(getLabel("department", deptList, value), () =>
      onFilterChange({ ...filters, department: filters.department.filter((v) => v !== value) })
    );
  });

  // Academic Responsibilities
  filters.academic_responsibilities?.forEach((value) => {
    push(getLabel("academic", academicResponsibilityList, value), () =>
      onFilterChange({ ...filters, academic_responsibilities: filters.academic_responsibilities.filter((v) => v !== value) })
    );
  });

  // Tags
  filters.tags?.forEach((value) => {
    push(getLabel("tag", tagsList, value), () =>
      onFilterChange({ ...filters, tags: filters.tags.filter((v) => v !== value) })
    );
  });

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 pb-2">
      {activeFilters.map((filter, index) => (
        <Chip key={index} label={filter.label} onRemove={filter.onRemove} />
      ))}
    </div>
  );
};

export default ChipFilters;
