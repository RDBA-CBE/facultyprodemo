import * as React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TimePicker(props) {
  const {
    placeholder = "Select Time",
    title,
    required,
    error,
    onChange,
    value,
  } = props;

  return (
    <div className="w-full">
      {title && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-3 text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarClock height={20} width={20} />
            {value ? format(value, "HH:mm") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 overflow-visible" align="start">
          <DatePicker
            selected={value}
            onChange={(date) => onChange(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa" // Changed to show only time
            className="w-full p-2 border rounded-md focus:outline-none"
            // Custom header to hide date navigation
            renderCustomHeader={({
              monthDate,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) => (
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-lg font-bold">
                  {format(monthDate, "h:mm aa")}
                </span>
              </div>
            )}
            // Hide the calendar and day navigation
            calendarClassName="hidden"
          />
        </PopoverContent>
      </Popover>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}