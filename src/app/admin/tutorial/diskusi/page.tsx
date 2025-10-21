"use client";
import { useEffect, useState } from "react";
import AdminLayout from '@/components/admin/AdminLayout';
import { MessageSquare, Plus, Edit, Trash2 } from 'lucide-react';

interface Thread {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  content?: string;
  createdAt: string;
  replies: number;
}

type ApiThread = Omit<Thread, "replies"> & {
  replies?: Array<{ id: string }> | number;
};

export default function DiskusiPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingThread, setEditingThread] = useState<Thread | null>(null);
  const [form, setForm] = useState({ title: "", authorName: "", authorId: "", content: "" });
  const [loading, setLoading] = useState(false);

  // Fetch threads from API
  const fetchThreads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/discussion/threads");
      const data = (await res.json()) as ApiThread[];
      setThreads(
        (Array.isArray(data) ? data : []).map((t) => ({
          id: t.id,
          title: t.title,
          authorId: t.authorId,
          authorName: t.authorName,
          content: t.content,
          createdAt: t.createdAt,
          replies: Array.isArray(t.replies) ? t.replies.length : Number(t.replies) || 0,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const openAdd = () => {
    setEditingThread(null);
    setForm({ title: "", authorName: "Admin", authorId: "admin-1", content: "" });
    setShowModal(true);
  };
  const openEdit = (thread: Thread) => {
    setEditingThread(thread);
    setForm({ title: thread.title, authorName: thread.authorName, authorId: thread.authorId, content: thread.content || "" });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingThread(null);
    setForm({ title: "", authorName: "", authorId: "", content: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.authorName.trim() || !form.authorId.trim()) return;
    if (editingThread) {
      // Update thread
      await fetch(`/api/discussion/threads/${editingThread.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
    } else {
      // Create thread
      await fetch("/api/discussion/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, authorName: form.authorName, authorId: form.authorId, content: form.content }),
      });
    }
    closeModal();
    fetchThreads();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Hapus thread ini?")) {
      await fetch(`/api/discussion/threads/${id}`, { method: "DELETE" });
      fetchThreads();
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4 flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Diskusi Tutorial</h1>
                <p className="text-sm text-gray-600">Kelola thread diskusi, tanya jawab, dan forum tutorial.</p>
              </div>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Thread Baru
            </button>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul Thread</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penanya</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Balasan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Memuat data diskusi...</td></tr>
                ) : threads.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Belum ada thread diskusi.</td></tr>
                ) : threads.map(thread => (
                  <tr key={thread.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{thread.title}</td>
                    <td className="px-6 py-4 text-gray-700">{thread.authorName}</td>
                    <td className="px-6 py-4 text-center text-blue-700 font-bold">{thread.replies}</td>
                    <td className="px-6 py-4 text-gray-500">{thread.createdAt?.slice(0,10)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(thread)} className="text-blue-600 hover:text-blue-900 p-1" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(thread.id)} className="text-red-600 hover:text-red-900 p-1 ml-2" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Add/Edit Thread */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingThread ? 'Edit Thread' : 'Thread Baru'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Thread</label>
                  <input type="text" className="w-full px-3 py-2 border rounded" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penanya</label>
                  <input type="text" className="w-full px-3 py-2 border rounded" value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} required disabled={!!editingThread} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Isi Thread</label>
                  <textarea className="w-full px-3 py-2 border rounded" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={3} required />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editingThread ? 'Simpan' : 'Tambah'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
