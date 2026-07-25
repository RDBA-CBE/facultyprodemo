"use client";

import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const ChipFilter = ({ title, options, selected, onSelectionChange, count }) => {
  const selectedCount = selected.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`h-10 px-3 rounded-full border-2 transition-all ${
            selected.length > 0
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
          }`}
        >
          {title}
          {selectedCount > 0 && (
            <span className="ml-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
              {selectedCount}
            </span>
          )}
          {count && selectedCount === 0 && (
            <span className="ml-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
              {count}
            </span>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={selected.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSelectionChange([...selected, option]);
                    } else {
                      onSelectionChange(
                        selected.filter((item) => item !== option),
                      );
                    }
                  }}
                />
                <label
                  htmlFor={option}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const getLabels = (list = []) => list.map((i) => i.label);

const getLabelByValue = (list = [], value) =>
  list.find((i) => i.value === value)?.label;

const getValueByLabel = (list = [], label) =>
  list.find((i) => i.label === label)?.value;

export default function ChipFilters(props) {
  const{
    filters,
    onFilterChange,
    categoryList,
    jobTypeList,
    experienceList,
    datePostedList,
    salaryRangeList,
    tagsList,
  }= props;
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {/* Job Sectors (same as Filterbar) */}
      {/* <ChipFilter
        title="Job Sectors"
        options={getLabels(categoryList)}
        selected={(filters.categories || [])
          .map((v) => getLabelByValue(categoryList, v))
          .filter(Boolean)}
        onSelectionChange={(labels) =>
          onFilterChange({
            ...filters,
            categories: labels
              .map((l) => getValueByLabel(categoryList, l))
              .filter(Boolean),
          })
        }
      /> */}

      {/* Job Type */}
      {/* <ChipFilter
        title="Job Type"
        options={getLabels(jobTypeList)}
        selected={(filters.jobTypes || [])
          .map((v) => getLabelByValue(jobTypeList, v))
          .filter(Boolean)}
        onSelectionChange={(labels) =>
          onFilterChange({
            ...filters,
            jobTypes: labels
              .map((l) => getValueByLabel(jobTypeList, l))
              .filter(Boolean),
          })
        }
      /> */}

      {/* Experience Level (radio-like) */}
      <ChipFilter
        title="Experience Level"
        options={getLabels(experienceList)}
        selected={
          filters.experienceLevels
            ? [getLabelByValue(experienceList, filters.experienceLevels)]
            : []
        }
        onSelectionChange={(labels) =>
          onFilterChange({
            ...filters,
            experienceLevels:
              getValueByLabel(experienceList, labels[0]) || null,
          })
        }
      />

      {/* Salary Range */}
      <ChipFilter
        title="Salary Range"
        options={getLabels(salaryRangeList)}
        selected={(filters.salaryRange || [])
          .map((v) => getLabelByValue(salaryRangeList, v))
          .filter(Boolean)}
        onSelectionChange={(labels) =>
          onFilterChange({
            ...filters,
            salaryRange: labels
              .map((l) => getValueByLabel(salaryRangeList, l))
              .filter(Boolean),
          })
        }
      />

      {/* Date Posted (radio-like) */}
      <ChipFilter
        title="Date Posted"
        options={getLabels(datePostedList)}
        selected={
          filters.datePosted
            ? [getLabelByValue(datePostedList, filters.datePosted)]
            : []
        }
        onSelectionChange={(labels) =>
          onFilterChange({
            ...filters,
            datePosted: getValueByLabel(datePostedList, labels[0]) || null,
          })
        }
      />

      {/* Tags */}
      {/* <ChipFilter
        title="Tags"
        options={getLabels(tagsList)}
        selected={(filters.tags || [])
          .map((v) => getLabelByValue(tagsList, v))
          .filter(Boolean)}
        onSelectionChange={(labels) =>
          onFilterChange({
            ...filters,
            tags: labels
              .map((l) => getValueByLabel(tagsList, l))
              .filter(Boolean),
          })
        }
      /> */}
    </div>
  );
}
