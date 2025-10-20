'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { studentAuth } from '@/lib/student-auth'
import FloatingChat from '@/components/chat/FloatingChat'
import StudentLayout from '@/components/student/StudentLayout'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { SkeletonCard } from '@/components/ui/Skeleton'
import {
  BookOpen,
  Upload,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Target,
  Sparkles,
  Trophy,
  Flame,
  Star,
  Heart,
  Zap,
  Award,
  TrendingUp,
  Activity,
  Smile,
  Coffee,
  Rocket,
  Lightbulb
} from 'lucide-react'

// Types
interface Assignment {
  id: string
  title: string
  description: string
  subject: string
  dueDate: string
  status: string
  maxSubmissions: number
  submissionCount: number
  instructions: string[]
}

interface DashboardStats {
  student: {
    id: string
    studentId: string
    fullName: string
    class: string
    email: string
    createdAt: string
  } | null
  totalAssignments: number
  completedAssignments: number
  pendingAssignments: number
  overdueAssignments: number
  completionPercentage: number
  totalSubmissions: number
  totalFeedbacks: number
  codingLabSubmissions: number
  codingLabTasks: number
  recentSubmissions: number
  recentFeedbacks: number
  weeklyProgress: number
  learningStreak: number
  engagementScore: number
  totalStudents: number
  totalTutorialArticles: number
  roadmapStages: number
  isActiveThisWeek: boolean
  hasOverdueAssignments: boolean
  codingLabProgress: number
  weeklyGrowth: 'increasing' | 'stable'
  status: {
    assignments: 'needs_attention' | 'in_progress' | 'up_to_date'
    codingLab: 'needs_start' | 'in_progress' | 'complete'
    engagement: 'high' | 'medium' | 'low'
  }
}

interface Submission {
  id: string
  assignmentId: string
  fileName: string
  filePath: string
  submittedAt: string
  studentId: string
  studentName: string
  status: string
  isLate: boolean
  grade?: number
  feedback?: string
}

interface AssignmentWithSubmissions extends Assignment {
  submissions: Submission[]
}

// Roadmap Types
interface RoadmapChecklistItem {
  id: string;
  text?: string;
  label?: string;
  helpText?: string;
}

interface RoadmapMaterial {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'tutorial' | 'documentation';
}

interface RoadmapActivityGroup {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  items: RoadmapChecklistItem[];
  materials?: RoadmapMaterial[];
}

interface RoadmapStage {
  id: string;
  title: string;
  description?: string;
  goal?: string;
  icon?: string;
  color?: string;
  estimatedDuration?: string;
  skills?: string[];
  overview?: string[];
  activityGroups?: RoadmapActivityGroup[];
}

