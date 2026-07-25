"use client";

import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

const CustomSelect = (props) => {
  const {
    options = [],
    value,
    onChange,
    placeholder = "Select an option",
    title,
    required,
    error,
    disabled,
    className,
    isMulti = false,

    // async
    loadOptions,
    hasMore,
    isLoading,
  } = props;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  // ✅ normalize selected values
  const selectedValues = isMulti
    ? Array.isArray(value)
      ? value
      : []
    : value
      ? [value]
      : [];

  const stringSelectedValues = selectedValues.map((v) => String(v));

  // 🔍 API call
  useEffect(() => {
    if (loadOptions) {
      loadOptions({ search, page });
    }
  }, [search, page]);

  // ✅ handle select
  const handleSelect = (val) => {
    const stringVal = String(val);

    if (!isMulti) {
      const selected = options?.find((o) => String(o.value) === stringVal);
      onChange(selected || null);
      setOpen(false);
      return;
    }

    let updated;

    if (stringSelectedValues.includes(stringVal)) {
      updated = selectedValues.filter((v) => String(v) !== stringVal);
    } else {
      // 🔥 ALWAYS push normalized value
      updated = [...selectedValues, stringVal];
    }

    onChange(updated);
  };

  // ✅ selected options (better than labels only)
  const selectedOptions = options?.filter((o) =>
    stringSelectedValues.includes(String(o.value)),
  );

  return (
    <div className="w-full">
      {title && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <Select
        open={open}
        onOpenChange={setOpen}
        value={!isMulti ? String(value || "") : undefined}
        onValueChange={isMulti ? undefined : handleSelect}
        disabled={disabled}
      >
        {/* 🔹 TRIGGER */}
        <SelectTrigger className={`shadow-none ${className || "border-none"}`}>
          {selectedOptions?.length > 0 ? (
            <div
              className="flex flex-wrap gap-1 pr-6"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="bg-gray-200 px-2 py-0.5 rounded text-xs flex items-center gap-1"
                >
                  {opt.label}
                  {!disabled && (
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleSelect(opt.value);
                      }}
                    />
                  )}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </SelectTrigger>

        {/* 🔹 DROPDOWN */}
        <SelectContent className="p-2">
          {/* 🔍 SEARCH */}
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full mb-2 px-2 py-1 border rounded text-sm"
          />

          {/* 🔹 OPTIONS */}
          <div className="max-h-48 overflow-auto">
            {options?.map((option) => {
              const isSelected = stringSelectedValues.includes(
                String(option.value),
              );

              return (
                <div
                  key={option.value}
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(String(option.value)); // 🔥 normalize
                  }}
                >
                  {isMulti && (
                    <input type="checkbox" checked={isSelected} readOnly />
                  )}
                  <span>{option.label}</span>
                </div>
              );
            })}
          </div>

          {/* ✅ APPLY BUTTON */}
          {isMulti && (
            <div className="mt-2 border-t pt-2">
              <button
                className="w-full bg-blue-600 text-white py-1.5 rounded text-sm"
                onClick={() => setOpen(false)}
              >
                Apply
              </button>
            </div>
          )}
        </SelectContent>
      </Select>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default CustomSelect;
