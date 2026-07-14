"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent as PopoverContentPrimitive,
  PopoverTrigger,
} from "@/components/ui/popover";
import "react-day-picker/dist/style.css";

const PopoverContent = PopoverContentPrimitive as any;

interface DatePickerProps {
  selectedDate?: Date | null | string;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  title?: string;
  required?: boolean;
  error?: string;
  closeIcon?: boolean;
  fromDate?: Date;
  toDate?: Date;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onChange,
  placeholder = "Pick a date",
  title,
  required,
  error,
  closeIcon,
  fromDate,
  toDate,
  disabled,
}) => {
  // ✅ Parse incoming date safely
  const parsedDate = React.useMemo(() => {
    if (!selectedDate) return undefined;
    if (selectedDate instanceof Date) return selectedDate;
    const d = new Date(selectedDate);
    return isNaN(d.getTime()) ? undefined : d;
  }, [selectedDate]);

  // ✅ Default: disable future dates if toDate not provided
  const effectiveToDate = React.useMemo(() => {
    return toDate ? new Date(toDate) : new Date();
  }, [toDate]);

  return (
    <div className="w-full relative">
      {title && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-between text-left font-normal pr-10",
                !parsedDate && "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <CalendarIcon height={20} width={20} />
                {parsedDate ? (
                  format(parsedDate, "PPP")
                ) : (
                  <span>{placeholder}</span>
                )}
              </div>
            </Button>

            {/* ✅ Clear icon */}
            {parsedDate && closeIcon && !disabled && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.(null);
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parsedDate}
            onSelect={(date) => onChange?.(date ?? null)}
            initialFocus
            captionLayout="dropdown"
            fromYear={1900}
            toYear={effectiveToDate.getFullYear()}
            disabled={(date) => {
              if (disabled) return true;

              const today = new Date();
              today.setHours(23, 59, 59, 999);

              // ✅ Disable future dates by default
              if (date > effectiveToDate) return true;

              if (fromDate) {
                const from = new Date(fromDate);
                from.setHours(0, 0, 0, 0);
                if (date < from) return true;
              }

              return false;
            }}
          />
        </PopoverContent>
      </Popover>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};