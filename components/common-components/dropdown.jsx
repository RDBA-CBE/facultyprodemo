"use client";

import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import React, { useRef, useCallback, useState, useMemo } from "react";

const CustomSelect = (props) => {
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
    loadMore,
    loading,
  } = props;

  const [search, setSearch] = useState("");

  const selectedOption = options?.find((option) => option.value === value);
  const loadMoreCalledRef = useRef(false);
  const contentRef = useRef(null);

  // ✅ Filter options locally
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options?.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleScroll = useCallback(
    (e) => {
      if (!loadMore || loading || loadMoreCalledRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 20;

      if (isNearBottom) {
        loadMoreCalledRef.current = true;
        loadMore(search); // ✅ pass search
        setTimeout(() => {
          loadMoreCalledRef.current = false;
        }, 800);
      }
    },
    [loadMore, loading, search]
  );

  const handleContentRef = useCallback(
    (node) => {
      contentRef.current = node;
      if (!node || !loadMore) return;

      const viewport = node.querySelector("[data-radix-select-viewport]");
      if (viewport) {
        viewport.addEventListener("scroll", handleScroll);
      }
    },
    [handleScroll, loadMore]
  );

  return (
    <div className="w-full">
      {title && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative ">
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

          <SelectContent
            ref={handleContentRef}
            className="max-h-[260px] overflow-y-auto w-[90%] overflow-x-auto md:w-auto mx-auto md:mx-0  bg-white"
          >
            {/* 🔍 SEARCH INPUT */}
            <div className="p-2 sticky top-0 bg-white z-10">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (loadMore) {
                    loadMore(e.target.value);
                  }
                }}
                onKeyDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 text-sm border rounded-md outline-none"
              />
            </div>

            {/* OPTIONS */}
            {filteredOptions?.length ? (
              filteredOptions.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <div className="py-2 text-center text-sm text-gray-400">
                No results found
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="py-2 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin inline-block" />
                Loading...
              </div>
            )}
          </SelectContent>
        </Select>

        {/* CLEAR BUTTON */}
        {selectedOption && !disabled && (
          <button
            onClick={() => onChange(null)}
            className="absolute right-[0px] top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default CustomSelect;