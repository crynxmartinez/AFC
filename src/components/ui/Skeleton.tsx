type SkeletonProps = {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export default function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) {
  const baseClasses = 'skeleton rounded'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

// Pre-built skeleton patterns
export function ContestCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg overflow-hidden border border-border">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton height={24} width="70%" />
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="80%" />
        <div className="flex justify-between pt-2">
          <Skeleton height={14} width="30%" />
          <Skeleton height={14} width="25%" />
        </div>
      </div>
    </div>
  )
}

export function EntryCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg overflow-hidden border border-border">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton height={16} width="60%" />
        </div>
        <Skeleton height={14} width="40%" />
      </div>
    </div>
  )
}

export function UserCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg overflow-hidden border border-border p-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1 space-y-2">
          <Skeleton height={20} width="50%" />
          <Skeleton height={14} width="30%" />
        </div>
      </div>
    </div>
  )
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-t border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton height={16} width={i === 0 ? '80%' : '60%'} />
        </td>
      ))}
    </tr>
  )
}
