"use client";

import * as React from "react";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";

// interface ModalProps {
//   headerText?: string;
//   placeholder?: string;
//   type?: string;
//   value: any;
//   onChange: any;
//   title?: string;
//   error?: string;
//   name?: string;
//   required?: boolean;
//   className?: string;
//   disabled?: boolean
// }

export default function TextArea(props) {
  const {
    placeholder,
    value,
    onChange,
    title,
    error,
    name,
    required,
    className,
    disabled,
    rows,
  } = props;
  return (
    <div className="w-full space-y-2">
      {title && (
        <label className="block text-sm font-bold text-gray-700">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Textarea
        rows={rows ?? 4}
        id="email"
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className={cn(
          "flex w-full rounded-md border  px-3 pr-10 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
          error
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-input focus-visible:ring-ring"
        )}
        disabled={disabled}
      />

      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
          {error} {/* Display the error message if it exists */}
        </p>
      )}
    </div>
  );
}
