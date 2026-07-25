"use client";

import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function DateTimeField({
  label = "",
  placeholder = "",
  value,
  onChange,
  fromDate,
  error,
  required = false,
  disabled=false
}) {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="block text-sm font-bold mb-2 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          value={value ? dayjs(value) : null}
          onChange={(newValue) => onChange(newValue?.toDate() || null)}
          minDateTime={fromDate ? dayjs(fromDate) : undefined}
          ampm={false}
          slotProps={{
            textField: {
              placeholder,
              size: "small",
              error: !!error,
              fullWidth: true,
            },
          }}
          disabled={disabled}
        />
      </LocalizationProvider>

      {/* Show error message below like a label */}
      {error && (
        <span className="text-red-500 text-sm font-medium mt-1">{error}</span>
      )}
    </div>
  );
}
