"use client";
import { useState } from "react";
import AdminLayout from '@/components/admin/AdminLayout';
import { Sparkles, Plus, Edit, Trash2 } from 'lucide-react';

interface Prompt {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const dummyPrompts: Prompt[] = [
  { id: "1", title: "Refleksi Minggu 1", content: "Apa tantangan terbesar yang kamu hadapi minggu ini?", createdAt: "2025-10-01" },
  { id: "2", title: "Prompt Ide Proyek", content: "Tuliskan ide proyek web sederhana yang ingin kamu buat.", createdAt: "2025-10-10" },
];

export default function AdminPromptPage() {
  const [prompts, setPrompts] = useState<Prompt[]>(dummyPrompts);
  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });

  const openAdd = () => {
    setEditingPrompt(null);
    setForm({ title: "", content: "" });
    setShowModal(true);
  };
  const openEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setForm({ title: prompt.title, content: prompt.content });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingPrompt(null);
    setForm({ title: "", content: "" });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    if (editingPrompt) {
      setPrompts(prompts.map(p => p.id === editingPrompt.id ? { ...p, ...form } : p));
    } else {
      setPrompts([
        ...prompts,
        { id: Date.now().toString(), title: form.title, content: form.content, createdAt: new Date().toISOString().slice(0, 10) }
      ]);
    }
    closeModal();
  };
  const handleDelete = (id: string) => {
    if (window.confirm("Hapus prompt ini?")) {
      setPrompts(prompts.filter(p => p.id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4 flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Prompt Tutorial</h1>
                <p className="text-sm text-gray-600">Kelola prompt refleksi, instruksi, atau pertanyaan terbuka untuk tutorial.</p>
              </div>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Prompt Baru
            </button>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prompt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prompts.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">Belum ada prompt.</td></tr>
                ) : prompts.map(prompt => (
                  <tr key={prompt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{prompt.title}</td>
                    <td className="px-6 py-4 text-gray-700 max-w-lg truncate">{prompt.content}</td>
                    <td className="px-6 py-4 text-gray-500">{prompt.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(prompt)} className="text-blue-600 hover:text-blue-900 p-1" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(prompt.id)} className="text-red-600 hover:text-red-900 p-1 ml-2" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Add/Edit Prompt */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingPrompt ? 'Edit Prompt' : 'Prompt Baru'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input type="text" className="w-full px-3 py-2 border rounded" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                  <textarea className="w-full px-3 py-2 border rounded" rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editingPrompt ? 'Simpan' : 'Tambah'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