interface RoadmapProgressState {
  groups: Record<string, Record<string, boolean>>;
  reflection: string;
}

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<{
    id: string;
    studentId: string;
    fullName: string;
    class: string;
    email: string;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Dashboard Stats State
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  
  // Assignments State
  const [assignments, setAssignments] = useState<AssignmentWithSubmissions[]>([])
  const [assignmentsLoading, setAssignmentsLoading] = useState(true)
  
  // Roadmap State
  const [roadmapStages, setRoadmapStages] = useState<RoadmapStage[]>([])
  const [roadmapProgress, setRoadmapProgress] = useState<Record<string, RoadmapProgressState>>({})
  const [roadmapStudentId, setRoadmapStudentId] = useState<string>('')
  const [roadmapStudentName, setRoadmapStudentName] = useState<string>('')

  // Roadmap utility functions
  const createEmptyProgress = (stages: RoadmapStage[]): Record<string, RoadmapProgressState> => {
    const progress: Record<string, RoadmapProgressState> = {};
    
    if (!Array.isArray(stages)) {
      console.warn('createEmptyProgress: stages is not an array', stages);
      return progress;
    }
    
    stages.forEach((stage) => {
      const groups: Record<string, Record<string, boolean>> = {};
      stage.activityGroups?.forEach((group) => {
        groups[group.id] = group.items.reduce<Record<string, boolean>>((acc, item) => {
          acc[item.id] = false;
          return acc;
        }, {});
      });

      progress[stage.id] = {
        groups,
        reflection: ""
      };
    });
    return progress;
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async (studentId: string) => {
    try {
      setStatsLoading(true)
      console.log('Fetching dashboard stats for student:', studentId)

      const response = await fetch(`/api/student/dashboard?studentId=${studentId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`)
      }

      const result = await response.json()
      if (result.success && result.data) {
        setDashboardStats(result.data)
        console.log('Dashboard stats loaded:', result.data)
      } else {
        console.error('Failed to load dashboard stats:', result.error)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Fetch assignments
  const fetchAssignments = useCallback(async (studentId: string) => {
    try {
      setAssignmentsLoading(true)

      const response = await fetch('/api/classroom/assignments')
      const result = response.ok ? await response.json() : null
      const assignmentsPayload: Assignment[] = 
        result?.success && Array.isArray(result.data) ? result.data : []

      // For dashboard-simple, we don't need submissions since it's complex
      // Just show assignments status as "not submitted" by default
      const normalizedAssignments: AssignmentWithSubmissions[] = assignmentsPayload.map(
        (assignment: Assignment) => ({
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          subject: assignment.subject,
          dueDate: assignment.dueDate,
          status: assignment.status,
          maxSubmissions: assignment.maxSubmissions,
          submissionCount: assignment.submissionCount,
          instructions: assignment.instructions ?? [],
          submissions: [] // Keep empty for now - students can upload via assignment detail page
        })
      )

      setAssignments(normalizedAssignments)
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setAssignmentsLoading(false)
    }
  }, [])

  // Fetch roadmap stages
  const fetchRoadmapStages = useCallback(async () => {
    try {
      const response = await fetch('/api/roadmap/stages');
      if (response.ok) {
        const result = await response.json();
        const stagesArray = result.success && Array.isArray(result.data) ? result.data : [];
        console.log('Fetched roadmap stages:', stagesArray);
        
        setRoadmapStages(stagesArray);
        setRoadmapProgress(createEmptyProgress(stagesArray));
      } else {
        console.error('Failed to fetch roadmap stages:', response.status);
        setRoadmapStages([]);
      }
    } catch (error) {
      console.error('Error fetching roadmap stages:', error);
      setRoadmapStages([]);
    }
  }, []);

  // Check authentication and load student data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // First, check if student is authenticated
        const session = studentAuth.getSession()
        
        if (!session) {
          console.log('No student session found, redirecting to login')
          const currentUrl = window.location.pathname + window.location.search
          window.location.href = `/student/login?redirect=${encodeURIComponent(currentUrl)}`
          return
        }
        
        console.log('Student session found:', session)
        
        // Set student data from session
        const studentData = {
          id: session.id,
          studentId: session.studentId,
          fullName: session.fullName,
          class: session.class,
          email: session.email
        }
        setStudent(studentData)
        setRoadmapStudentId(studentData.studentId)
        setRoadmapStudentName(studentData.fullName)
        
        // Fetch dashboard stats, assignments and roadmap
        fetchDashboardStats(studentData.studentId)
        fetchAssignments(studentData.studentId)
        fetchRoadmapStages()
        setLoading(false)
        
      } catch (error) {
        console.error('Student auth error:', error)
        // Redirect to login on any error
        const currentUrl = window.location.pathname + window.location.search
        window.location.href = `/student/login?redirect=${encodeURIComponent(currentUrl)}`
      }
    }
    
    checkAuthAndLoadData()
  }, [fetchAssignments, fetchDashboardStats, fetchRoadmapStages])

  // Load progress from localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || roadmapStages.length === 0 || !roadmapStudentId) return;

    try {
      const stored = localStorage.getItem(`gema-roadmap-${roadmapStudentId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          progress: Record<string, RoadmapProgressState>;
        };
        
        const base = createEmptyProgress(roadmapStages);
        if (parsed.progress) {
          Object.entries(parsed.progress).forEach(([stageId, stageProgress]) => {
            const baseStage = base[stageId];
            if (!baseStage) return;

            const mergedGroups: Record<string, Record<string, boolean>> = { ...baseStage.groups };
            Object.entries(baseStage.groups).forEach(([groupId, items]) => {
              const savedGroup = stageProgress.groups?.[groupId];
              if (!savedGroup) return;

              mergedGroups[groupId] = Object.keys(items).reduce<Record<string, boolean>>((acc, itemId) => {
                acc[itemId] = savedGroup[itemId] ?? items[itemId];
                return acc;
              }, {});
            });

            base[stageId] = {
              groups: mergedGroups,
              reflection: stageProgress.reflection ?? ""
            };
          });
        }
        setRoadmapProgress(base);
      }
    } catch (error) {
      console.error('Failed to load roadmap progress', error);
    }
  }, [roadmapStudentId, roadmapStages]);

  // Save progress to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !roadmapStudentId || Object.keys(roadmapProgress).length === 0) return;

    const payload = {
      studentId: roadmapStudentId,
      studentName: roadmapStudentName,
      progress: roadmapProgress,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(`gema-roadmap-${roadmapStudentId}`, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to save roadmap progress', error);
    }
  }, [roadmapProgress, roadmapStudentId, roadmapStudentName])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Roadmap handlers
  const handleItemCheck = (stageId: string, groupId: string, itemId: string, checked: boolean) => {
    setRoadmapProgress(prev => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        groups: {
          ...prev[stageId]?.groups,
          [groupId]: {
            ...prev[stageId]?.groups?.[groupId],
            [itemId]: checked
          }
        }
      }
    }));
  };

  const getStageStats = (stageId: string) => {
    const stage = roadmapStages.find(s => s.id === stageId);
    if (!stage) return { completed: 0, total: 0, percentage: 0 };

    const progress = roadmapProgress[stageId];
    if (!progress) return { completed: 0, total: getTotalItems(stage), percentage: 0 };

    let completed = 0;
    let total = 0;

    stage.activityGroups?.forEach(group => {
      group.items.forEach(item => {
        total++;
        if (progress.groups?.[group.id]?.[item.id]) {
          completed++;
        }
      });
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const getTotalItems = (stage: RoadmapStage): number => {
    return stage.activityGroups?.reduce((acc, group) => acc + group.items.length, 0) ?? 0;
  };

  if (loading) {
    return (
      <StudentLayout loading={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat dashboard...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout loading={statsLoading || assignmentsLoading}>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <Breadcrumb items={[{ label: 'Dashboard' }]} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Selamat Datang, {student?.fullName}! 🎉</h2>
              <p className="text-blue-100 mb-4">
                Kelas {student?.class} • NIS {student?.studentId}
              </p>
              <p className="text-blue-100">
                Platform pembelajaran digital untuk mengembangkan kemampuan teknologi dengan nilai-nilai pesantren.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-white/80" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Joyful Statistics Cards */}
        <div className="mb-8">
          {(statsLoading || !dashboardStats) ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={`stats-skeleton-${index}`} className="min-h-[160px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 data-section is-ready">
            {/* Learning Streak */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute top-2 right-2">
                <Flame className="interactive-icon w-6 h-6 text-orange-200" />
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-bold mb-1">{dashboardStats.learningStreak}</div>
                <div className="text-sm text-orange-100">Hari Streak 🔥</div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
            </motion.div>

            {/* Completion Progress */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute top-2 right-2">
                <Trophy className="interactive-icon w-6 h-6 text-green-200" />
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-bold mb-1 status-badge" data-status={dashboardStats.completionPercentage === 100 ? 'completed' : undefined}>
                  {dashboardStats.completionPercentage}%
                </div>
                <div className="text-sm text-green-100">Selesai ✨</div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
            </motion.div>

            {/* Engagement Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute top-2 right-2">
                <Zap className="interactive-icon w-6 h-6 text-purple-200" />
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-bold mb-1">{dashboardStats.engagementScore}</div>
                <div className="text-sm text-purple-100">
                  {dashboardStats.status.engagement === 'high' ? 'Super Aktif! ⚡' :
                   dashboardStats.status.engagement === 'medium' ? 'Aktif 💪' : 'Ayo Semangat! 📚'}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
            </motion.div>

            {/* Weekly Activity */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className={`rounded-2xl p-6 text-white relative overflow-hidden ${
                dashboardStats.isActiveThisWeek
                  ? 'bg-gradient-to-br from-blue-400 to-cyan-500'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
              }`}
            >
              <div className="absolute top-2 right-2">
                <Activity className="interactive-icon w-6 h-6 text-blue-200" />
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-bold mb-1">{dashboardStats.weeklyProgress}</div>
                <div className="text-sm text-blue-100">
                  {dashboardStats.isActiveThisWeek ? 'Aktif Minggu Ini! 🚀' : 'Ayo Mulai! ☕'}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
            </motion.div>
            </div>
          )}
        </div>
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Assignments Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="interactive-card bg-white rounded-xl p-6 shadow-sm transition-all cursor-pointer border border-gray-100 hover:border-blue-200 group data-section is-ready"
            onClick={() => setActiveTab('assignments')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center transition-transform">
                <BookOpen className="interactive-icon w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Assignments</h3>
                <p className="text-sm text-gray-600">
                  {!statsLoading && dashboardStats ? 
                    `${dashboardStats.completedAssignments}/${dashboardStats.totalAssignments} selesai` : 
                    'Lihat tugas tersedia'
                  }
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Tutorial interaktif dengan feedback real-time untuk mengasah skill programming! 💻
            </p>
            {!statsLoading && dashboardStats && dashboardStats.hasOverdueAssignments && (
              <div className="status-badge mt-3 px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full inline-flex" data-state="error">
                ⚠️ Ada tugas yang terlambat
              </div>
            )}
          </motion.div>

          {/* Coding Lab Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="interactive-card bg-white rounded-xl p-6 shadow-sm transition-all cursor-pointer border border-gray-100 hover:border-green-200 group data-section is-ready"
            onClick={() => window.location.href = '/student/coding-lab'}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center transition-transform">
                <Target className="interactive-icon w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Coding Lab</h3>
                <p className="text-sm text-gray-600">
                  {!statsLoading && dashboardStats ? 
                    `${dashboardStats.codingLabProgress}% progress` : 
                    'Kelola proyek Anda'
                  }
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Showcase karya terbaik dan raih pengakuan dari guru dan teman! 🎨
            </p>
            {!statsLoading && dashboardStats && (
              <div className="mt-3">
                <div className="progress-track">
                  <div
                    className={`progress-fill bg-gradient-to-r from-green-400 to-green-600 ${dashboardStats.codingLabProgress === 100 ? 'progress-fill--complete' : ''}`}
                    style={{ width: `${dashboardStats.codingLabProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Learning Roadmap Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="interactive-card bg-white rounded-xl p-6 shadow-sm transition-all cursor-pointer border border-gray-100 hover:border-purple-200 group data-section is-ready"
            onClick={() => setActiveTab('roadmap')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center transition-transform">
                <Rocket className="interactive-icon w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Learning Path</h3>
                <p className="text-sm text-gray-600">Roadmap pembelajaran</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Ikuti jalur belajar terstruktur dari basic hingga advanced! 🗺️
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">
                {roadmapStages.length} tahap pembelajaran
              </span>
            </div>
          </motion.div>
        </div>

        {/* Joyful Progress Summary */}
        {!statsLoading && dashboardStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="interactive-card bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white mb-8 relative overflow-hidden data-section is-ready"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Lightbulb className="interactive-icon w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Progress Report</h3>
                  <p className="text-white/80">Perjalanan belajar kamu minggu ini! ✨</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{dashboardStats.totalSubmissions}</div>
                  <div className="text-sm text-white/80">Submission</div>
                  <div className="text-xs text-white/60">📝 Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{dashboardStats.totalFeedbacks}</div>
                  <div className="text-sm text-white/80">Feedback</div>
                  <div className="text-xs text-white/60">💬 Diberikan</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{dashboardStats.recentSubmissions}</div>
                  <div className="text-sm text-white/80">Minggu Ini</div>
                  <div className="text-xs text-white/60">🚀 Fresh!</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{dashboardStats.codingLabSubmissions}</div>
                    <div className="text-sm text-white/80">Coding Lab</div>
                    <div className="text-xs text-white/60">🎨 Karya</div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="interactive-icon w-5 h-5 text-pink-200" />
                  <span className="text-sm">
                    {dashboardStats.status.engagement === 'high' ? 'Kamu luar biasa aktif!' : 
                     dashboardStats.status.engagement === 'medium' ? 'Keep up the good work!' : 
                     'Ayo semangat belajar lagi!'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${
                      i < Math.floor(dashboardStats.engagementScore / 20) ? 'text-yellow-300' : 'text-white/30'
                    }`} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Motivational Status Cards */}
        {!statsLoading && dashboardStats && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Assignment Status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className={`rounded-xl p-6 text-center ${
                dashboardStats.status.assignments === 'up_to_date' 
                  ? 'bg-green-50 border border-green-200' :
                dashboardStats.status.assignments === 'in_progress'
                  ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-red-50 border border-red-200'
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-sm">
                {dashboardStats.status.assignments === 'up_to_date' ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : dashboardStats.status.assignments === 'in_progress' ? (
                  <Clock className="w-8 h-8 text-yellow-500" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-500" />
                )}
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {dashboardStats.status.assignments === 'up_to_date' ? 'Semua Up to Date! 🎉' :
                 dashboardStats.status.assignments === 'in_progress' ? 'Ada yang Pending ⏰' :
                 'Perlu Perhatian! ⚠️'}
              </h4>
              <p className="text-sm text-gray-600">
                {dashboardStats.overdueAssignments > 0 ? 
                  `${dashboardStats.overdueAssignments} tugas terlambat` :
                  dashboardStats.pendingAssignments > 0 ?
                  `${dashboardStats.pendingAssignments} tugas menunggu` :
                  'Semua tugas selesai tepat waktu!'
                }
              </p>
            </motion.div>

            {/* Coding Lab Status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className={`rounded-xl p-6 text-center ${
                dashboardStats.status.codingLab === 'complete' 
                  ? 'bg-green-50 border border-green-200' :
                dashboardStats.status.codingLab === 'in_progress'
                  ? 'bg-blue-50 border border-blue-200' :
                  'bg-purple-50 border border-purple-200'
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-sm">
                {dashboardStats.status.codingLab === 'complete' ? (
                  <Award className="w-8 h-8 text-green-500" />
                ) : dashboardStats.status.codingLab === 'in_progress' ? (
                  <Upload className="w-8 h-8 text-blue-500" />
                ) : (
                  <Sparkles className="w-8 h-8 text-purple-500" />
                )}
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {dashboardStats.status.codingLab === 'complete' ? 'Coding Lab Lengkap! 🏆' :
                 dashboardStats.status.codingLab === 'in_progress' ? 'Sedang Dikerjakan 💪' :
                 'Saatnya Mulai! ✨'}
              </h4>
              <p className="text-sm text-gray-600">
                {dashboardStats.codingLabSubmissions}/{dashboardStats.codingLabTasks} proyek selesai
              </p>
            </motion.div>

            {/* Learning Energy */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className={`rounded-xl p-6 text-center ${
                dashboardStats.status.engagement === 'high' 
                  ? 'bg-orange-50 border border-orange-200' :
                dashboardStats.status.engagement === 'medium'
                  ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-sm">
                {dashboardStats.status.engagement === 'high' ? (
                  <Flame className="w-8 h-8 text-orange-500" />
                ) : dashboardStats.status.engagement === 'medium' ? (
                  <TrendingUp className="w-8 h-8 text-yellow-500" />
                ) : (
                  <Coffee className="w-8 h-8 text-gray-500" />
                )}
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {dashboardStats.status.engagement === 'high' ? 'Super Energetic! 🔥' :
                 dashboardStats.status.engagement === 'medium' ? 'Good Momentum! 📈' :
                 'Time for Coffee! ☕'}
              </h4>
              <p className="text-sm text-gray-600">
                Engagement score: {dashboardStats.engagementScore}/100
              </p>
            </motion.div>
          </div>
        )}

        {/* Playful Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600 bg-white shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4" />
                  Dashboard
                </div>
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'assignments'
                    ? 'border-blue-500 text-blue-600 bg-white shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Assignments
                  {!statsLoading && dashboardStats && dashboardStats.hasOverdueAssignments && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'roadmap'
                    ? 'border-blue-500 text-blue-600 bg-white shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Roadmap
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Halo, {student?.fullName}! 👋
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Selamat datang di dashboard pembelajaran GEMA! Semua statistik dan progress belajar kamu ada di atas. 
                    Pilih tab lain untuk melihat assignments dan roadmap belajar.
                  </p>
                  
                  {!statsLoading && dashboardStats && (
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      {/* Quick Stats */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Learning Progress</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Completed</span>
                            <span className="font-semibold text-blue-600">
                              {dashboardStats.completedAssignments}/{dashboardStats.totalAssignments}
                            </span>
                          </div>
                          <div className="progress-track">
                            <div
                              className={`progress-fill bg-gradient-to-r from-blue-400 to-blue-600 ${dashboardStats.completionPercentage === 100 ? 'progress-fill--complete' : ''}`}
                              style={{ width: `${dashboardStats.completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Next Actions */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900">What&apos;s Next?</h4>
                        </div>
                        <div className="space-y-2">
                          {dashboardStats.pendingAssignments > 0 && (
                            <div className="text-sm text-gray-600">
                              📝 {dashboardStats.pendingAssignments} assignments menunggu
                            </div>
                          )}
                          {dashboardStats.codingLabTasks > dashboardStats.codingLabSubmissions && (
                            <div className="text-sm text-gray-600">
                              🎨 Coding Lab perlu diupdate
                            </div>
                          )}
                          {dashboardStats.pendingAssignments === 0 && dashboardStats.codingLabProgress === 100 && (
                            <div className="text-sm text-green-600 font-medium">
                              🎉 Semua up to date!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'assignments' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Learning Assignments</h3>
                    <p className="text-sm text-gray-600">Tutorial interaktif untuk mengasah skill programming 💻</p>
                  </div>
                </div>

                {/* Assignment Statistics */}
                {!statsLoading && dashboardStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                      <div className="text-2xl font-bold text-green-600 mb-1">{dashboardStats.completedAssignments}</div>
                      <div className="text-xs text-green-700">Selesai ✅</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">{dashboardStats.pendingAssignments}</div>
                      <div className="text-xs text-yellow-700">Pending ⏳</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                      <div className="text-2xl font-bold text-red-600 mb-1">{dashboardStats.overdueAssignments}</div>
                      <div className="text-xs text-red-700">Terlambat ⚠️</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{dashboardStats.completionPercentage}%</div>
                      <div className="text-xs text-blue-700">Progress 📈</div>
                    </div>
                  </div>
                )}

                {assignmentsLoading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="text-gray-600">Memuat assignments yang seru... ✨</p>
                  </div>
                ) : assignments && assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.map((assignment, index) => {
                      const dueDate = new Date(assignment.dueDate)
                      const now = new Date()
                      const isOverdue = dueDate < now
                      const isUpcoming = (dueDate.getTime() - now.getTime()) < (7 * 24 * 60 * 60 * 1000) // 7 days
                      
                      return (
                        <motion.div
                          key={assignment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          data-state={isOverdue ? 'error' : undefined}
                          className={`interactive-card border-2 rounded-2xl p-6 transition-all duration-300 group data-section is-ready ${
                            assignment.status === 'completed'
                              ? 'border-green-200 bg-green-50 hover:border-green-300' :
                            isOverdue
                              ? 'border-red-200 bg-red-50 hover:border-red-300' :
                            isUpcoming
                              ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300' :
                              'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                assignment.status === 'completed'
                                  ? 'bg-green-500 text-white' :
                                isOverdue
                                  ? 'bg-red-500 text-white' :
                                isUpcoming
                                  ? 'bg-yellow-500 text-white' :
                                  'bg-blue-500 text-white'
                              }`}>
                                {assignment.status === 'completed' ? (
                                  <CheckCircle className="interactive-icon w-6 h-6" />
                                ) : isOverdue ? (
                                  <AlertCircle className="interactive-icon w-6 h-6" />
                                ) : (
                                  <BookOpen className="interactive-icon w-6 h-6" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                  {assignment.title}
                                </h4>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                                    isOverdue ? 'bg-red-100 text-red-700' :
                                    isUpcoming ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    <Calendar className="w-3 h-3" />
                                    {isOverdue ? 'Terlambat!' : 
                                     isUpcoming ? 'Segera!' :
                                     formatDate(assignment.dueDate)}
                                  </span>
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <FileText className="w-3 h-3" />
                                    {assignment.subject}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`status-badge px-3 py-1 text-xs font-semibold rounded-full ${
                                assignment.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : assignment.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                                }`}
                                data-status={assignment.status === 'completed' ? 'completed' : undefined}
                              >
                                {assignment.status === 'completed' ? '🎉 Selesai!' :
                                 assignment.status === 'in_progress' ? '🚀 Berlangsung' : '⭐ Belum Mulai'}
                              </span>
                              <Link
                                href={`/student/assignments/${assignment.id}`}
                                className="interactive-button bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                              >
                                {assignment.status === 'completed' ? 'Lihat' : 'Mulai'}
                                <span className="transition-transform group-hover:translate-x-1">→</span>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Assignments</h3>
                    <p className="text-gray-600 mb-6">
                      Assignments yang seru akan segera tersedia! 🚀
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Sparkles className="w-4 h-4" />
                      <span>Stay tuned untuk update terbaru</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'roadmap' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Roadmap</h3>
                {roadmapStages && roadmapStages.length > 0 ? (
                  <div className="space-y-6">
                    {roadmapStages.map((stage, index) => (
                      <motion.div
                        key={stage.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-blue-500 text-white' :
                              index === 1 ? 'bg-green-500 text-white' :
                              index === 2 ? 'bg-yellow-500 text-white' :
                              'bg-gray-300 text-gray-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{stage.title}</h4>
                              <p className="text-sm text-gray-600">{stage.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {getStageStats(stage.id).completed}/{getTotalItems(stage)}
                            </div>
                            <div className="text-xs text-gray-500">Items</div>
                          </div>
                        </div>

                        {stage.activityGroups && stage.activityGroups.length > 0 && (
                          <div className="space-y-4">
                            {stage.activityGroups.map((group) => (
                              <div key={group.id} className="bg-gray-50 rounded-lg p-4">
                                <h5 className="font-medium text-gray-800 mb-3">{group.title}</h5>
                                <div className="space-y-2">
                                  {group.items.map((item) => {
                                    const isCompleted = roadmapProgress[stage.id]?.groups?.[group.id]?.[item.id] || false;
                                    return (
                                      <div key={item.id} className="flex items-center gap-3">
                                        <button
                                          onClick={() => handleItemCheck(stage.id, group.id, item.id, !isCompleted)}
                                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            isCompleted 
                                              ? 'bg-green-500 border-green-500 text-white' 
                                              : 'border-gray-300 hover:border-green-400'
                                          }`}
                                        >
                                          {isCompleted && <CheckCircle className="w-3 h-3" />}
                                        </button>
                                        <span className={`text-sm ${
                                          isCompleted ? 'text-gray-600 line-through' : 'text-gray-800'
                                        }`}>
                                          {item.text || item.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">Roadmap pembelajaran akan tersedia segera</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  )}
