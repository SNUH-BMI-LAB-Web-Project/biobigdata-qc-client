import { Skeleton } from '@/components/ui/skeleton'

export default function DataLoading() {
  return (
    <div className="container mx-auto px-4 py-4 space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}
