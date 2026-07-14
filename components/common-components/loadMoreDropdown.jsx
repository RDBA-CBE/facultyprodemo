"use client";

import React, { useEffect, useState } from "react";
import { AsyncPaginate } from "react-select-async-paginate";

const LoadMoreDropdown = (props) => {
  const {
    value,
    onChange,
    loadOptions,
    placeholder = "Select an option",
    required,
    title,
    error,
    height,
    placeholderSize = "14px",
    disabled,
    reRender,
  } = props;

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (reRender) {
      setRefreshKey((prev) => prev + 1);

      loadOptions("", [], { page: 1 });
    }
  }, [reRender]);
  return (
    <div className="w-full">
      {title && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <AsyncPaginate
        key={refreshKey}
        value={value}
        loadOptions={loadOptions}
        onChange={onChange}
        additional={{ page: 1 }}
        placeholder={placeholder}
        isClearable
        isDisabled={disabled}
        debounceTimeout={300}
        styles={{
          control: (base) => ({
            ...base,
            borderColor: error ? "#dc2626" : base.borderColor,
            fontSize: "16px",
            color: "black",
            height: height ? height : "40px",
            borderRadius: "0.5rem",
          }),
          placeholder: (base) => ({
            ...base,
            color: "black",

            fontSize: placeholderSize ? placeholderSize : "16px",
          }),
          singleValue: (base) => ({
            ...base,
            color: "black",

            fontSize: "16px",
            borderRadius: "10px",
          }),
          input: (base) => ({
            ...base,
            fontSize: "14px",
            color: "#111827",
            borderRadius: "10px",
          }),
        }}
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default LoadMoreDropdown;
