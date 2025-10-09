"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Upload,
  FileText,
  Calendar,
  User,
  ArrowLeft,
  Folder,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpenCheck,
  Newspaper,
  Tag,
  Eye,
  Search,
  ListChecks,
  ClipboardList,
  Target,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { LiveClassroom } from "@/features/livekit/LiveClassroom";
import { studentAuth, type StudentSession } from "@/lib/student-auth";
import type {
  ClassroomAssignmentResponse,
  ClassroomProjectChecklistItem
} from "@/types/classroom";
import {
  DEFAULT_PROJECTS,
  DEFAULT_REFLECTION_PROMPT
} from "@/data/classroom-roadmap";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string | string[]; // Can be JSON string from DB or parsed array
  author: string;
  featured: boolean;
  imageUrl?: string;
  readTime: number;
  views: number;
  publishedAt: string;
}

interface ProjectProgressState {
  basic: Record<string, boolean>;
  advanced: Record<string, boolean>;
  reflection: string;
}

const getTargetKey = (
  project: ClassroomProjectChecklistItem,
  type: 'basic' | 'advanced',
  index: number
) => `${project.id}-${type}-${index}`;

const createEmptyProgress = (
  projects: ClassroomProjectChecklistItem[]
): Record<string, ProjectProgressState> => {
  return projects.reduce<Record<string, ProjectProgressState>>((acc, project) => {
    const basic = project.basicTargets.reduce<Record<string, boolean>>((map, _item, index) => {
      map[getTargetKey(project, 'basic', index)] = false;
      return map;
    }, {});

    const advanced = project.advancedTargets.reduce<Record<string, boolean>>((map, _item, index) => {
      map[getTargetKey(project, 'advanced', index)] = false;
      return map;
    }, {});

    acc[project.id] = {
      basic,
      advanced,
      reflection: ''
    };

    return acc;
  }, {});
};

const mergeProgressWithProjects = (
  projects: ClassroomProjectChecklistItem[],
  saved?: Record<string, ProjectProgressState>
): Record<string, ProjectProgressState> => {
  const base = createEmptyProgress(projects);

  if (!saved) {
    return base;
  }

  projects.forEach((project) => {
    const baseProgress = base[project.id];
    const savedProgress = saved[project.id];
    if (!baseProgress || !savedProgress) return;

    Object.keys(baseProgress.basic).forEach((key) => {
      baseProgress.basic[key] = savedProgress.basic?.[key] ?? baseProgress.basic[key];
    });

    Object.keys(baseProgress.advanced).forEach((key) => {
      baseProgress.advanced[key] = savedProgress.advanced?.[key] ?? baseProgress.advanced[key];
    });

    baseProgress.reflection = savedProgress.reflection ?? '';
  });

  return base;
};

const STORAGE_PREFIX = "gema-classroom-project-roadmap";

const LIVE_TRANSPORT_MODE = (
  process.env.NEXT_PUBLIC_LIVE_TRANSPORT ?? process.env.LIVE_TRANSPORT ?? "ws"
).toLowerCase();

type LiveTransportMode = "ws" | "sse" | "livekit";

export default function ClassroomPage() {
  return (
    <Suspense fallback={<ClassroomPageSkeleton />}>
      <ClassroomPageContent />
    </Suspense>
  );
}

function ClassroomPageSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">Memuat halaman kelas...</p>
    </div>
  );
}

