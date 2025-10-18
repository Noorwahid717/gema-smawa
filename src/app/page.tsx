"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import VideoLogo from "@/components/branding/VideoLogo";
import AnimatedLogoDemo from "@/components/branding/AnimatedLogoDemo";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SkipLink } from "@/components/ui/SkipLink";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import {
  Code,
  Rocket,
  Target,
  Users,
  Trophy,
  Lightbulb,
  BookOpen,
  Wrench,
  Mail,
  MapPin,
  Calendar,
  MapPinIcon,
  ChevronRight,
  Star,
  GraduationCap
} from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  participants: number;
  category: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  publishedAt: string;
}

interface GalleryItem {
  id: string;
  title: string;
  image: string;
  category: string;
  description: string;
}

interface Stats {
  totalMembers: number;
  activeProjects: number;
  completedWorkshops: number;
  achievements: number;
  upcomingEventsToday: number;
  upcomingEventsThisWeek: number;
}

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeProjects: 0,
    completedWorkshops: 0,
    achievements: 0,
    upcomingEventsToday: 0,
    upcomingEventsThisWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("hero");

  // Keyboard navigation for main sections
  useKeyboardNavigation({
    onEnter: () => {
      const sections = ["hero", "about", "vision", "activities", "benefits", "testimonials", "cta"];
      const currentIndex = sections.indexOf(activeSection);
      const nextIndex = (currentIndex + 1) % sections.length;
      setActiveSection(sections[nextIndex]);
      document.getElementById(sections[nextIndex])?.focus();
    },
    onEscape: () => setActiveSection("hero"),
  });

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      // Add cache buster to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/public?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched public data:', data); // Debug log
        if (data.success) {
          setActivities(data.data.activities || []);
          setAnnouncements(data.data.announcements || []);
          setGallery(data.data.gallery || []);
          console.log('Gallery data set:', data.data.gallery); // Debug log
          
          // Calculate upcoming events
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          const activitiesData = data.data.activities || [];
          const upcomingToday = activitiesData.filter((activity: Activity) => {
            const activityDate = new Date(activity.date);
            return activityDate >= today && activityDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          }).length;
          
          const upcomingThisWeek = activitiesData.filter((activity: Activity) => {
            const activityDate = new Date(activity.date);
            return activityDate >= today && activityDate < weekFromNow;
          }).length;
          
          setStats({
            ...data.data.stats,
            upcomingEventsToday: upcomingToday,
            upcomingEventsThisWeek: upcomingThisWeek
          });
        }
      }
    } catch (error) {
      console.error('Error fetching public data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'event': return '📅';
      case 'achievement': return '🏆';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  // Skeleton component for loading states
  const SkeletonCard = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}></div>
  );

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900">
          <SkipLink href="#main-content">Skip to main content</SkipLink>
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <SkeletonGrid />
        </div>
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider>
      <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
        <SkipLink href="#main-content">Skip to main content</SkipLink>

        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      {/* Hero Section */}
      <section id="hero" className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-green-400 relative overflow-hidden dark:from-blue-700 dark:via-blue-800 dark:to-green-600" tabIndex={-1}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-20 relative z-10">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center mb-4 p-2 shadow-lg">
              <OptimizedImage
                src="/gema.svg"
                alt="GEMA - Generasi Muda Informatika Logo"
                width={60}
                height={60}
                className="w-14 h-14"
                priority
              />
            </div>
            <h2 className="text-2xl font-bold text-white">GEMA</h2>
          </motion.div>

          {/* Main Content */}
          <div className="text-center text-white max-w-4xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              Generasi Muda <br />
              <span className="text-green-300">Informatika</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl mb-8 opacity-90"
            >
              Wadah kreatif untuk belajar, berinovasi, dan berkembang di dunia teknologi.
              <br />
              <span className="text-lg">SMA Wahidiyah Kediri - Pondok Pesantren Kedunglo</span>
            </motion.p>

            {/* Live Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto"
            >
              {loading ? (
                <>
                  <SkeletonCard className="h-16" />
                  <SkeletonCard className="h-16" />
                  <SkeletonCard className="h-16" />
                  <SkeletonCard className="h-16" />
                  <SkeletonCard className="h-16" />
                  <SkeletonCard className="h-16" />
                </>
              ) : (
                <>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="text-2xl font-bold">{stats.totalMembers}</div>
                    <div className="text-sm opacity-90">Anggota Aktif</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="text-2xl font-bold">{stats.activeProjects}</div>
                    <div className="text-sm opacity-90">Proyek Aktif</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="text-2xl font-bold">{stats.upcomingEventsToday}</div>
                    <div className="text-sm opacity-90">Kegiatan Hari Ini</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="text-2xl font-bold">{stats.completedWorkshops}</div>
                    <div className="text-sm opacity-90">Workshop Selesai</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="text-2xl font-bold">{stats.upcomingEventsThisWeek}</div>
                    <div className="text-sm opacity-90">Event Minggu Ini</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="text-2xl font-bold">{stats.achievements}</div>
                    <div className="text-sm opacity-90">Prestasi</div>
                  </div>
                </>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="/classroom"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2"
                aria-label="Masuk ke Classroom GEMA"
              >
                <BookOpen className="w-5 h-5" />
                Classroom
              </a>
              <a
                href="/student/login"
                className="bg-white text-blue-600 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                aria-label="Login untuk siswa"
              >
                <GraduationCap className="w-5 h-5" />
                Login Siswa
              </a>
            </motion.div>
          </div>
          
          {/* Hero Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-20 flex justify-center"
          >
            <div className="relative">
              <div className="w-80 h-80 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 p-8 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 shadow-lg">
                    <OptimizedImage
                      src="/gema.svg"
                      alt="GEMA Logo"
                      width={48}
                      height={48}
                      className="w-12 h-12"
                    />
                  </div>
                  <div className="w-16 h-16 bg-blue-300 rounded-lg flex items-center justify-center">
                    <Users className="w-8 h-8 text-black" aria-label="Users icon" />
                  </div>
                  <div className="w-16 h-16 bg-green-400 rounded-lg flex items-center justify-center">
                    <Rocket className="w-8 h-8 text-black" aria-label="Rocket icon" />
                  </div>
                  <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-8 h-8 text-black" aria-label="Lightbulb icon" />
                  </div>
                  <div className="w-16 h-16 bg-purple-400 rounded-lg flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-black" aria-label="Trophy icon" />
                  </div>
                  <div className="w-16 h-16 bg-pink-400 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-black" aria-label="Book icon" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Logo Animation Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">GEMA Animation</h2>
            <p className="text-xl text-gray-600">Animasi logo resmi Generasi Muda Informatika</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            {/* Try to load video first, fallback to animated demo */}
            <div className="relative">
              <VideoLogo
                src="/videos/gema-animation.mp4"
                width={600}
                height={400}
                autoplay={true}
                loop={true}
                muted={true}
                controls={false}
                className="max-w-full"
                fallbackImage="/gema.svg"
              />
              
              {/* Animated Demo as backup */}
              <div className="mt-8">
                <AnimatedLogoDemo />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12 max-w-4xl mx-auto"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-6 h-6 text-blue-600" aria-label="Code icon" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Innovation</h3>
                <p className="text-gray-600">Berinovasi dengan teknologi terdepan untuk masa depan yang lebih cerah</p>
              </div>

              <div className="bg-green-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" aria-label="Users icon" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Collaboration</h3>
                <p className="text-gray-600">Berkolaborasi dalam membangun generasi muda yang kompeten di bidang IT</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-6 h-6 text-purple-600" aria-label="Rocket icon" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Growth</h3>
                <p className="text-gray-600">Berkembang bersama melalui pembelajaran dan praktik langsung</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <section className="py-20 bg-blue-50 dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Pengumuman Terbaru</h2>
              <p className="text-xl text-gray-600">Update dan informasi penting dari GEMA</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {announcements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-start mb-4">
                    <span className="text-2xl mr-3">{getAnnouncementIcon(announcement.type)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{announcement.title}</h3>
                      <p className="text-sm text-gray-500">{formatDate(announcement.publishedAt)}</p>
                    </div>
                  </div>
                  <p className="text-gray-600">{announcement.content}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vision & Mission */}
      <section id="about" className="py-20 bg-gray-50 dark:bg-gray-800" tabIndex={-1}>
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-8">Tentang GEMA</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Komunitas pelajar yang aktif dan kreatif di bidang teknologi di SMA Wahidiyah Kediri. 
              Kami menyediakan platform pembelajaran yang menyenangkan dan kolaboratif untuk generasi muda 
              yang ingin mengembangkan kemampuan di dunia informatika dengan nilai-nilai pesantren.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Activities */}
      {activities.length > 0 && (
        <section id="activities" className="py-20 bg-white dark:bg-gray-900" tabIndex={-1}>
          <div className="container mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Kegiatan Mendatang</h2>
              <p className="text-xl text-gray-600">Jangan lewatkan event menarik dari GEMA</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-white" />
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-3">
                      {activity.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{activity.title}</h3>
                    <p className="text-gray-600 mb-4">{activity.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(activity.date)} • {activity.time}
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {activity.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {activity.participants}/{activity.capacity} peserta
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Activities */}
      <section id="vision" className="py-20 bg-white dark:bg-gray-900" tabIndex={-1}>
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Vision */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">Visi</h3>
              <p className="text-lg text-gray-600">
                Menjadi komunitas teknologi terdepan yang melahirkan generasi muda 
                Indonesia yang inovatif dan kompeten di bidang informatika dengan 
                landasan akhlak mulia dan nilai-nilai pesantren.
              </p>
            </motion.div>

            {/* Mission */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">Misi</h3>
              <ul className="text-left space-y-3 text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Memberikan pendidikan teknologi yang berkualitas
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Mengembangkan kreativitas dan inovasi siswa
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Membangun jaringan komunitas teknologi yang solid
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Program Utama</h2>
            <p className="text-xl text-gray-600">Program unggulan yang kami tawarkan</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Code,
                title: "Kelas Coding",
                description: "Belajar pemrograman dari dasar hingga advance dengan mentor berpengalaman",
                color: "bg-blue-500"
              },
              {
                icon: Wrench,
                title: "Workshop Teknologi", 
                description: "Workshop praktis tentang teknologi terbaru dan trending di industri",
                color: "bg-green-500"
              },
              {
                icon: Trophy,
                title: "Kompetisi IT",
                description: "Ajang kompetisi untuk mengasah kemampuan dan bersaing dengan peserta lain",
                color: "bg-yellow-500"
              },
              {
                icon: Lightbulb,
                title: "Proyek Kreatif",
                description: "Mengembangkan ide kreatif menjadi solusi teknologi yang bermanfaat",
                color: "bg-purple-500"
              }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-green-500/0 group-hover:from-blue-500/10 group-hover:to-green-500/10 transition-all duration-300"></div>
                <div className={`w-16 h-16 ${activity.color} rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  <activity.icon className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" aria-label={`${activity.title} icon`} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors duration-300 relative z-10">{activity.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 relative z-10">{activity.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      {gallery.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Galeri Kegiatan</h2>
              <p className="text-xl text-gray-600">Momen-momen berharga kegiatan GEMA</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {gallery.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="h-48 relative overflow-hidden">
                    {item.image ? (
                      <>
                        <Image 
                          src={item.image} 
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="fallback-content absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 hidden items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Trophy className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Trophy className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/80 to-green-500/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-2">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section id="benefits" className="py-20 bg-gray-50 dark:bg-gray-800" tabIndex={-1}>
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Manfaat Bergabung</h2>
            <p className="text-xl text-gray-600">Keuntungan yang akan kamu dapatkan</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: "🎉",
                title: "Belajar seru & menyenangkan",
                description: "Metode pembelajaran yang interaktif dan tidak membosankan"
              },
              {
                icon: "🧑‍🏫",
                title: "Dibimbing mentor berpengalaman", 
                description: "Mentor yang sudah berpengalaman di industri teknologi"
              },
              {
                icon: "🏅",
                title: "Ikut lomba & event IT",
                description: "Kesempatan berpartisipasi dalam berbagai kompetisi teknologi"
              },
              {
                icon: "📂",
                title: "Bangun coding lab digital",
                description: "Membuat coding lab yang menarik untuk masa depan karirmu"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4"
              >
                <div className="text-4xl flex-shrink-0">{benefit.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section id="testimonials" className="py-20 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700" tabIndex={-1}>
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Testimoni</h2>
            <p className="text-xl text-gray-600">Apa kata mereka tentang GEMA</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-lg"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="flex justify-center mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl text-gray-600 italic mb-6">
                &ldquo;Ikut GEMA bikin aku jago coding dan ketemu banyak teman baru! 
                Mentornya asik dan materinya mudah dipahami. Sekarang aku udah bisa 
                bikin aplikasi sendiri!&rdquo;
              </blockquote>
              <div className="font-bold text-gray-800">Noor Wahid</div>
              <div className="text-gray-500">Alumni SMA Wahidiyah 2020</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 dark:from-gray-950 dark:to-blue-950" tabIndex={-1}>
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ayo jadi bagian dari Generasi Muda Informatika
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              dan mulai petualanganmu di dunia teknologi!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/student/register"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                <ChevronRight className="w-6 h-6" />
                Register Portal Siswa
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Logo & Description */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3 p-1 shadow-md">
                  <OptimizedImage
                    src="/gema.svg"
                    alt="GEMA - Generasi Muda Informatika Logo"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <h3 className="text-2xl font-bold">GEMA</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Generasi Muda Informatika - Wadah kreatif untuk belajar dan berkembang di dunia teknologi 
                dengan landasan nilai-nilai pesantren di SMA Wahidiyah Kediri.
              </p>
            </div>

            {/* Social Media */}
            <div className="text-center">
              <h4 className="text-xl font-bold mb-4">Ikuti Kami</h4>
              <p className="text-gray-400">Segera hadir.</p>
            </div>

            {/* Contact */}
            <div className="text-center md:text-right">
              <h4 className="text-xl font-bold mb-4">Kontak</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center justify-center md:justify-end">
                  <Mail className="w-4 h-4 mr-2" aria-label="Mail icon" />
                  <span>smaswahidiyah@gmail.com</span>
                </div>
                <div className="flex items-center justify-center md:justify-end">
                  <BookOpen className="w-4 h-4 mr-2" aria-label="Book icon" />
                  <span>spmbkedunglo.com</span>
                </div>
                <div className="flex items-center justify-center md:justify-end">
                  <MapPin className="w-4 h-4 mr-2" aria-label="Map pin icon" />
                  <span>Jl. KH. Wahid Hasyim, Kediri</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
              <p>&copy; 2024 GEMA - Generasi Muda Informatika | SMA Wahidiyah Kediri. All rights reserved.</p>
              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <a
                  href="/student/login"
                  className="text-gray-500 hover:text-white transition-colors text-sm"
                >
                  Login Siswa
                </a>
                <a
                  href="/admin/login"
                  className="text-gray-500 hover:text-white transition-colors text-sm"
                >
                  Admin Panel
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </main>
    </ThemeProvider>
  );
}
