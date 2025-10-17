'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

interface CodingLabSubmission {
  id: string
  title: string
  status: string
  classLevel: string
  student?: {
    name: string
    email: string
  }
}

export default function SimpleCodingLabPage() {
  const [data, setData] = useState<CodingLabSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/coding-lab/submissions/admin')
      .then(res => res.json())
      .then(result => {
        setData(result.data || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Simple Coding Lab Admin</h1>
        <p className="mb-4">Found {data.length} submissions</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          onClick={() => alert('Button works!')}
        >
          Test Button
        </button>
        <div className="space-y-2">
          {data.slice(0, 5).map((item: CodingLabSubmission, index: number) => (
            <div key={item.id || index} className="border p-4 rounded">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-600">Status: {item.status}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}