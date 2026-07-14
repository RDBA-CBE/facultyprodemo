"use client";

import { useMemo } from "react";
import moment from "moment-timezone";
import CustomSelect from "./dropdown";

export default function MomentTimezoneSelect(props) {
  const { title, required, value, onChange, placeholder, error } = props;

  // Precompute dropdown only once
  const dropdown = useMemo(() => {
    return moment.tz.names().map((tz) => {
      const offset = moment.tz(tz).format("Z"); // e.g. "-07:00"
      const label = `(GMT${offset}) ${tz.replace("_", " ")}`;
      return { label, value: tz };
    });
  }, []);

  return (
    <div className="w-full">
      {title && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <CustomSelect
        options={dropdown}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder ? placeholder : "Select Timezone"}
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
