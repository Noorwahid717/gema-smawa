"use client";
import { ArrowLeft, Plus } from 'lucide-react';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import AdminLayout from '@/components/admin/AdminLayout'
import type {
  TutorialAssignmentResponse,
  TutorialSubmissionResponse
} from "@/types/tutorial";

export default function AdminAssessmentPage() {
  const [assignments, setAssignments] = useState<TutorialAssignmentResponse[]>([]);
  const [submissions, setSubmissions] = useState<TutorialSubmissionResponse[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<TutorialAssignmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TutorialAssignmentResponse | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    maxSubmissions: 30,
    instructions: [""]
  });

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/tutorial/assignments');
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
      const response = await fetch('/api/tutorial/submissions');
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setSubmissions(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAssignment
        ? `/api/tutorial/assignments/${editingAssignment.id}`
        : '/api/tutorial/assignments';
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

  const handleEditAssignment = (assignment: TutorialAssignmentResponse) => {
    setEditingAssignment(assignment);
    setNewAssignment({
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      dueDate: assignment.dueDate.slice(0, 16),
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
      const response = await fetch(`/api/tutorial/assignments/${assignmentId}`, {
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
      const response = await fetch(`/api/tutorial/submissions/${submissionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.downloadUrl) {
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

  if (loading) {
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
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Asesmen</h1>
                <p className="text-sm text-gray-600">Kelola tugas dan submisi siswa secara terpisah dari tutorial.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          {showCreateForm ? (
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
          ) : selectedAssignment ? (
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
                      <span>{getSubmissionStats(selectedAssignment.id).length}/{selectedAssignment.maxSubmissions} Submissions</span>
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
                      {getSubmissionStats(selectedAssignment.id).map((submission) => (
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
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {getSubmissionStats(selectedAssignment.id).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Belum ada submission untuk assignment ini
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
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
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(true);
                    setEditingAssignment(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Assignment Baru
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
