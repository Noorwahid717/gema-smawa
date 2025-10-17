'use client'

import AdminLayout from '@/components/admin/AdminLayout'

export default function TestPage() {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p className="mb-4">If you can see this interactive content, JavaScript is working.</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => alert('JavaScript is working!')}
        >
          Test Button
        </button>
      </div>
    </AdminLayout>
  )
}