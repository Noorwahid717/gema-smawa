"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ClassroomPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
        <h1 className="text-2xl font-bold">Classroom Diarsipkan</h1>
        <p className="text-slate-300">
          Fitur Classroom telah diarsipkan karena keterbatasan infrastruktur video streaming.
          Fitur ini memerlukan layanan video streaming khusus yang belum tersedia.
        </p>
        <p className="text-sm text-slate-400">
          Untuk informasi lebih lanjut, hubungi administrator sistem.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
