'use client'

import { motion } from 'framer-motion'

interface LoadingSkeletonProps {
  className?: string
}

export default function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <motion.div
            className="h-8 bg-gray-200 rounded-lg w-64 mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="h-4 bg-gray-200 rounded w-96"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1
              }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section Skeleton */}
        <div className="mt-12">
          <motion.div
            className="h-6 bg-gray-200 rounded w-48 mb-6"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1.0 }}
            >
              <div className="h-48 bg-gray-100 rounded-lg" />
            </motion.div>
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }}
            >
              <div className="h-48 bg-gray-100 rounded-lg" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}