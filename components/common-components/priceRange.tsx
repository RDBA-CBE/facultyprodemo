"use client";

import React, { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";

interface PriceRangeSliderProps {
  title: string;
  min: number;
  max: number;
  value?: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
}

const formatPrice = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  return `₹${value.toLocaleString()}`;
};

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  title,
  min,
  max,
  value,
  onChange,
  step,
}) => {
  const [range, setRange] = useState<[number, number]>(value || [min, max]);

  // Adjust internal state when props change
  useEffect(() => {
    setRange(value || [min, max]);
  }, [min, max, value]);

  return (
    <div className="w-full">
      <div className="mb-2 font-semibold text-gray-900">Salary Range</div>

      {/* top range values */}
      <div className="flex justify-between text-sm font-medium mb-2">
        <span>{formatPrice(range[0])}</span>
        <span>{formatPrice(range[1])}</span>
      </div>

      {/* dual handle slider */}
      <div className="px-1">
        <Slider
          min={min}
          max={max}
          step={step}
          value={range}
          onValueChange={(val: [number, number]) => {
            setRange(val);
            onChange(val);
          }}
          className="my-3"
        />
      </div>

      {/* bottom min/max labels with spacing adjustment */}
      <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}+</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
