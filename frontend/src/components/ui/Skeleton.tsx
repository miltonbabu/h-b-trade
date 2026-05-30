export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <Skeleton className="h-4 w-1/3 mb-4" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="relative">
        <Skeleton className="h-1 w-full" />
        <div className="flex justify-between mt-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-3 w-16 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
