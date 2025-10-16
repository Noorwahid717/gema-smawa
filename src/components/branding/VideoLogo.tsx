"use client";

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface VideoLogoProps {
  src: string
  width?: number
  height?: number
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  className?: string
  fallbackImage?: string
}

export default function VideoLogo({
  src,
  width = 400,
  height = 300,
  autoplay = true,
  loop = true,
  muted = true,
  controls = false,
  className = "",
  fallbackImage = "/gema.svg"
}: VideoLogoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleError = () => {
      setHasError(true)
      setIsLoading(false)
    }

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('error', handleError)

    // Auto play if enabled
    if (autoplay && !hasError) {
      video.play().catch(() => {
        // Autoplay failed, probably due to browser policy
        setIsPlaying(false)
      })
    }

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('error', handleError)
    }
  }, [autoplay, hasError])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const restart = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = 0
    if (!isPlaying) {
      video.play()
    }
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-white rounded-lg ${className}`}>
        <Image
          src={fallbackImage}
          alt="GEMA Logo"
          width={width}
          height={height}
          className="max-w-full h-auto"
        />
      </div>
    )
  }

  return (
    <div className={`relative group bg-white rounded-lg overflow-hidden shadow-lg ${className}`}>
      {/* Loading Spinner */}
      {isLoading && (
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-white z-10`}
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        width={width}
        height={height}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline
        className="w-full h-auto"
        poster={fallbackImage}
      >
        <source src={src} type="video/mp4" />
        <source src={src.replace('.mp4', '.webm')} type="video/webm" />
        <p>Your browser does not support the video tag.</p>
      </video>

      {/* Custom Controls Overlay */}
      {!controls && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex gap-2">
            <button
              onClick={togglePlay}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full transition-all duration-200 hover:scale-110"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
            <button
              onClick={restart}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full transition-all duration-200 hover:scale-110"
              title="Restart"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-2 right-2">
        <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
    </div>
  )
}