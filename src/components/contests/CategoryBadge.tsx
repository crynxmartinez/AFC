import type { ContestCategory } from '@/types/contest'
import { CATEGORY_LABELS } from '@/constants/phases'

interface CategoryBadgeProps {
  category: ContestCategory
  size?: 'sm' | 'md' | 'lg'
}

export default function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  const colorClasses = {
    art: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    cosplay: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    photography: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    music: 'bg-green-500/20 text-green-400 border-green-500/30',
    video: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  }

  return (
    <span 
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${sizeClasses[size]}
        ${colorClasses[category]}
      `}
    >
      {CATEGORY_LABELS[category]}
    </span>
  )
}
