'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import LoadingSkeleton from './LoadingSkeleton'

interface PageWrapperProps {
  children: ReactNode
  loading?: boolean
  className?: string
  skeletonDelay?: number // Delay before showing skeleton (ms)
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: -20,
    scale: 0.98
  }
}

export default function PageWrapper({
  children,
  loading = false,
  className = '',
  skeletonDelay = 150
}: PageWrapperProps) {
  const pathname = usePathname()
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [canShowContent, setCanShowContent] = useState(!loading)

  // Handle skeleton display timing
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowSkeleton(true)
      }, skeletonDelay)

      return () => clearTimeout(timer)
    } else {
      setShowSkeleton(false)
      // Small delay before showing content to prevent flash
      const timer = setTimeout(() => {
        setCanShowContent(true)
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [loading, skeletonDelay])

  // Reset content visibility when pathname changes
  useEffect(() => {
    if (loading) {
      setCanShowContent(false)
    }
  }, [pathname, loading])

  return (
    <div className={`min-h-screen ${className}`}>
      <AnimatePresence mode="wait">
        {loading && showSkeleton ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LoadingSkeleton />
          </motion.div>
        ) : (
          canShowContent && (
            <motion.div
              key={pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              className="min-h-screen"
            >
              {children}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  )
}