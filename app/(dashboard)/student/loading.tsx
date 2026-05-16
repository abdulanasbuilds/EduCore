import { Skeleton } from "@/components/ui/skeleton";

export default function StudentLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto pb-24">
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>

      <Skeleton className="h-[300px] w-full rounded-2xl mt-6" />
      <Skeleton className="h-32 w-full rounded-2xl mt-6" />
    </div>
  );
}
