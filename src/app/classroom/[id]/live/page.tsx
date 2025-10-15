'use client'

import { AlertCircle } from 'lucide-react'

export default function LiveClassroomPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
        <h1 className="text-2xl font-bold">Live Classroom Diarsipkan</h1>
        <p className="text-slate-300">
          Fitur Live Classroom telah diarsipkan karena keterbatasan infrastruktur video streaming.
          Fitur ini memerlukan layanan video streaming khusus yang belum tersedia.
        </p>
        <p className="text-sm text-slate-400">
          Untuk informasi lebih lanjut, hubungi administrator sistem.
        </p>
      </div>
    </div>
  )
}
