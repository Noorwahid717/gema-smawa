'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ImageIcon, AlertCircle } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  showFallback?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  onLoad,
  onError,
  fallbackSrc,
  showFallback = true
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(!priority)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px'
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  if (hasError && showFallback) {
    return (
      <div
        ref={imgRef}
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <div className="text-center text-gray-400 dark:text-gray-500">
          {fallbackSrc ? (
            <Image
              src={fallbackSrc}
              alt={alt}
              width={width || 100}
              height={height || 100}
              className="object-cover rounded-lg"
              onLoad={handleLoad}
              onError={() => setHasError(true)}
            />
          ) : (
            <>
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Failed to load image</p>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse ${className}`}
        style={{ width, height }}
        aria-label={`Loading image: ${alt}`}
      />
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        priority={priority}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${fill ? 'object-cover' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}