function ClassroomPageContent() {
  const [activeTab, setActiveTab] = useState<'assignments' | 'articles' | 'roadmap'>('assignments');
  const [assignments, setAssignments] = useState<ClassroomAssignmentResponse[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<ClassroomAssignmentResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roadmapStudentId, setRoadmapStudentId] = useState("");
  const [roadmapStudentName, setRoadmapStudentName] = useState("");

  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);

  useEffect(() => {
    const syncStudentSession = () => {
      const current = studentAuth.getSession();
      setStudentSession(current);
    };

    syncStudentSession();

    if (typeof window !== "undefined") {
      window.addEventListener("storage", syncStudentSession);
      return () => {
        window.removeEventListener("storage", syncStudentSession);
      };
    }

    return undefined;
  }, []);

  const liveTransport: LiveTransportMode =
    LIVE_TRANSPORT_MODE === "livekit"
      ? "livekit"
      : LIVE_TRANSPORT_MODE === "sse"
        ? "sse"
        : "ws";
  const [liveStatus, setLiveStatus] = useState<
    "idle" | "connecting" | "open" | "reconnecting" | "closed" | "error"
  >("idle");
  const [lastLiveMessage, setLastLiveMessage] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  const liveStatusColor =
    liveStatus === "open"
      ? "text-green-600"
      : liveStatus === "connecting"
        ? "text-yellow-600"
        : liveStatus === "reconnecting"
          ? "text-orange-500"
          : liveStatus === "error"
            ? "text-red-600"
            : "text-gray-600";

  let liveMessagePreview = lastLiveMessage;
  if (liveMessagePreview) {
    try {
      const parsed = JSON.parse(liveMessagePreview);
      liveMessagePreview = JSON.stringify(parsed);
    } catch {
      // ignore invalid json
    }
  }
  const liveMessageDisplay =
    liveMessagePreview.length > 120
      ? `${liveMessagePreview.slice(0, 117)}...`
      : liveMessagePreview;

  const isLivekitEnabled = liveTransport === "livekit";
  const sessionRole = session?.user?.role?.toUpperCase?.() ?? "";
  const sessionUserType = session?.user?.userType?.toUpperCase?.() ?? "";
  const adminRoleSet = new Set(["ADMIN", "SUPER_ADMIN", "GURU", "TEACHER", "PRESENTER"]);
  const isAdminUser = adminRoleSet.has(sessionRole);
  const isStudentUser =
    sessionUserType === "STUDENT" || sessionRole === "STUDENT" || Boolean(studentSession);

  const modeParam = searchParams?.get("mode")?.toLowerCase();
  const requestedLivekitMode =
    modeParam === "presenter" ? "presenter" : modeParam === "viewer" ? "viewer" : undefined;

  const livekitMode: "presenter" | "viewer" = requestedLivekitMode
    ? requestedLivekitMode === "presenter" && !isAdminUser
      ? "viewer"
      : requestedLivekitMode
    : isAdminUser
      ? "presenter"
      : "viewer";

  const livekitUserId =
    livekitMode === "presenter"
      ? session?.user?.id ?? session?.user?.email ?? undefined
      : studentSession?.id ?? session?.user?.id ?? session?.user?.email ?? undefined;

  const livekitUserName =
    livekitMode === "presenter"
      ? session?.user?.name ?? session?.user?.email ?? "Guru"
      : studentSession?.fullName ?? session?.user?.name ?? session?.user?.email ?? "Siswa";

  const livekitRoomHint = searchParams?.get("room") ?? searchParams?.get("eventId") ?? undefined;
  const canJoinLivekit = isAdminUser || isStudentUser;

  const [projects, setProjects] = useState<ClassroomProjectChecklistItem[]>(DEFAULT_PROJECTS);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectLoadError, setProjectLoadError] = useState<string | null>(null);
  const [roadmapProgress, setRoadmapProgress] = useState<Record<string, ProjectProgressState>>(() =>
    createEmptyProgress(DEFAULT_PROJECTS)
  );
  
  // Enhanced features state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedArticleForFeedback, setSelectedArticleForFeedback] = useState<Article | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchArticles();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (liveTransport === "livekit") {
      setLiveStatus("idle");
      setLastLiveMessage("");
      return;
    }

    let stopped = false;

    function clearReconnectTimer() {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

    const closeWebSocket = () => {
      const socket = wsRef.current;
      if (socket) {
        try {
          socket.close();
        } catch {}
        wsRef.current = null;
      }
    };

    const closeEventSource = () => {
      const source = eventSourceRef.current;
      if (source) {
        source.close();
        eventSourceRef.current = null;
      }
    };

    if (liveTransport === "sse") {
      setLiveStatus("connecting");

      try {
        const source = new EventSource("/api/live-classroom/stream");
        eventSourceRef.current = source;

        source.onopen = () => {
          if (stopped) return;
          setLiveStatus("open");
        };

        source.onmessage = (event) => {
          if (stopped) return;
          const data = event.data ?? "";
          setLastLiveMessage(data);
        };

        source.onerror = () => {
          if (stopped) return;
          if (source.readyState === EventSource.CLOSED) {
            setLiveStatus("closed");
          } else {
            setLiveStatus("reconnecting");
          }
        };
      } catch (error) {
        console.error("[classroom] SSE connection error", error);
        setLiveStatus("error");
      }

      return () => {
        stopped = true;
        clearReconnectTimer();
        closeEventSource();
        closeWebSocket();
      };
    }

    let attempt = 0;

    function scheduleReconnect() {
      if (stopped) return;
      clearReconnectTimer();
      setLiveStatus("reconnecting");
      const delay = Math.min(5000, 1500 + attempt * 1000);
      reconnectTimerRef.current = window.setTimeout(() => {
        if (stopped) return;
        attempt += 1;
        connect();
      }, delay);
    }

    function connect() {
      if (stopped) return;
      const isReconnect = attempt > 0;
      setLiveStatus(isReconnect ? "reconnecting" : "connecting");

      try {
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        const ws = new WebSocket(`${protocol}://${window.location.host}/api/ws`);
        wsRef.current = ws;

        ws.addEventListener("open", () => {
          if (stopped) return;
          attempt = 0;
          setLiveStatus("open");
          try {
            ws.send(
              JSON.stringify({
                type: "join",
                t: Date.now()
              })
            );
          } catch {}
        });

        ws.addEventListener("message", (event) => {
          if (stopped) return;
          const { data } = event;

          if (typeof data === "string") {
            setLastLiveMessage(data);
            try {
              const parsed = JSON.parse(data);
              if (parsed?.type === "ping") {
                try {
                  ws.send(
                    JSON.stringify({
                      type: "pong",
                      t: Date.now()
                    })
                  );
                } catch {}
              }
            } catch {}
          } else if (data instanceof Blob) {
            data
              .text()
              .then((text) => {
                if (stopped) return;
                setLastLiveMessage(text);
              })
              .catch(() => {});
          }
        });

        ws.addEventListener("error", () => {
          if (stopped) return;
          setLiveStatus("error");
        });

        ws.addEventListener("close", () => {
          if (stopped) return;
          setLiveStatus("closed");
          scheduleReconnect();
        });
      } catch (error) {
        console.error("[classroom] WebSocket initialization error", error);
        scheduleReconnect();
      }
    }

    connect();

    return () => {
      stopped = true;
      clearReconnectTimer();
      closeWebSocket();
      closeEventSource();
    };
  }, [liveTransport]);

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

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/classroom/articles?status=published');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setArticles(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
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
        const fetchedProjects = (data.data as ClassroomProjectChecklistItem[]).filter(
          (project) => project.isActive !== false
        );

        if (fetchedProjects.length > 0) {
          fetchedProjects.sort((a, b) => {
            if (a.order !== b.order) {
              return (a.order ?? 0) - (b.order ?? 0);
            }
            return a.title.localeCompare(b.title);
          });

          setProjects(fetchedProjects);
          setProjectLoadError(metaMessage);
        } else {
          setProjects(DEFAULT_PROJECTS);
          setProjectLoadError(
            metaMessage ?? 'Belum ada checklist proyek aktif, menampilkan versi default.'
          );
        }
      } else {
        setProjects(DEFAULT_PROJECTS);
        setProjectLoadError(
          metaMessage ?? 'Gagal memuat checklist proyek dari server.'
        );
      }
    } catch (error) {
      console.error('Error fetching classroom projects:', error);
      setProjects(DEFAULT_PROJECTS);
      setProjectLoadError('Tidak dapat memuat checklist proyek terbaru. Menampilkan versi default.');
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const activeProjects = projects;
    const baseProgress = createEmptyProgress(activeProjects);

    if (!roadmapStudentId) {
      setRoadmapProgress(baseProgress);
      setRoadmapStudentName("");
      return;
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}-${roadmapStudentId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          studentName?: string;
          progress?: Record<string, ProjectProgressState>;
        };
        setRoadmapProgress(mergeProgressWithProjects(activeProjects, parsed.progress));
        setRoadmapStudentName(parsed.studentName ?? "");
      } else {
        setRoadmapProgress(baseProgress);
      }
    } catch (error) {
      console.error('Failed to load roadmap progress', error);
      setRoadmapProgress(baseProgress);
    }
  }, [roadmapStudentId, projects]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!roadmapStudentId) return;

    const payload = {
      studentId: roadmapStudentId,
      studentName: roadmapStudentName,
      progress: roadmapProgress,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(`${STORAGE_PREFIX}-${roadmapStudentId}`, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to store roadmap progress', error);
    }
  }, [roadmapProgress, roadmapStudentId, roadmapStudentName]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File terlalu besar! Maksimal 10MB");
        return;
      }
      setUploadFile(file);
    }
  };

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !uploadFile || !studentName || !studentId) {
      alert("Semua field harus diisi!");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('studentName', studentName);
      formData.append('studentId', studentId);
      formData.append('assignmentId', selectedAssignment.id);
      if (studentEmail) {
        formData.append('studentEmail', studentEmail);
      }

      const response = await fetch('/api/classroom/submissions', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Reset form
        setUploadFile(null);
        setStudentName("");
        setStudentId("");
        setStudentEmail("");
        setSelectedAssignment(null);
        
        alert(`Tugas berhasil dikumpulkan! ${result.submission.isLate ? '(Terlambat)' : ''}`);
      } else {
        alert(result.error || "Terjadi kesalahan saat mengupload file!");
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert("Terjadi kesalahan saat mengupload file!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'tutorial': return 'bg-blue-100 text-blue-800';
      case 'news': return 'bg-green-100 text-green-800';
      case 'technology': return 'bg-purple-100 text-purple-800';
      case 'programming': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...Array.from(new Set(articles.map(article => article.category)))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced feedback functions
  const handleFeedbackSubmit = async () => {
    if (!selectedArticleForFeedback || feedbackRating === 0) return;
    
    setIsSubmittingFeedback(true);
    try {
      // Send feedback to API
      const response = await fetch('/api/classroom/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId: selectedArticleForFeedback.id,
          rating: feedbackRating,
          comment: feedbackComment,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        // Reset feedback form
        setFeedbackRating(0);
        setFeedbackComment('');
        setShowFeedbackModal(false);
        setSelectedArticleForFeedback(null);
        
        // Show success message (you can implement toast notification)
        alert('Terima kasih atas feedback-nya! 🙏');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Gagal mengirim feedback. Silakan coba lagi.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const openFeedbackModal = (article: Article) => {
    setSelectedArticleForFeedback(article);
    setShowFeedbackModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <AlertCircle className="w-4 h-4" />;
      case 'upcoming': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const toggleProjectTarget = (projectId: string, type: 'basic' | 'advanced', key: string) => {
    setRoadmapProgress((prev) => {
      const project = prev[projectId];
      if (!project) return prev;

      const group = project[type];
      if (!group || !(key in group)) return prev;

      return {
        ...prev,
        [projectId]: {
          ...project,
          [type]: {
            ...group,
            [key]: !group[key]
          }
        }
      };
    });
  };

  const handleReflectionChange = (projectId: string, reflection: string) => {
    setRoadmapProgress((prev) => {
      const project = prev[projectId];
      if (!project) return prev;
      return {
        ...prev,
        [projectId]: {
          ...project,
          reflection
        }
      };
    });
  };

  const handleResetProgress = () => {
    if (!roadmapStudentId) {
      alert('Masukkan ID siswa terlebih dahulu untuk mereset progress.');
      return;
    }

    const confirmation = window.confirm('Yakin ingin mereset seluruh progress checklist siswa ini?');
    if (!confirmation) return;

    const emptyProgress = createEmptyProgress(projects);
    setRoadmapProgress(emptyProgress);
    setRoadmapStudentName("");
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${STORAGE_PREFIX}-${roadmapStudentId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classroom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali
              </Link>
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">GEMA Classroom</h1>
                  <p className="text-sm text-gray-600">Platform pembelajaran digital</p>
                </div>
              </div>
            </div>
            <Link
              href="/student/profile"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('assignments')}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'assignments'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BookOpenCheck className="w-4 h-4" />
                Tugas & Pengumpulan
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'articles'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Newspaper className="w-4 h-4" />
                Artikel & Tutorial
              </button>
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'roadmap'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <ListChecks className="w-4 h-4" />
                Roadmap Proyek
              </button>
            </div>
            {isLivekitEnabled ? (
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Live transport: LiveKit
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Mode: {livekitMode === 'presenter' ? 'Guru / Presenter' : 'Siswa / Viewer'}
                </span>
              </div>
            ) : (
              <Link
                href="/classroom/gema-classroom-1/live"
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg transform hover:scale-105 font-medium"
              >
                <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" />
                </svg>
                🎥 Tonton Live Class
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white text-red-600">
                  LIVE
                </span>
              </Link>
            )}
          </div>
          {isLivekitEnabled ? (
            <div className="mt-6">
              {canJoinLivekit ? (
                <LiveClassroom
                  mode={livekitMode}
                  userId={livekitUserId}
                  userName={livekitUserName}
                  roomHint={livekitRoomHint}
                />
              ) : (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-blue-900">
                  <p className="text-base font-semibold">Masuk untuk mengakses Live Class</p>
                  <p className="mt-2 text-sm text-blue-800">
                    Live streaming hanya tersedia untuk guru dan siswa terdaftar. Silakan login terlebih dahulu.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/admin/login"
                      className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      Login Admin
                    </Link>
                    <Link
                      href="/student/login"
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                    >
                      Login Siswa
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold uppercase tracking-wide">Live transport</span>
                <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold uppercase text-blue-600">
                  {liveTransport}
                </span>
                <span className="font-semibold">Status:</span>
                <span className={`font-semibold capitalize ${liveStatusColor}`}>{liveStatus}</span>
              </div>
              {liveMessageDisplay && (
                <div className="mt-2 space-y-1 text-blue-800">
                  <div className="text-xs uppercase tracking-wide text-blue-700">Last message</div>
                  <code className="block w-full overflow-hidden text-ellipsis whitespace-nowrap rounded bg-white/80 px-2 py-1 text-xs">
                    {liveMessageDisplay}
                  </code>
                </div>
              )}
              {liveTransport === 'sse' && (
                <p className="mt-2 text-xs text-blue-700">
                  Mode SSE aktif untuk fallback satu arah.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {activeTab === 'assignments' && !selectedAssignment && (
          /* Assignment List */
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Daftar Tugas</h2>
              <p className="text-gray-600">Pilih tugas yang ingin dikumpulkan</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Folder className="w-8 h-8 text-blue-600" />
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {getStatusIcon(assignment.status)}
                      {assignment.status === 'active' ? 'Aktif' :
                       assignment.status === 'closed' ? 'Ditutup' : 'Akan Datang'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-2">{assignment.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{assignment.description}</p>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{assignment.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {new Date(assignment.dueDate).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{assignment.submissionCount}/{assignment.maxSubmissions} Submisi</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" />
                      Kumpulkan Tugas
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          /* Articles List */
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Artikel & Tutorial</h2>
              <p className="text-gray-600">Pelajari teknologi terkini dan tutorial programming</p>
            </motion.div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex gap-3 overflow-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 min-w-[240px]">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari artikel..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Article Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={article.imageUrl || '/images/default-article.jpg'}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getCategoryColor(article.category)}`}>
                        <Tag className="w-3 h-3" />
                        {article.category}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{article.views}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{article.author}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    {/* Tags */}
                    {(() => {
                      try {
                        const tags = typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags;
                        if (!Array.isArray(tags) || tags.length === 0) return null;

                        return (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex flex-wrap gap-1">
                              {tags.slice(0, 3).map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                </span>
                              ))}
                              {tags.length > 3 && (
                                <span className="text-xs text-gray-500">+{tags.length - 3} lagi</span>
                              )}
                            </div>
                          </div>
                        );
                      } catch {
                        return null;
                      }
                    })()}

                    {/* Enhanced Action Buttons */}
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {/* Primary Read Button */}
                      <Link
                        href={`/classroom/articles/${article.slug}`}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-md"
                      >
                        <BookOpen className="w-4 h-4" />
                        Baca Tutorial
                        <Sparkles className="w-4 h-4" />
                      </Link>
                      
                      {/* Integration Links */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Find related project
                            const relatedProject = DEFAULT_PROJECTS.find(project => 
                              project.title.toLowerCase().includes(article.title.toLowerCase().split(' ')[1]) ||
                              (typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags).some((tag: string) => 
                                project.title.toLowerCase().includes(tag.toLowerCase())
                              )
                            );
                            if (relatedProject) {
                              setActiveTab('roadmap');
                              // Scroll to related project
                              setTimeout(() => {
                                const element = document.getElementById(`project-${relatedProject.id}`);
                                element?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }
                          }}
                          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 border border-green-200"
                        >
                          <Target className="w-4 h-4" />
                          <span className="text-sm">Project</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            // Open learning path modal or redirect
                            window.open(`/classroom/learning-path?article=${article.slug}`, '_blank');
                          }}
                          className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 border border-purple-200"
                        >
                          <ListChecks className="w-4 h-4" />
                          <span className="text-sm">Path</span>
                        </button>
                        
                        <button
                          onClick={() => openFeedbackModal(article)}
                          className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 border border-yellow-200"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span className="text-sm">Rating</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">Tidak ada artikel ditemukan</h3>
                <p className="text-gray-400">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <ClipboardList className="w-8 h-8 text-blue-600" />
                Roadmap Web Development SMA
              </h2>
              <p className="text-gray-600">
                Ikuti tahapan belajar dari dasar hingga mini proyek. Checklist dan refleksi tersimpan otomatis di perangkat ini berdasarkan ID siswa.
              </p>
            </motion.div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    ID Siswa
                  </label>
                  <input
                    type="text"
                    value={roadmapStudentId}
                    onChange={(e) => setRoadmapStudentId(e.target.value.trim())}
                    placeholder="Masukkan NIS atau ID siswa"
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Nama Siswa (opsional)
                  </label>
                  <input
                    type="text"
                    value={roadmapStudentName}
                    onChange={(e) => setRoadmapStudentName(e.target.value)}
                    placeholder="Masukkan nama untuk catatan"
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-blue-900/80">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Checklist akan otomatis tersimpan untuk ID siswa yang sama.</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset Progress
                </button>
              </div>
            </div>

            {projectLoadError && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {projectLoadError}
              </div>
            )}

            {projectsLoading ? (
              <div className="rounded-xl border border-blue-100 bg-white p-6 text-center text-sm text-blue-700">
                Memuat checklist proyek...
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
                Belum ada checklist proyek yang tersedia.
              </div>
            ) : (
              <div className="space-y-6">
                {projects.map((project, index) => {
                  const fallbackProgress = createEmptyProgress([project])[project.id];
                  const projectProgress = roadmapProgress[project.id] ?? fallbackProgress;

                  const basicItems = project.basicTargets.map((target, targetIndex) => {
                    const key = getTargetKey(project, 'basic', targetIndex);
                    return {
                      key,
                      label: target,
                      checked: projectProgress.basic?.[key] ?? false
                    };
                  });

                  const advancedItems = project.advancedTargets.map((target, targetIndex) => {
                    const key = getTargetKey(project, 'advanced', targetIndex);
                    return {
                      key,
                      label: target,
                      checked: projectProgress.advanced?.[key] ?? false
                    };
                  });

                  const basicCompleted = basicItems.filter((item) => item.checked).length;
                  const advancedCompleted = advancedItems.filter((item) => item.checked).length;

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
                    >
                      <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            {project.goal}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                            >
                              <Sparkles className="w-3 h-3" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-6 p-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-4">
                          <div className="rounded-lg border border-green-100 bg-green-50/60 p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2 text-green-700 font-semibold">
                                <BookOpenCheck className="w-4 h-4" />
                                Target Dasar
                              </div>
                              <span className="text-xs font-medium text-green-700 bg-white/70 px-2 py-1 rounded-full">
                                {basicCompleted}/{basicItems.length} selesai
                              </span>
                            </div>
                            <ul className="mt-3 space-y-2">
                              {basicItems.map((item) => (
                                <li key={item.key} className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    className="mt-1.5 h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                                    checked={item.checked}
                                    onChange={() => toggleProjectTarget(project.id, 'basic', item.key)}
                                    disabled={!roadmapStudentId}
                                  />
                                  <span className="text-sm text-gray-700">{item.label}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {advancedItems.length > 0 && (
                            <div className="rounded-lg border border-purple-100 bg-purple-50/60 p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2 text-purple-700 font-semibold">
                                  <Folder className="w-4 h-4" />
                                  Target Lanjutan
                                </div>
                                <span className="text-xs font-medium text-purple-700 bg-white/70 px-2 py-1 rounded-full">
                                  {advancedCompleted}/{advancedItems.length} selesai
                                </span>
                              </div>
                              <ul className="mt-3 space-y-2">
                                {advancedItems.map((item) => (
                                  <li key={item.key} className="flex items-start gap-3">
                                    <input
                                      type="checkbox"
                                      className="mt-1.5 h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                      checked={item.checked}
                                      onChange={() => toggleProjectTarget(project.id, 'advanced', item.key)}
                                      disabled={!roadmapStudentId}
                                    />
                                    <span className="text-sm text-gray-700">{item.label}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-lg border border-orange-100 bg-orange-50/60 p-4">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-orange-500" />
                              Catatan & Refleksi
                            </h4>
                            <p className="text-xs text-orange-700/80 mb-3">
                              {project.reflectionPrompt ?? DEFAULT_REFLECTION_PROMPT}
                            </p>
                            <textarea
                              value={projectProgress.reflection ?? ''}
                              onChange={(e) => handleReflectionChange(project.id, e.target.value)}
                              placeholder="Tuliskan pembelajaran, tantangan, atau ide pengembangan berikutnya..."
                              className="w-full h-32 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={!roadmapStudentId}
                            />
                            {!roadmapStudentId && (
                              <p className="mt-2 text-xs text-gray-500">
                                Masukkan ID siswa untuk mulai menandai checklist dan menyimpan refleksi.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && selectedAssignment && (
          /* Submission Form */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  title="Kembali ke daftar tugas"
                  aria-label="Kembali ke daftar tugas"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedAssignment.title}</h2>
                  <p className="text-gray-600">{selectedAssignment.subject}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Deskripsi Tugas:</h3>
                <p className="text-gray-600 mb-4">{selectedAssignment.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {new Date(selectedAssignment.dueDate).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{selectedAssignment.submissionCount}/{selectedAssignment.maxSubmissions} Submisi</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmission} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIS/ID Siswa *
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan NIS atau ID"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan email untuk notifikasi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File Tugas *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.zip,.rar,.7z,.tar,.gz,.jpg,.jpeg,.png,.gif,.svg,.webp,.html,.htm,.css,.js,.json,.xml,.py,.java,.c,.cpp,.h,.hpp,.php,.md,.txt,.yml,.yaml"
                      required
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      {uploadFile ? (
                        <div>
                          <p className="text-sm font-medium text-gray-800">{uploadFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Klik untuk upload file atau drag & drop
                          </p>
                          <p className="text-xs text-gray-500">
                            HTML, CSS, JS, PDF, DOC, ZIP, gambar, Python, dan lainnya (Maksimal 10MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignment(null)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Kumpulkan Tugas
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && selectedArticleForFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Berikan Rating & Feedback
                </h3>
                <p className="text-gray-600 text-sm">
                  {selectedArticleForFeedback.title}
                </p>
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rating Tutorial:
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`text-3xl transition-colors ${
                        star <= feedbackRating 
                          ? 'text-yellow-400 hover:text-yellow-500' 
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                  {feedbackRating === 0 ? 'Pilih rating' : 
                   feedbackRating === 1 ? 'Kurang banget 😞' :
                   feedbackRating === 2 ? 'Kurang 😐' :
                   feedbackRating === 3 ? 'Cukup 🙂' :
                   feedbackRating === 4 ? 'Bagus! 😊' : 
                   'Luar biasa! 🤩'}
                </p>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Komentar & Saran (opsional):
                </label>
                <textarea
                  id="feedback-comment"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Ceritakan pengalaman belajar kamu... Apa yang bisa diperbaiki?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedArticleForFeedback(null);
                    setFeedbackRating(0);
                    setFeedbackComment('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleFeedbackSubmit}
                  disabled={feedbackRating === 0 || isSubmittingFeedback}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingFeedback ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Kirim Feedback
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
