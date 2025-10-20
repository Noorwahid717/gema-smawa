'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  animation?: boolean
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  animation = true
}: SkeletonProps) {
  const baseClasses = 'skeleton-block'

  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  }

  const animationClasses = animation ? 'skeleton-animate' : ''

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses} ${className}`}
      role="presentation"
      aria-hidden="true"
    />
  )
}

interface SkeletonCardProps {
  className?: string
  showAvatar?: boolean
  lines?: number
}

export function SkeletonCard({
  className = '',
  showAvatar = false,
  lines = 3
}: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`interactive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      {showAvatar && (
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton variant="circular" className="w-12 h-12" />
          <div className="space-y-2">
            <Skeleton variant="text" className="w-32" />
            <Skeleton variant="text" className="w-24" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Skeleton variant="text" className="w-3/4" />
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            className={index === lines - 1 ? 'w-1/2' : 'w-full'}
          />
        ))}
      </div>
    </motion.div>
  )
}

interface SkeletonGridProps {
  count?: number
  className?: string
}

export function SkeletonGrid({ count = 6, className = '' }: SkeletonGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}

interface SkeletonListProps {
  count?: number
  className?: string
}

export function SkeletonList({ count = 5, className = '' }: SkeletonListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="interactive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center space-x-4">
            <Skeleton variant="circular" className="w-10 h-10" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="w-1/3" />
              <Skeleton variant="text" className="w-1/4" />
            </div>
            <Skeleton variant="rectangular" className="w-20 h-8" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}