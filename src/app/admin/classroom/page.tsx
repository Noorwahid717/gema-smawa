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
import type {
  ClassroomAssignmentResponse,
  ClassroomSubmissionResponse,
  ClassroomProjectChecklistItem
} from "@/types/classroom";

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
  const [assignments, setAssignments] = useState<ClassroomAssignmentResponse[]>([]);
  const [submissions, setSubmissions] = useState<ClassroomSubmissionResponse[]>([]);
  const [projects, setProjects] = useState<ClassroomProjectChecklistItem[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<ClassroomAssignmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'assignments' | 'projects'>('assignments');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ClassroomAssignmentResponse | null>(null);
  const [editingProject, setEditingProject] = useState<ClassroomProjectChecklistItem | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    maxSubmissions: 30,
    instructions: [""]
  });
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
    fetchAssignments();
    fetchSubmissions();
    fetchProjects();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/classroom/assignments');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssignments(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/classroom/submissions');
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const normalizedSubmissions: ClassroomSubmissionResponse[] = data.data.map(
            (submission: ClassroomSubmissionResponse) => ({
              id: submission.id,
              studentName: submission.studentName,
              studentId: submission.studentId,
              assignmentId: submission.assignmentId,
              fileName: submission.fileName,
              filePath: submission.filePath ?? submission.fileUrl,
              fileUrl: submission.fileUrl ?? submission.filePath,
              submittedAt: submission.submittedAt,
              status: submission.status ?? (submission.isLate ? 'late' : 'submitted'),
              isLate: submission.isLate ?? false,
              grade: submission.grade ?? null,
              feedback: submission.feedback ?? null
            })
          );
          setSubmissions(normalizedSubmissions);
        }
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/classroom/projects');
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const data = await response.json();
      const metaMessage =
        data?.meta && typeof data.meta.message === 'string'
          ? data.meta.message
          : null;

      if (data.success && Array.isArray(data.data)) {
        const normalized = (data.data as ClassroomProjectChecklistItem[]).sort((a, b) => {
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

  useEffect(() => {
    if (activeSection === 'assignments') {
      setShowProjectForm(false);
      setEditingProject(null);
      resetProjectForm();
    } else {
      setShowCreateForm(false);
      setEditingAssignment(null);
      setSelectedAssignment(null);
    }
  }, [activeSection, resetProjectForm]);

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
      ? `/api/classroom/projects/${editingProject.id}`
      : '/api/classroom/projects';

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

  const handleEditProject = (project: ClassroomProjectChecklistItem) => {
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
      const response = await fetch(`/api/classroom/projects/${projectId}`, {
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

  const renderAssignmentsSection = () => {
    if (showCreateForm) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingAssignment(null);
                  setNewAssignment({
                    title: "",
                    description: "",
                    subject: "",
                    dueDate: "",
                    maxSubmissions: 30,
                    instructions: [""]
                  });
                }}
                className="text-gray-600 hover:text-blue-600 transition-colors"
                title="Kembali"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                {editingAssignment ? 'Edit Assignment' : 'Buat Assignment Baru'}
              </h2>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Assignment *
                  </label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan judul assignment"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih subject</option>
                    <option value="Web Development">Web Development</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="Programming">Programming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi *</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Berikan deskripsi singkat assignment"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="datetime-local"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Submissions *</label>
                  <input
                    type="number"
                    min={1}
                    value={newAssignment.maxSubmissions}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, maxSubmissions: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Instructions</label>
                  <button
                    type="button"
                    onClick={addInstruction}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Tambah Instruction
                  </button>
                </div>
                <div className="space-y-3">
                  {newAssignment.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Instruction ${index + 1}`}
                      />
                      {newAssignment.instructions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInstruction(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingAssignment(null);
                    setNewAssignment({
                      title: "",
                      description: "",
                      subject: "",
                      dueDate: "",
                      maxSubmissions: 30,
                      instructions: [""]
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
                >
                  {editingAssignment ? 'Simpan Perubahan' : 'Buat Assignment'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      );
    }

    if (selectedAssignment) {
      const assignmentSubmissions = getSubmissionStats(selectedAssignment.id);
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedAssignment.title}</h2>
              <p className="text-gray-600">{selectedAssignment.subject}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Kembali
              </button>
              <button
                onClick={() => handleEditAssignment(selectedAssignment)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Assignment
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-2">Deskripsi</h3>
                <p className="text-gray-600 mb-4">{selectedAssignment.description}</p>

                {selectedAssignment.instructions && selectedAssignment.instructions.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800">Instructions</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {selectedAssignment.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-blue-50 rounded-lg p-6 space-y-3 text-sm">
                <h3 className="font-semibold text-gray-800 mb-3">Assignment Info</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Due: {new Date(selectedAssignment.dueDate).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{assignmentSubmissions.length}/{selectedAssignment.maxSubmissions} Submissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedAssignment.status)}`}>
                    {selectedAssignment.status === 'active' ? 'Aktif' :
                      selectedAssignment.status === 'closed' ? 'Ditutup' : 'Akan Datang'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Submissions</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignmentSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{submission.studentName}</div>
                          <div className="text-sm text-gray-500">{submission.studentId}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{submission.fileName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(submission.submittedAt).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          submission.status === 'submitted'
                            ? 'bg-green-100 text-green-800'
                            : submission.status === 'late'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {submission.status === 'submitted'
                            ? 'Submitted'
                            : submission.status === 'late'
                              ? 'Late'
                              : 'Reviewed'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDownloadSubmission(submission.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {assignmentSubmissions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada submission untuk assignment ini
                </div>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{assignments.length}</h3>
                <p className="text-gray-600">Total Assignments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{submissions.length}</h3>
                <p className="text-gray-600">Total Submissions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {assignments.filter(a => a.status === 'active').length}
                </h3>
                <p className="text-gray-600">Active Assignments</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">Daftar Assignments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => {
                  const assignmentSubmissions = getSubmissionStats(assignment.id);
                  return (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{assignment.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(assignment.dueDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignmentSubmissions.length}/{assignment.maxSubmissions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                          {assignment.status === 'active' ? 'Aktif' :
                            assignment.status === 'closed' ? 'Ditutup' : 'Akan Datang'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedAssignment(assignment)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View submissions"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditAssignment(assignment)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Edit assignment"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id, assignmentSubmissions.length > 0)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  const totalBasicTargets = projects.reduce((sum, project) => sum + project.basicTargets.length, 0);
  const totalAdvancedTargets = projects.reduce((sum, project) => sum + project.advancedTargets.length, 0);
  const activeProjectsCount = projects.filter((project) => project.isActive).length;

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingAssignment 
        ? `/api/classroom/assignments/${editingAssignment.id}`
        : '/api/classroom/assignments';
      
      const method = editingAssignment ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAssignment,
          instructions: newAssignment.instructions.filter(inst => inst.trim() !== "")
        })
      });

      if (response.ok) {
        await fetchAssignments();
        setShowCreateForm(false);
        setEditingAssignment(null);
        setNewAssignment({
          title: "",
          description: "",
          subject: "",
          dueDate: "",
          maxSubmissions: 30,
          instructions: [""]
        });
        alert(editingAssignment ? "Assignment berhasil diupdate!" : "Assignment berhasil dibuat!");
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert("Terjadi kesalahan saat menyimpan assignment!");
    }
  };

  const handleEditAssignment = (assignment: ClassroomAssignmentResponse) => {
    setEditingAssignment(assignment);
    setNewAssignment({
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      dueDate: assignment.dueDate.slice(0, 16), // Format for datetime-local input
      maxSubmissions: assignment.maxSubmissions,
      instructions: assignment.instructions && assignment.instructions.length > 0 
        ? assignment.instructions 
        : [""]
    });
    setShowCreateForm(true);
  };

  const handleDeleteAssignment = async (assignmentId: string, hasSubmissions: boolean) => {
    if (hasSubmissions) {
      alert("Tidak dapat menghapus assignment yang sudah memiliki submissions!");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus assignment ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/classroom/assignments/${assignmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAssignments();
        alert("Assignment berhasil dihapus!");
      } else {
        const result = await response.json();
        alert(result.error || "Terjadi kesalahan saat menghapus assignment!");
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert("Terjadi kesalahan saat menghapus assignment!");
    }
  };

  const handleDownloadSubmission = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/classroom/submissions/${submissionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.downloadUrl) {
          // Open Cloudinary URL in new tab
          window.open(data.data.downloadUrl, '_blank');
        } else {
          alert("File tidak ditemukan!");
        }
      } else {
        alert("Terjadi kesalahan saat mengunduh file!");
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert("Terjadi kesalahan saat mengunduh file!");
    }
  };

  const addInstruction = () => {
    setNewAssignment(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setNewAssignment(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  const removeInstruction = (index: number) => {
    setNewAssignment(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubmissionStats = (assignmentId: string) => {
    return submissions.filter(sub => sub.assignmentId === assignmentId);
  };

  if (loading && activeSection === 'assignments') {
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
              <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveSection('assignments')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeSection === 'assignments' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Tugas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('projects')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeSection === 'projects' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Checklist Proyek
                </button>
              </div>
              <Link
                href="/admin/classroom/articles"
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
        {activeSection === 'assignments' ? (
          renderAssignmentsSection()
        ) : showProjectForm ? (
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

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{activeProjectsCount}</h3>
                    <p className="text-gray-600">Checklist Aktif</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{totalBasicTargets + totalAdvancedTargets}</h3>
                    <p className="text-gray-600">Total Target Checklist</p>
                  </div>
                </div>
              </div>
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
  );
}

