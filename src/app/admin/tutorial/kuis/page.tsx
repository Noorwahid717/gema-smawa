"use client";
import { useState } from "react";
import AdminLayout from '@/components/admin/AdminLayout';
import { ClipboardList, Plus, Edit, Trash2 } from 'lucide-react';

interface Quiz {
  id: string;
  question: string;
  options: string[];
  answer: number;
  createdAt: string;
}

const dummyQuizzes: Quiz[] = [
  { id: "1", question: "Apa itu HTML?", options: ["Bahasa markup", "Bahasa pemrograman", "Framework", "Database"], answer: 0, createdAt: "2025-10-01" },
  { id: "2", question: "Tag untuk membuat link adalah?", options: ["<div>", "<a>", "<span>", "<link>"], answer: 1, createdAt: "2025-10-10" },
];

export default function AdminKuisPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(dummyQuizzes);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [form, setForm] = useState({ question: "", options: ["", "", "", ""], answer: 0 });

  const openAdd = () => {
    setEditingQuiz(null);
    setForm({ question: "", options: ["", "", "", ""], answer: 0 });
    setShowModal(true);
  };
  const openEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setForm({ question: quiz.question, options: [...quiz.options], answer: quiz.answer });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingQuiz(null);
    setForm({ question: "", options: ["", "", "", ""], answer: 0 });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || form.options.some(opt => !opt.trim())) return;
    if (editingQuiz) {
      setQuizzes(quizzes.map(q => q.id === editingQuiz.id ? { ...q, ...form } : q));
    } else {
      setQuizzes([
        ...quizzes,
        { id: Date.now().toString(), question: form.question, options: [...form.options], answer: form.answer, createdAt: new Date().toISOString().slice(0, 10) }
      ]);
    }
    closeModal();
  };
  const handleDelete = (id: string) => {
    if (window.confirm("Hapus kuis ini?")) {
      setQuizzes(quizzes.filter(q => q.id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4 flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Kuis Tutorial</h1>
                <p className="text-sm text-gray-600">Kelola soal pilihan ganda untuk tutorial.</p>
              </div>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Kuis Baru
            </button>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pertanyaan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opsi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jawaban</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quizzes.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Belum ada kuis.</td></tr>
                ) : quizzes.map(quiz => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{quiz.question}</td>
                    <td className="px-6 py-4 text-gray-700 max-w-lg">
                      <ol className="list-decimal pl-4 space-y-1">
                        {quiz.options.map((opt, i) => (
                          <li key={i} className={i === quiz.answer ? "font-bold text-blue-700" : ""}>{opt}</li>
                        ))}
                      </ol>
                    </td>
                    <td className="px-6 py-4 text-green-700 font-semibold">{quiz.options[quiz.answer]}</td>
                    <td className="px-6 py-4 text-gray-500">{quiz.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(quiz)} className="text-blue-600 hover:text-blue-900 p-1" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(quiz.id)} className="text-red-600 hover:text-red-900 p-1 ml-2" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Add/Edit Quiz */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingQuiz ? 'Edit Kuis' : 'Kuis Baru'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan</label>
                  <input type="text" className="w-full px-3 py-2 border rounded" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opsi Jawaban</label>
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <input type="text" className="flex-1 px-3 py-2 border rounded" value={opt} onChange={e => setForm(f => ({ ...f, options: f.options.map((o, idx) => idx === i ? e.target.value : o) }))} required />
                      <input type="radio" name="answer" checked={form.answer === i} onChange={() => setForm(f => ({ ...f, answer: i }))} />
                      <span className="text-xs text-gray-500">Benar</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editingQuiz ? 'Simpan' : 'Tambah'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
