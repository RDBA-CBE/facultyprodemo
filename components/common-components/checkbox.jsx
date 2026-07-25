"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import razorPay from "../../public/assets/images/razorpay.png";
export function CheckboxDemo({
  label,
  value,
  selectedValues,
  onChange,
  isMulti,
  className,
}) {
  const handleCheckboxChange = (checked) => {
    let newSelectedValues;

    const selectedItem = { value, label };

    if (isMulti) {
      if (checked) {
        newSelectedValues = [...selectedValues, selectedItem];
      } else {
        newSelectedValues = selectedValues?.filter(
          (item) => item.value !== value
        );
      }
    } else {
      newSelectedValues = checked ? [selectedItem] : [];
    }

    onChange(newSelectedValues);
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={value}
        checked={selectedValues?.some((item) => item.value === value)}
        onCheckedChange={handleCheckboxChange}
      />
      {label ? (
        <label
          htmlFor={value}
          className={`${className}"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer`}
        >
          {label}
        </label>
      ) : (
        <Image
          src={razorPay} 
          alt="RazorPay logo"
          width={100} 
          height={100}
        />
      )}
    </div>
  );
}
