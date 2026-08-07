import { Skeleton } from "@/components/ui/skeleton";
import { Camera } from "lucide-react";

export const PageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-8 px-6">
      <div className="relative">
        <Camera className="w-8 h-8 text-muted-foreground/40 animate-pulse" />
      </div>
      <div className="w-full max-w-4xl space-y-6">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-12 md:h-20 w-3/4 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
