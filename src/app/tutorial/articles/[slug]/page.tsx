"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { studentAuth, type StudentSession } from "@/lib/student-auth";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Eye, 
  Tag, 
  Share2, 
  BookOpen,
  Newspaper,
  Zap,
  Users,
  CheckSquare,
  Star,
  MessageCircle,
  Sparkles,
  ExternalLink,
  FolderOpen,
  Award,
  Send,
  LogIn,
  LayoutDashboard
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  status: string;
  featured: boolean;
  imageUrl?: string;
  readTime: number;
  views: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session, status } = useSession();
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);
  const isNextAuthStudent = session?.user?.userType === 'student';
  const isStudentLoggedIn = isNextAuthStudent || !!studentSession;
  const displayName = studentSession?.fullName || session?.user?.name || 'Siswa GEMA';
  const displayMeta = studentSession
    ? `${studentSession.studentId} • ${studentSession.class}`
    : session?.user?.email || '';
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Feedback State
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [challenge, setChallenge] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Real feedback data
  const [realFeedback, setRealFeedback] = useState<{
    id: string;
    rating: number;
    comment: string;
    challenge: string;
    timestamp: string;
    studentName: string;
    studentClass: string;
    timeAgo: string;
  }[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  
  // Testing Checklist State
  const [checklist, setChecklist] = useState({
    responsive: false,
    lightbox: false,
    performance: false,
    hover: false,
    navigation: false
  });

  const fetchArticle = useCallback(async () => {
    try {
      const response = await fetch(`/api/tutorial/articles/${slug}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setArticle(data.data);
        } else {
          setError(data.error || 'Article not found');
        }
      } else {
        setError('Failed to fetch article');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchFeedback = useCallback(async () => {
    if (!article?.id) return;
    
    setFeedbackLoading(true);
    try {
      const response = await fetch(`/api/tutorial/feedback?articleId=${article.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRealFeedback(data.data.feedback || []);
        }
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setFeedbackLoading(false);
    }
  }, [article?.id]);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug, fetchArticle]);

  useEffect(() => {
    if (article?.id) {
      fetchFeedback();
    }
  }, [article?.id, fetchFeedback]);

  useEffect(() => {
    const currentStudentSession = studentAuth.getSession();
    setStudentSession(currentStudentSession);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'tutorial': return 'bg-blue-100 text-blue-800';
      case 'news': return 'bg-green-100 text-green-800';
      case 'technology': return 'bg-purple-100 text-purple-800';
      case 'programming': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = article?.title || 'GEMA Article';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: article?.excerpt,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Link artikel berhasil disalin!');
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFeedbackSubmit = async () => {
    if (!isStudentLoggedIn) {
      alert('Hanya siswa yang sudah login yang dapat memberikan feedback!');
      return;
    }

    if (!rating || !feedback.trim()) {
      alert('Mohon berikan rating dan saran improvement!');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (!isNextAuthStudent && studentSession) {
        headers["x-student-id"] = studentSession.id;
      }

      const response = await fetch('/api/tutorial/feedback', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          articleId: article?.id,
          rating,
          comment: feedback,
          challenge,
          checklist
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.data.message || 'Terima kasih atas feedback Anda! 🎉');
        setFeedbackSubmitted(true);
        setRating(0);
        setFeedback('');
        setChallenge('');
        // Refresh feedback list
        fetchFeedback();
      } else {
        alert(data.error || 'Gagal mengirim feedback. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Sample next tutorial data
  const getNextTutorial = () => {
    const tutorials = [
      {
        id: 4,
        title: "JavaScript Interactivity",
        description: "Tambahkan filter, search, dan animasi ke galeri kamu",
        icon: <Zap className="w-6 h-6 text-yellow-500" />
      },
      {
        id: 5,  
        title: "Database Integration",
        description: "Simpan dan kelola data galeri dengan database",
        icon: <FolderOpen className="w-6 h-6 text-green-500" />
      },
      {
        id: 6,
        title: "Coding Lab Optimization",
        description: "Optimasi performa dan SEO untuk coding lab profesional",
        icon: <Award className="w-6 h-6 text-purple-500" />
      }
    ];
    
    return tutorials[Math.floor(Math.random() * tutorials.length)];
  };

  // Get display name and initial for feedback
  const getStudentDisplay = (studentName: string, studentClass: string) => {
    const initial = studentName.charAt(0).toUpperCase();
    const displayName = studentClass ? `${studentName} - ${studentClass}` : studentName;
    return { initial, displayName };
  };

  // Get background color for feedback cards
  const getFeedbackBgColor = (index: number) => {
    const colors = [
      "bg-green-100 text-green-800",
      "bg-blue-100 text-blue-800", 
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800"
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Artikel Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || 'Artikel yang Anda cari tidak tersedia.'}</p>
          <Link 
            href="/tutorial"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Tutorial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/tutorial"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Tutorial
            </Link>
            <div className="flex items-center gap-3">
              {isStudentLoggedIn && (
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-semibold text-gray-800">{displayName}</span>
                  {displayMeta && <span className="text-xs text-gray-500">{displayMeta}</span>}
                </div>
              )}
              {isStudentLoggedIn && (
                <Link
                  href="/student/dashboard-simple"
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard Siswa
                </Link>
              )}
              <Link
                href="/student/profile"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors border border-gray-300 rounded-lg hover:border-blue-300"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-6 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Featured Image */}
          {article.imageUrl && (
            <div className="h-64 md:h-96 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          )}

          <div className="p-8">
            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
                {article.category}
              </span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.publishedAt).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{article.readTime} menit baca</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{article.views} views</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-lg text-gray-600 mb-8 leading-relaxed border-l-4 border-blue-500 pl-4 italic">
                {article.excerpt}
              </p>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none 
                prose-headings:text-gray-800 prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-800 prose-strong:font-semibold
                prose-ul:mb-4 prose-li:mb-2
                prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </motion.div>

        {/* Next Learning Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-bold text-gray-800">Next Learning Path</h2>
          </div>
          
          {(() => {
            const nextTutorial = getNextTutorial();
            return (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {nextTutorial.icon}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{nextTutorial.title}</h3>
                      <p className="text-gray-600 text-sm">{nextTutorial.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Coming Next</span>
                    <div className="text-lg font-bold text-blue-600">Tutorial #{nextTutorial.id}</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>

        {/* User Testing & Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-md p-6 border border-yellow-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">User Testing & Feedback</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Testing Checklist */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-800">Testing Checklist</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { key: 'responsive', label: 'Gallery responsive di mobile & desktop' },
                  { key: 'lightbox', label: 'Lightbox berfungsi dengan smooth' },
                  { key: 'performance', label: 'Loading time < 3 detik untuk 20 gambar' },
                  { key: 'hover', label: 'Hover effects terasa natural' },
                  { key: 'navigation', label: 'Navigasi keyboard accessible' }
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer hover:bg-white hover:bg-opacity-50 p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist[item.key as keyof typeof checklist]}
                      onChange={() => handleChecklistChange(item.key as keyof typeof checklist)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Feedback Collection */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-800">Feedback Collection</h3>
              </div>
              
              {/* Check if user is logged in as student */}
              {status === 'loading' && !isStudentLoggedIn ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Checking login status...</p>
                </div>
              ) : !isStudentLoggedIn ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <LogIn className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-blue-800 mb-2">Login Diperlukan</h4>
                  <p className="text-sm text-blue-700 mb-4">
                    Hanya siswa yang sudah login yang dapat memberikan feedback
                  </p>
                  <Link
                    href={`/student/login?redirect=${encodeURIComponent(`/tutorial/articles/${slug}`)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Login Siswa
                  </Link>
                </div>
              ) : feedbackSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <h4 className="font-semibold text-green-800">Feedback Terkirim!</h4>
                  <p className="text-sm text-green-700">Terima kasih atas partisipasi Anda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate tutorial ini (1-5 ⭐)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`text-2xl transition-colors ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Challenge */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bagian mana yang paling challenging?
                    </label>
                    <select
                      value={challenge}
                      onChange={(e) => setChallenge(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      title="Pilih bagian yang paling challenging"
                    >
                      <option value="">Pilih bagian...</option>
                      <option value="CSS Grid setup">CSS Grid setup</option>
                      <option value="Lightbox implementation">Lightbox implementation</option>
                      <option value="Responsive design">Responsive design</option>
                      <option value="Image optimization">Image optimization</option>
                      <option value="JavaScript functionality">JavaScript functionality</option>
                    </select>
                  </div>

                  {/* Improvement Suggestions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Saran improvement
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="Bagaimana tutorial ini bisa lebih baik?"
                    />
                  </div>

                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={submittingFeedback || !rating || !feedback.trim()}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submittingFeedback ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Live Feedback dari Siswa GEMA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-2 rounded-lg">
              📊
            </div>
            <h2 className="text-xl font-bold text-gray-800">Live Feedback dari Siswa GEMA</h2>
          </div>
          
          <div className="space-y-4">
            {feedbackLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading feedback...</p>
              </div>
            ) : realFeedback.length > 0 ? (
              realFeedback.map((feedbackItem, index) => {
                const { initial, displayName } = getStudentDisplay(feedbackItem.studentName, feedbackItem.studentClass);
                const bgColor = getFeedbackBgColor(index);
                
                return (
                  <div key={feedbackItem.id} className={`${bgColor} rounded-lg p-4 border-l-4 border-current`}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-sm">
                        {initial}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{displayName}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(feedbackItem.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                            ))}
                            <span className="text-xs ml-2 opacity-75">{feedbackItem.timeAgo}</span>
                          </div>
                        </div>
                        {feedbackItem.comment && (
                          <p className="text-sm leading-relaxed">&ldquo;{feedbackItem.comment}&rdquo;</p>
                        )}
                        {feedbackItem.challenge && (
                          <p className="text-xs mt-2 opacity-75">
                            <strong>Challenging part:</strong> {feedbackItem.challenge}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Belum ada feedback</p>
                <p className="text-sm">Jadilah yang pertama memberikan feedback untuk artikel ini!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg shadow-md p-6 border border-blue-100"
        >
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <div className="text-2xl">🎉</div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Mantap! Galerimu sudah responsif, cepat, dan kece!</h2>
            <p className="text-gray-600">Sekarang waktunya terapkan di project nyata dan dapatkan feedback dari teman-teman!</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/tutorial/projects/gallery-builder"
              className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 text-center hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="text-lg">🔨</span>
              </div>
              <div className="font-semibold">Mulai Bangun Gallery</div>
              <div className="text-sm opacity-90">Project Builder Tool</div>
            </Link>

            <Link
              href="/tutorial/assignments/responsive-gallery"
              className="group bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-4 text-center hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="text-lg">📋</span>
              </div>
              <div className="font-semibold">Lihat Assignment</div>
              <div className="text-sm opacity-90">Tugas & Checklist</div>
            </Link>

            <Link
              href="/student/coding-lab/submit"
              className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-4 text-center hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="text-lg">💎</span>
              </div>
              <div className="font-semibold">Submit ke Coding Lab</div>
              <div className="text-sm opacity-90">Showcase Your Work</div>
            </Link>
          </div>
        </motion.div>

        {/* Back to Articles */}
        <div className="mt-8 text-center">
          <Link
            href="/tutorial"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <BookOpen className="w-4 h-4" />
            Kembali ke Tutorial
          </Link>
        </div>
      </article>
    </div>
  );
}
