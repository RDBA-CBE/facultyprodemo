"use client";

import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import React from "react";

const MultiSelect = (props) => {
  const {
    options,
    value,
    onChange,
    placeholder = "Select an option",
    title,
    required,
    error,
    disabled,
    className,
    isMulti = false,
  } = props;

  // 🔹 SINGLE SELECT
  if (!isMulti) {
    const selectedOption = options?.find(
      (option) => option.value === value
    );

    return (
      <div className="w-full">
        {title && (
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {title} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          <Select
            value={value ? String(value) : ""}
            onValueChange={(val) => {
              const selected = options?.find(
                (option) => String(option.value) === val
              );
              onChange(selected || null);
            }}
            disabled={disabled}
          >
            <SelectTrigger
              className={`shadow-none ${
                selectedOption ? "pr-10 [&>svg]:hidden" : ""
              } ${className || "border-none"}`}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={String(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedOption && !disabled && (
            <button
              onClick={() => onChange(null)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // 🔹 MULTI SELECT
  const selectedValues = Array.isArray(value) ? value : [];

  const toggleOption = (option) => {
    const exists = selectedValues.find(
      (item) => item.value === option.value
    );
  
    let updated;
  
    if (exists) {
      updated = selectedValues.filter(
        (item) => item.value !== option.value
      );
    } else {
      updated = [...selectedValues, option];
    }
  
    onChange(updated);
  };
  const selectedLabels = options
    ?.filter((opt) => selectedValues.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <div className="w-full">
      {title && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={`border rounded-md px-3 py-2 flex flex-wrap gap-2 ${
            disabled ? "bg-gray-100" : "bg-white"
          }`}
        >
          {selectedLabels?.length > 0 ? (
            selectedLabels.map((label, i) => (
              <span
                key={i}
                className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center gap-1"
              >
                {label}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() =>
                    toggleOption(
                      options.find((o) => o.label === label).value
                    )
                  }
                />
              </span>
            ))
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>

        {/* Dropdown */}
        <div className="border mt-1 rounded-md max-h-60 overflow-y-auto bg-white shadow">
          {options?.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => toggleOption(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default MultiSelect;