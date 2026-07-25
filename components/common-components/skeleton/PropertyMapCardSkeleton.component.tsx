import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyCardSkeletonProps {
  view?: "grid" | "list";
  row?:number
}

export const PropertyMapCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({
  view = "grid",
  row
}) => {
  if (view === "list") {
    return Array.from({ length: row ?? 2 }).map((_, i) => (
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white rounded-xl p-4 shadow-sm border animate-pulse w-full max-w-full" key={i}>
        <Skeleton className="w-full sm:w-48 md:w-60 h-40 sm:h-40 rounded-xl flex-shrink-0" />

        <div className="flex flex-col flex-grow justify-between w-full min-w-0">
          <div className="w-full">
            <Skeleton className="h-5 w-3/4 sm:w-2/3 mb-3" />
            <Skeleton className="h-5 w-1/2 sm:w-1/2 mb-4" />
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Skeleton className="h-4 w-16 sm:w-20" />
              <Skeleton className="h-4 w-16 sm:w-20" />
              <Skeleton className="h-4 w-16 sm:w-20" />
            </div>
          </div>
        </div>
      </div>
    ));
  }

  return Array.from({ length: row ?? 2 }).map((_, i) => (
    <div className="bg-white rounded-2xl shadow-sm border p-4 animate-pulse w-full sm:max-w-[300px] md:max-w-[400px] lg:max-w-[450px] mx-auto" key={i}>
      <Skeleton className="w-full h-[12rem] rounded-xl mb-4" />
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-5 w-1/2 mb-3" />
      <div className="flex flex-wrap justify-between mt-2 gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex flex-wrap gap-3 mt-5">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  ));
};
