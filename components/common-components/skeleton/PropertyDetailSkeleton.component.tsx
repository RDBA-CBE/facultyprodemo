// components/common-components/skeleton/PropertyDetailSkeleton.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PropertyDetailSkeleton = () => {
  return (
    <div className="mx-auto px-2 py-6">

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center flex-wrap gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-6 mt-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-3">
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-4 gap-2 h-[400px] rounded-2xl overflow-hidden">
            <div className="col-span-2">
              <Skeleton className="h-full w-full rounded-l-2xl" />
            </div>

            <div className="col-span-1 flex flex-col gap-2">
              <Skeleton className="flex-1 w-full" />
              <Skeleton className="flex-1 w-full" />
            </div>

            <div className="col-span-1 flex flex-col gap-2">
              <Skeleton className="flex-1 w-full rounded-tr-2xl" />
              <Skeleton className="flex-1 w-full rounded-br-2xl" />
            </div>
          </div>

          <div className="absolute bottom-4 left-4">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
          <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>

        <Card className="rounded-2xl shadow p-4">
          <Skeleton className="h-6 w-24 mb-6" />
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow p-6 space-y-6">
          <div>
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-20 mt-2" />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl shadow p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="space-y-6 relative overflow-x-hidden p-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <div className="relative">
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-10">
              <Skeleton className="w-10 h-10 rounded-full ml-4" />
              <Skeleton className="w-10 h-10 rounded-full mr-4" />
            </div>
            <div className="flex space-x-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-full max-w-lg">
                  <Card className="overflow-hidden rounded-xl border border-gray-200 shadow-sm w-full">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-5 space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex items-center">
                          <Skeleton className="h-4 w-4 mr-2" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-px w-full" />
                      <Skeleton className="h-7 w-28" />
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const PropertyGallerySkeleton = () => (
  <div className="relative">
    <Skeleton className="h-[300px] rounded-2xl" />
    <div className="absolute bottom-4 left-4">
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  </div>
);

export const PropertyOverviewSkeleton = () => (
  <Card className="rounded-2xl shadow p-4">
    <Skeleton className="h-6 w-24 mb-6" />
    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export const PropertyDescriptionSkeleton = () => (
  <Card className="rounded-2xl shadow p-6 space-y-6">
    <div>
      <Skeleton className="h-6 w-40 mb-3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-20 mt-2" />
      </div>
    </div>
  </Card>
);

export const PropertyFeaturesSkeleton = () => (
  <Card className="rounded-2xl shadow p-6">
    <Skeleton className="h-6 w-48 mb-6" />
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const SimilarPropertiesSkeleton = () => (
  <Card className="space-y-6 relative overflow-x-hidden p-6">
    <Skeleton className="h-6 w-40 mb-2" />
    <div className="relative">
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-10">
        <Skeleton className="w-10 h-10 rounded-full ml-4" />
        <Skeleton className="w-10 h-10 rounded-full mr-4" />
      </div>
      <div className="flex space-x-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex-shrink-0 w-full max-w-lg">
            <Card className="overflow-hidden rounded-xl border border-gray-200 shadow-sm w-full">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-7 w-28" />
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  </Card>
);
