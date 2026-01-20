import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProtocolCardSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Avatar skeleton */}
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="space-y-2">
              {/* Protocol name skeleton */}
              <Skeleton className="h-5 w-24" />
              {/* Category badge skeleton */}
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          {/* Ethos score badge skeleton */}
          <Skeleton className="h-5 w-20 flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* Stock metric skeleton */}
          <div className="flex justify-between items-baseline border-b pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          {/* Flow metric skeleton */}
          <div className="flex justify-between items-baseline border-b pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-28" />
          </div>
          {/* Sparkline skeleton */}
          <Skeleton className="h-12 w-full mt-2" />
        </div>
      </CardContent>
    </Card>
  )
}
