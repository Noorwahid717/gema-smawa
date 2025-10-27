"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BookOpen, Code, FileText, ArrowRight, Clock, User, Newspaper, Lightbulb, MessageSquare, HelpCircle, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { studentAuth, type StudentSession } from "@/lib/student-auth";

const PromptWorkspace = dynamic(() => import("@/components/tutorial/PromptWorkspace"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-blue-100 bg-white/80 p-8 text-center text-slate-500 shadow-sm">
      Memuat prompt interaktif...
    </div>
  ),
});

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  author?: string;
  publishedAt?: string;
  readTime?: number;
}

type TabType = 'berita' | 'artikel' | 'prompt' | 'kuis' | 'diskusi';

export default function TutorialPage() {
  const [activeTab, setActiveTab] = useState<TabType>('artikel');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);

  useEffect(() => {
    fetchArticles();
    const session = studentAuth.getSession();
    setStudentSession(session);
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tutorial/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'berita' as TabType, label: 'Berita', icon: Newspaper, description: 'Update terkini seputar teknologi' },
    { id: 'artikel' as TabType, label: 'Artikel', icon: FileText, description: 'Tutorial dan panduan lengkap' },
    { id: 'prompt' as TabType, label: 'Prompt', icon: Lightbulb, description: 'Ide project dan tantangan coding' },
    { id: 'kuis' as TabType, label: 'Kuis', icon: HelpCircle, description: 'Uji kemampuan programming' },
    { id: 'diskusi' as TabType, label: 'Diskusi', icon: MessageSquare, description: 'Forum tanya jawab' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat konten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowRight className="w-5 h-5 rotate-180" />
              <span>Kembali ke Beranda</span>
            </Link>
            {studentSession ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-gray-800">{studentSession.fullName}</span>
                  <span className="text-xs text-gray-500">{studentSession.studentId} • {studentSession.class}</span>
                </div>
                <Link
                  href="/student/dashboard-simple"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              </div>
            ) : (
              <Link
                href="/student/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Login Siswa
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Tutorial & Sumber Belajar</h1>
            </div>
            <p className="text-xl text-blue-100">
              Akses berita, artikel, prompt project, kuis, dan diskusi untuk mengembangkan kemampuan programming Anda
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-30">
        <div className="container mx-auto px-6">
          <nav className="flex gap-2 overflow-x-auto" role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-gray-300'
                  }`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Tab Description */}
        <div className="mb-8">
          {tabs.map((tab) => (
            activeTab === tab.id && (
              <div key={tab.id} className="flex items-center gap-2 text-gray-600">
                <tab.icon className="w-5 h-5" />
                <p className="text-lg">{tab.description}</p>
              </div>
            )
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'berita' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Berita Segera Hadir</h2>
              <p className="text-gray-600">
                Kami sedang mempersiapkan konten berita teknologi terkini untuk Anda.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'artikel' && (
          <>
            {articles.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Artikel Segera Hadir</h2>
                <p className="text-gray-600 mb-6">
                  Kami sedang mempersiapkan konten tutorial dan artikel berkualitas untuk Anda.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/tutorial/articles/${article.slug}`}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-6 group"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Code className="w-5 h-5 text-blue-600" />
                      </div>
                      {article.category && (
                        <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded">
                          {article.category}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto">
                      {article.author && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{article.author}</span>
                        </div>
                      )}
                      {article.readTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{article.readTime} menit</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-blue-600 font-medium mt-4 group-hover:gap-3 transition-all">
                      Baca Selengkapnya
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'prompt' && (
          <div className="space-y-6">
            <PromptWorkspace />
          </div>
        )}

        {activeTab === 'kuis' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Kuis Segera Hadir</h2>
              <p className="text-gray-600">
                Uji kemampuan programming Anda dengan kuis interaktif yang akan segera tersedia.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'diskusi' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Forum Diskusi Segera Hadir</h2>
              <p className="text-gray-600">
                Forum untuk bertanya, berbagi, dan berdiskusi dengan sesama pembelajar akan segera dibuka.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-12 mt-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Memulai Perjalanan Belajar?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Login sebagai siswa untuk mengakses fitur pembelajaran interaktif lengkap
          </p>
          <Link
            href="/student/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-colors"
          >
            Login Siswa
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
