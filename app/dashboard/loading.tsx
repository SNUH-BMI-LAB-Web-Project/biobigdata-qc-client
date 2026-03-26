import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-4 space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[0, 1].map(i => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
