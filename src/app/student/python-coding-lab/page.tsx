'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/student/StudentLayout';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { studentAuth } from '@/lib/student-auth';
import {
  Code2,
  Trophy,
  Target,
  Clock,
  Filter,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  points: number;
  studentStatus: {
    attempted: boolean;
    attempts: number;
    bestScore: number;
    completed: boolean;
    lastSubmittedAt: string | null;
  };
}

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  HARD: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const difficultyLabels = {
  EASY: 'Mudah',
  MEDIUM: 'Sedang',
  HARD: 'Sulit',
};

export default function PythonCodingLabPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    // Fetch tasks on mount and when filters change
    fetchTasks();
  }, [selectedDifficulty, selectedCategory]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get student session from custom auth
      const session = studentAuth.getSession();
      if (!session) {
        router.push('/student/login');
        return;
      }

      const params = new URLSearchParams();
      params.append('studentId', session.id); // Add studentId to query
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/python-coding-lab/tasks?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTasks(data.tasks);
      } else {
        console.error('Failed to fetch tasks:', data.error);
        setError(data.error || 'Gagal memuat data');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (slug: string) => {
    router.push(`/student/python-coding-lab/${slug}`);
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.studentStatus.completed).length,
    attempted: tasks.filter(t => t.studentStatus.attempted).length,
    totalPoints: tasks.reduce((sum, t) => sum + (t.studentStatus.bestScore || 0), 0),
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/student/dashboard' },
    { label: 'Python Coding Lab', href: '/student/python-coding-lab' },
  ];

  return (
    <StudentLayout loading={loading}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
            <Code2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Python Coding Lab
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tingkatkan skill programming dengan latihan Python
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">Gagal memuat data</p>
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchTasks}
              className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Soal</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Selesai</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Dicoba</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.attempted}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Poin</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPoints}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Tingkat</option>
              <option value="EASY">Mudah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HARD">Sulit</option>
            </select>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            <option value="general">Umum</option>
            <option value="algorithm">Algoritma</option>
            <option value="data-structure">Struktur Data</option>
            <option value="string">String</option>
            <option value="math">Matematika</option>
          </select>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg">
            <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Tidak ada soal yang tersedia
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task.slug)}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[task.difficulty]}`}>
                        {difficultyLabels[task.difficulty]}
                      </span>
                      {task.studentStatus.completed && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          ✓ Selesai
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {task.points} poin
                      </span>
                      <span className="capitalize">{task.category}</span>
                      {task.studentStatus.attempted && (
                        <span className="text-blue-600 dark:text-blue-400">
                          Skor terbaik: {task.studentStatus.bestScore}/{task.points}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
