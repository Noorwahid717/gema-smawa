'use client';

import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/student/StudentLayout';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { Upload, Code, ChevronRight } from 'lucide-react';

export default function CodingLabPage() {
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/student/dashboard' },
    { label: 'Project Upload', href: '/student/coding-lab' },
  ];

  return (
    <StudentLayout>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl text-white">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Project Upload
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload dan submit project Anda untuk dinilai
            </p>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Upload Project Files
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            Sistem ini untuk upload project dalam bentuk ZIP file. Untuk latihan coding Python dengan auto-grading, 
            silakan gunakan Python Coding Lab.
          </p>
          <button
            onClick={() => router.push('/student/python-coding-lab')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Code className="w-4 h-4" />
            Go to Python Coding Lab
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Project Upload System
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Feature ini digunakan untuk submit project dalam bentuk file ZIP.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Akses labs melalui assignments atau learning path Anda.
          </p>
        </div>
      </div>
    </StudentLayout>
  );
}
