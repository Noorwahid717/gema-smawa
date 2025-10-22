"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Users,
  FileText,
  Calendar,
  ArrowLeft,
  Eye,
  Download,
  ClipboardList,
  CheckCircle,
  Sparkles,
  Target
} from "lucide-react";
import type { TutorialProjectChecklistItem } from "@/types/tutorial";
import AdminLayout from '@/components/admin/AdminLayout'

interface ProjectFormState {
  title: string;
  goal: string;
  skills: string;
  basicTargets: string;
  advancedTargets: string;
  reflectionPrompt: string;
  order: number;
  isActive: boolean;
}

export default function AdminClassroomPage() {
  const [projects, setProjects] = useState<TutorialProjectChecklistItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<TutorialProjectChecklistItem | null>(null);

  const [projectForm, setProjectForm] = useState<ProjectFormState>({
    title: "",
    goal: "",
    skills: "",
    basicTargets: "",
    advancedTargets: "",
    reflectionPrompt: "",
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchProjects();
  }, []);


  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/tutorial/projects');
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const data = await response.json();
      const metaMessage =
        data?.meta && typeof data.meta.message === 'string'
          ? data.meta.message
          : null;

      if (data.success && Array.isArray(data.data)) {
  const normalized = (data.data as TutorialProjectChecklistItem[]).sort((a, b) => {
          if (a.order !== b.order) {
            return (a.order ?? 0) - (b.order ?? 0);
          }
          return a.title.localeCompare(b.title);
        });

        setProjects(normalized);
        setProjectError(metaMessage);
      } else {
        setProjects([]);
        setProjectError(metaMessage ?? 'Gagal memuat checklist proyek.');
      }
    } catch (error) {
      console.error('Error fetching classroom projects:', error);
      setProjectError('Terjadi kesalahan saat memuat checklist proyek.');
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  const parseListInput = (value: string) =>
    value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

  const resetProjectForm = useCallback(() => {
    setProjectForm({
      title: "",
      goal: "",
      skills: "",
      basicTargets: "",
      advancedTargets: "",
      reflectionPrompt: "",
      order: Math.max(1, projects.length + 1),
      isActive: true
    });
    setEditingProject(null);
  }, [projects.length]);



  const handleProjectFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: projectForm.title.trim(),
      goal: projectForm.goal.trim(),
      skills: parseListInput(projectForm.skills),
      basicTargets: parseListInput(projectForm.basicTargets),
      advancedTargets: parseListInput(projectForm.advancedTargets),
      reflectionPrompt: projectForm.reflectionPrompt.trim(),
      order: Number.isFinite(projectForm.order) ? projectForm.order : 0,
      isActive: projectForm.isActive
    };

    if (!payload.title || !payload.goal) {
      alert('Judul dan tujuan wajib diisi.');
      return;
    }

    if (payload.basicTargets.length === 0) {
      alert('Minimal satu target dasar diperlukan.');
      return;
    }

    const endpoint = editingProject
      ? `/api/tutorial/projects/${editingProject.id}`
      : '/api/tutorial/projects';

    const method = editingProject ? 'PATCH' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          reflectionPrompt: payload.reflectionPrompt || null
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setProjectsLoading(true);
        await fetchProjects();
        resetProjectForm();
        setShowProjectForm(false);
        alert(editingProject ? 'Checklist proyek berhasil diperbarui!' : 'Checklist proyek berhasil dibuat!');
      } else {
        alert(result.error || 'Terjadi kesalahan saat menyimpan checklist proyek.');
      }
    } catch (error) {
      console.error('Error saving project checklist:', error);
      alert('Terjadi kesalahan saat menyimpan checklist proyek.');
    }
  };

  const handleEditProject = (project: TutorialProjectChecklistItem) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      goal: project.goal,
      skills: project.skills.join('\n'),
      basicTargets: project.basicTargets.join('\n'),
      advancedTargets: project.advancedTargets.join('\n'),
      reflectionPrompt: project.reflectionPrompt ?? "",
      order: project.order,
      isActive: project.isActive
    });
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Hapus checklist proyek ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tutorial/projects/${projectId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setProjectsLoading(true);
        await fetchProjects();
        alert('Checklist proyek berhasil dihapus!');
      } else {
        alert(result.error || 'Terjadi kesalahan saat menghapus checklist.');
      }
    } catch (error) {
      console.error('Error deleting project checklist:', error);
      alert('Terjadi kesalahan saat menghapus checklist.');
    }
  };

  const handleCancelProjectForm = () => {
    setShowProjectForm(false);
    resetProjectForm();
  };






  if (projectsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Admin Panel
              </Link>
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Classroom Management</h1>
                  <p className="text-sm text-gray-600">Kelola tugas dan submisi siswa</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              {/* Checklist Proyek tab only, assignments removed */}
              <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1">
                <span className="px-3 py-1.5 rounded-md text-sm font-medium bg-white text-blue-600 shadow-sm">Checklist Proyek</span>
              </div>
              <Link
                href="/admin/tutorial/articles"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Kelola Artikel
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {showProjectForm ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={handleCancelProjectForm}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProject ? 'Edit Checklist Proyek' : 'Checklist Proyek Baru'}
              </h2>
            </div>

            <form onSubmit={handleProjectFormSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Proyek *
                  </label>
                  <input
                    type="text"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Proyek 1: Kartu Ucapan Interaktif"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={projectForm.order}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tujuan Proyek *
                </label>
                <textarea
                  value={projectForm.goal}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, goal: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jelaskan tujuan belajar utama dari proyek ini"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill yang Dilatih
                  </label>
                  <textarea
                    value={projectForm.skills}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, skills: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Pisahkan skill dengan enter atau koma"
                  />
                  <p className="mt-1 text-xs text-gray-500">Contoh: CSS Grid, Media Query, Manipulasi DOM</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Refleksi (opsional)
                  </label>
                  <textarea
                    value={projectForm.reflectionPrompt}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, reflectionPrompt: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Pertanyaan refleksi atau catatan untuk siswa"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Dasar (MVP) *
                  </label>
                  <textarea
                    value={projectForm.basicTargets}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, basicTargets: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Satu target per baris. Contoh:
- Siapkan struktur galeri
- Terapkan layout responsif"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Lanjutan
                  </label>
                  <textarea
                    value={projectForm.advancedTargets}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, advancedTargets: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Satu target per baris untuk tantangan lanjutan"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={projectForm.isActive}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Checklist aktif dan tampil untuk siswa
                </label>
                <span className="text-xs text-gray-500">Checklist yang diarsip tidak terlihat oleh siswa</span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelProjectForm}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {editingProject ? 'Simpan Perubahan' : 'Simpan Checklist'}
                </button>
              </div>
            </form>
          </motion.div>
        ) : projectsLoading ? (
          <div className="rounded-xl border border-blue-100 bg-white p-6 text-center text-sm text-blue-700">
            Memuat checklist proyek...
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Manajemen Checklist Proyek</h2>
                <p className="text-sm text-gray-600">
                  Tambahkan atau perbarui target belajar untuk setiap ide proyek web development ekskul informatika.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    resetProjectForm();
                    setShowProjectForm(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Checklist Baru
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{projects.length}</h3>
                    <p className="text-gray-600">Total Checklist</p>
                  </div>
                </div>
              </div>

              {/* Only show total projects card, remove undefined cards */}
            </div>

            {projectError && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {projectError}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">Daftar Checklist Proyek</h2>
                <p className="text-sm text-gray-600">
                  Kelola target dasar dan lanjutan untuk setiap ide proyek web development ekskul informatika.
                </p>
              </div>
              <div className="overflow-x-auto">
                {projects.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    Belum ada checklist proyek. Tambahkan checklist baru untuk memulai.
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urutan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyek</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Dasar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Lanjutan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{project.order}</td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{project.title}</div>
                            <div className="text-sm text-gray-500">{project.goal}</div>
                            {project.skills.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {project.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {project.basicTargets.length} target
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-purple-500" />
                              {project.advancedTargets.length} target
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                project.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {project.isActive ? 'Aktif' : 'Arsip'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditProject(project)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="Edit checklist"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Hapus checklist"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}

