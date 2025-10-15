'use client'

import { useEffect, useRef, useState } from 'react'

interface PreviewFrameProps {
  documentString: string
  title?: string
}

export function PreviewFrame({ documentString, title }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    iframe.srcdoc = documentString

    return () => {
      iframe.srcdoc = '<!doctype html><html><body></body></html>'
    }
  }, [documentString])

  useEffect(() => {
    function onChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  async function toggleFullscreen() {
    try {
      const container = wrapperRef.current ?? iframeRef.current
      if (!container) return

      if (!document.fullscreenElement) {
        // Request fullscreen on the wrapper so sandboxed iframe doesn't need
        // additional allow attributes. Most browsers will fullscreen the container.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await container.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      // ignore errors (e.g., user gesture required)
      console.error('Failed to toggle fullscreen preview', err)
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-pressed={isFullscreen}
        aria-label={isFullscreen ? 'Keluar fullscreen pratinjau' : 'Tampilkan pratinjau fullscreen'}
        className="absolute z-20 right-3 top-3 inline-flex items-center gap-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 border border-gray-200 shadow-sm hover:bg-white"
      >
        {isFullscreen ? 'Keluar' : 'Fullscreen'}
      </button>

      <iframe
        ref={iframeRef}
        title={title ?? 'Pratinjau portfolio siswa'}
        sandbox="allow-scripts"
        className="w-full h-full rounded-lg border border-gray-200 bg-white"
        aria-live="polite"
      />
    </div>
  )
}
