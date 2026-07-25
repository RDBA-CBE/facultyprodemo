import { Skeleton } from "@/components/ui/skeleton";

export function PropertyCardSkeleton(props) {
  const { view = "grid", row } = props;
  if (view === "list") {
    return Array.from({ length: row ?? 2 }).map((_, i) => (
      <div className="flex gap-6 p-6 border rounded-lg bg-white" key={i}>
        <Skeleton className="h-48 w-64 rounded-lg" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </div>
    ));
  }

  return Array.from({ length: row ?? 2 }).map((_, i) => (
    <div className="border rounded-lg overflow-hidden bg-white" key={i}>
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  ));
}