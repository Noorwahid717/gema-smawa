"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Calendar,
  ChevronRight,
  Code2,
  GraduationCap,
  MapPin,
  Megaphone,
  MonitorPlay,
  Sparkles,
  Users,
} from "lucide-react";
import type { GSAP } from "gsap";
import innovationAnimationData from "@/../public/animations/innovation.json";
import VideoLogo from "@/components/branding/VideoLogo";
import AnimatedLogoDemo from "@/components/branding/AnimatedLogoDemo";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SkipLink } from "@/components/ui/SkipLink";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const VantaBackground = dynamic(() => import("@/components/landing/VantaBackground"), {
  ssr: false,
  loading: () => (
    <div
      className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,99,255,0.22),transparent_68%)]"
      aria-hidden="true"
    />
  ),
});

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

const typedPhrases = [
  "Belajar Informatika itu fun bareng squad!",
  "Ubah ide liar jadi produk digital nyata.",
  "Kolaborasi, kompetisi, dan kreasi tanpa batas!",
  "Coding sambil seru-seruan? Bisa banget!",
];

const heroEmojis = [
  { symbol: "💡", label: "Ide kreatif" },
  { symbol: "⚡", label: "Energi kolaborasi" },
  { symbol: "💻", label: "Eksperimen coding" },
];

type FeatureAccent = {
  primary: string;
  secondary: string;
  spotlight: string;
  shadow: string;
  hoverShadow: string;
  emoji: string;
  label: string;
};

interface FeatureCardConfig {
  title: string;
  description: string;
  highlights: string[];
  icon: typeof BarChart3;
  accent: FeatureAccent;
}

const featuresData: FeatureCardConfig[] = [
  {
    title: "Mission Control Dashboard",
    description:
      "Pantau progres kelas, kompetisi, dan pencapaian harian lewat panel yang terasa seperti pusat komando game.",
    highlights: ["Leaderboard dinamis", "Insight personal", "Reminder cerdas"],
    icon: BarChart3,
    accent: {
      primary: "#6C63FF",
      secondary: "#7F7FFF",
      spotlight: "rgba(108, 99, 255, 0.28)",
      shadow: "0 18px 45px rgba(108, 99, 255, 0.18)",
      hoverShadow: "0 24px 55px rgba(108, 99, 255, 0.28)",
      emoji: "📊",
      label: "Dashboard",
    },
  },
  {
    title: "Code Playground",
    description:
      "Eksperimen langsung dengan mini game coding, project kolaboratif, dan integrasi Git tanpa perlu setup ribet.",
    highlights: ["Sandbox aman", "Template stack populer", "Review mentor instan"],
    icon: Code2,
    accent: {
      primary: "#5EEAD4",
      secondary: "#50B0FF",
      spotlight: "rgba(94, 234, 212, 0.32)",
      shadow: "0 18px 45px rgba(80, 176, 255, 0.18)",
      hoverShadow: "0 24px 55px rgba(80, 176, 255, 0.26)",
      emoji: "💻",
      label: "Playground",
    },
  },
  {
    title: "Collab Studio Live",
    description:
      "Ikuti kelas interaktif, whiteboard seru, dan playback otomatis yang sinkron di semua perangkat squad-mu.",
    highlights: ["Streaming ultra-low latency", "Catatan otomatis", "Integrasi tugas realtime"],
    icon: MonitorPlay,
    accent: {
      primary: "#FF99CC",
      secondary: "#FDB9FF",
      spotlight: "rgba(255, 153, 204, 0.3)",
      shadow: "0 18px 45px rgba(255, 153, 204, 0.22)",
      hoverShadow: "0 24px 55px rgba(255, 153, 204, 0.3)",
      emoji: "🎙️",
      label: "Live Class",
    },
  },
];

const heroSpotlightCards = [
  {
    title: "Weekly Code Jam",
    caption: "Mini challenge dengan leaderboard real-time dan hadiah spesial.",
    accent: "#5EEAD4",
  },
  {
    title: "Creative Sprint",
    caption: "Kolaborasi lintas jurusan bikin prototype aplikasi dalam 48 jam.",
    accent: "#F4B5FF",
  },
  {
    title: "Mentor Hangout",
    caption: "Curhat karier teknologi bareng alumni & mentor industri.",
    accent: "#FFDB7D",
  },
];

const gradientBackground =
  "bg-[radial-gradient(circle_at_top,_rgba(108,99,255,0.18),transparent_65%)]";

type AccentPalette = {
  primary: string;
  secondary: string;
  tertiary?: string;
  glow: string;
  surface: string;
  label: string;
  emoji?: string;
};

const statsAccents: AccentPalette[] = [
  {
    primary: "#6C63FF",
    secondary: "#9C8BFF",
    tertiary: "rgba(108, 99, 255, 0.18)",
    glow: "0 22px 55px rgba(108, 99, 255, 0.22)",
    surface: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(239,238,255,0.92) 100%)",
    label: "Aktif",
    emoji: "🚀",
  },
  {
    primary: "#5EEAD4",
    secondary: "#53C8FF",
    tertiary: "rgba(94, 234, 212, 0.2)",
    glow: "0 22px 55px rgba(83, 200, 255, 0.2)",
    surface: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(228,250,249,0.9) 100%)",
    label: "Kolaborasi",
    emoji: "🤝",
  },
  {
    primary: "#FFB347",
    secondary: "#FFCF86",
    tertiary: "rgba(255, 179, 71, 0.24)",
    glow: "0 22px 55px rgba(255, 179, 71, 0.22)",
    surface: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,247,232,0.92) 100%)",
    label: "Pembelajaran",
    emoji: "📘",
  },
  {
    primary: "#FF99CC",
    secondary: "#FFB4E3",
    tertiary: "rgba(255, 153, 204, 0.24)",
    glow: "0 22px 55px rgba(255, 153, 204, 0.2)",
    surface: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,241,248,0.92) 100%)",
    label: "Prestasi",
    emoji: "🏆",
  },
];

const activityAccents: AccentPalette[] = [
  {
    primary: "#6C63FF",
    secondary: "#8B7CFF",
    glow: "0 24px 60px rgba(108, 99, 255, 0.22)",
    surface: "linear-gradient(165deg, rgba(255,255,255,0.95) 0%, rgba(240,242,ff,0.9) 100%)",
    label: "Bootcamp",
  },
  {
    primary: "#5EEAD4",
    secondary: "#58D3FF",
    glow: "0 24px 60px rgba(94, 234, 212, 0.22)",
    surface: "linear-gradient(165deg, rgba(255,255,255,0.95) 0%, rgba(229,250,249,0.92) 100%)",
    label: "Workshop",
  },
  {
    primary: "#FF99CC",
    secondary: "#FFB3E2",
    glow: "0 24px 60px rgba(255, 153, 204, 0.22)",
    surface: "linear-gradient(165deg, rgba(255,255,255,0.95) 0%, rgba(255,240,248,0.92) 100%)",
    label: "Community",
  },
];

const announcementAccentMap: Record<string, AccentPalette> = {
  event: {
    primary: "#6C63FF",
    secondary: "#8F83FF",
    glow: "0 20px 45px rgba(108, 99, 255, 0.2)",
    surface: "linear-gradient(165deg, rgba(255,255,255,0.94) 0%, rgba(239,241,ff,0.92) 100%)",
    label: "Event",
    emoji: "📅",
  },
  achievement: {
    primary: "#FFB347",
    secondary: "#FFCF86",
    glow: "0 20px 45px rgba(255, 179, 71, 0.22)",
    surface: "linear-gradient(165deg, rgba(255,255,255,0.94) 0%, rgba(255,246,230,0.92) 100%)",
    label: "Prestasi",
    emoji: "🌟",
  },
  info: {
    primary: "#5EEAD4",
    secondary: "#63B8FF",
    glow: "0 20px 45px rgba(94, 234, 212, 0.2)",
    surface: "linear-gradient(165deg, rgba(255,255,255,0.94) 0%, rgba(232,250,245,0.92) 100%)",
    label: "Info",
    emoji: "ℹ️",
  },
};

const galleryAccents: AccentPalette[] = [
  {
    primary: "#6C63FF",
    secondary: "#5EEAD4",
    glow: "0 20px 45px rgba(108, 99, 255, 0.18)",
    surface: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(237,240,255,0.92) 100%)",
    label: "Labs",
  },
  {
    primary: "#FF99CC",
    secondary: "#FFD1DC",
    glow: "0 20px 45px rgba(255, 153, 204, 0.2)",
    surface: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,240,248,0.92) 100%)",
    label: "Kolaborasi",
  },
  {
    primary: "#5EEAD4",
    secondary: "#6DB2FF",
    glow: "0 20px 45px rgba(94, 234, 212, 0.2)",
    surface: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(233,248,255,0.92) 100%)",
    label: "Eksplorasi",
  },
];

type ScrollRevealController = {
  reveal: (
    target: string | Element | Element[] | NodeListOf<Element>,
    config?: Record<string, unknown>,
  ) => void;
  clean?: (
    target?: string | Element | Element[] | NodeListOf<Element>,
  ) => void;
};

class InteractiveBackgroundBoundary
  extends Component<{ children: ReactNode }, { hasError: boolean }>
{
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Interactive background failed to render", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div className={`absolute inset-0 ${gradientBackground}`} aria-hidden="true" />;
    }

    return this.props.children;
  }
}

const formatStatValue = (value: number, suffix = "") =>
  `${value.toLocaleString("id-ID")}${suffix}`;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function HomePage() {
  const heroRef = useRef<HTMLElement | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement | null>(null);
  const heroButtonsRef = useRef<HTMLDivElement | null>(null);
  const typedRef = useRef<HTMLSpanElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const activitiesRef = useRef<HTMLDivElement | null>(null);
  const announcementsRef = useRef<HTMLDivElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const ctaButtonRef = useRef<HTMLAnchorElement | null>(null);
  const lottieContainerRef = useRef<HTMLDivElement | null>(null);
  const countersRef = useRef<Array<HTMLSpanElement | null>>([]);

  const { resolvedTheme } = useTheme();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeProjects: 0,
    completedWorkshops: 0,
    achievements: 0,
    upcomingEventsToday: 0,
    upcomingEventsThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("hero");
  const [shouldRenderVanta, setShouldRenderVanta] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLottieLoaded, setIsLottieLoaded] = useState(false);

  const prefersReducedMotion = usePrefersReducedMotion();

  useKeyboardNavigation({
    onEnter: () => {
      const sections = [
        "hero",
        "features",
        "stats",
        "activities",
        "announcements",
        "gallery",
        "cta",
      ];
      const currentIndex = sections.indexOf(activeSection);
      const nextIndex = (currentIndex + 1) % sections.length;
      setActiveSection(sections[nextIndex]);
      document.getElementById(sections[nextIndex])?.focus();
    },
    onEscape: () => setActiveSection("hero"),
  });

  const fetchPublicData = useCallback(async () => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/public?_t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const activitiesData: Activity[] = data.data.activities ?? [];
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

          const upcomingEventsTodayCount = activitiesData.filter((activity) => {
            const activityDate = new Date(activity.date);
            return (
              activityDate >= today &&
              activityDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
            );
          }).length;

          const upcomingEventsThisWeekCount = activitiesData.filter((activity) => {
            const activityDate = new Date(activity.date);
            return activityDate >= today && activityDate < weekFromNow;
          }).length;

          setActivities(activitiesData);
          setAnnouncements(data.data.announcements ?? []);
          setGallery(data.data.gallery ?? []);
          setStats({
            ...(data.data.stats as Omit<Stats, "upcomingEventsToday" | "upcomingEventsThisWeek">),
            upcomingEventsToday: upcomingEventsTodayCount,
            upcomingEventsThisWeek: upcomingEventsThisWeekCount,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching public data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicData().catch(() => null);
  }, [fetchPublicData]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const updateShouldRender = () => {
      setShouldRenderVanta(!prefersReducedMotion && !mobileQuery.matches);
    };
    updateShouldRender();
    const handleChange = () => updateShouldRender();
    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", handleChange);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(handleChange);
    }
    return () => {
      if (typeof mobileQuery.removeEventListener === "function") {
        mobileQuery.removeEventListener("change", handleChange);
      } else if (typeof mobileQuery.removeListener === "function") {
        mobileQuery.removeListener(handleChange);
      }
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!typedRef.current) {
      return;
    }

    typedRef.current.textContent = typedPhrases[0];

    if (prefersReducedMotion) {
      return;
    }

    let typedInstance: { destroy: () => void } | null = null;
    let isActive = true;

    import("typed.js")
      .then((module) => {
        if (!isActive || !typedRef.current) {
          return;
        }
        const Typed = module.default;
        typedInstance = new Typed(typedRef.current, {
          strings: typedPhrases,
          typeSpeed: 64,
          backSpeed: 36,
          backDelay: 1600,
          loop: true,
          smartBackspace: true,
        });
      })
      .catch(() => null);

    return () => {
      isActive = false;
      typedInstance?.destroy();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let ctx: GSAP.Context | null = null;

    (async () => {
      const { default: gsap } = await import("gsap");

      ctx = gsap.context(() => {
        const titleEl = heroTitleRef.current;
        const subtitleEl = heroSubtitleRef.current;
        const buttonEls = heroButtonsRef.current
          ? Array.from(heroButtonsRef.current.querySelectorAll("a"))
          : [];

        if (!titleEl || !subtitleEl) {
          return;
        }

        gsap.set([titleEl, subtitleEl, ...buttonEls], {
          opacity: 0,
          y: 24,
        });

        gsap
          .timeline({ defaults: { ease: "cubic-bezier(0.16, 1, 0.3, 1)" } })
          .to(titleEl, { opacity: 1, y: 0, duration: 0.8 })
          .to(subtitleEl, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
          .to(buttonEls, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, "-=0.4");
      }, heroRef);
    })();

    return () => {
      ctx?.revert();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const updateProgress = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      setScrollProgress(total > 0 ? scrollTop / total : 0);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  const handleFeaturePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (prefersReducedMotion) {
        return;
      }

      const card = event.currentTarget;
      const rect = card.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const rotateY = ((offsetX / rect.width) - 0.5) * 10;
      const rotateX = (0.5 - offsetY / rect.height) * 10;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.01)`;
      card.style.setProperty("--spotlight-x", `${offsetX}px`);
      card.style.setProperty("--spotlight-y", `${offsetY}px`);
    },
    [prefersReducedMotion],
  );

  const handleFeaturePointerLeave = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const card = event.currentTarget;
      card.style.transform = "";
      card.style.setProperty("--spotlight-x", "50%");
      card.style.setProperty("--spotlight-y", "50%");
    },
    [],
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let context: GSAP.Context | undefined;

    (async () => {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        const parallaxElements = document.querySelectorAll<HTMLElement>("[data-parallax]");
        parallaxElements.forEach((element) => {
          const speed = Number(element.dataset.parallax ?? "0.2");
          const trigger = element.closest<HTMLElement>("[data-parallax-root]") ?? element;
          gsap.fromTo(
            element,
            { yPercent: -20 * speed },
            {
              yPercent: 20 * speed,
              ease: "sine.inOut",
              scrollTrigger: {
                trigger,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });
      }, document.body);
    })();

    return () => {
      context?.revert();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!featuresRef.current) {
      return;
    }

    if (prefersReducedMotion) {
      featuresRef.current
        .querySelectorAll("[data-feature-card]")
        .forEach((card) => {
          card.classList.remove("opacity-0");
          (card as HTMLElement).style.opacity = "1";
          (card as HTMLElement).style.transform = "none";
        });
      return;
    }

    let observer: IntersectionObserver | null = null;
    let hasAnimated = false;

    const runAnimation = async () => {
      if (hasAnimated || !featuresRef.current) {
        return;
      }
      const cards = Array.from(
        featuresRef.current.querySelectorAll<HTMLElement>("[data-feature-card]"),
      );
      if (cards.length === 0) {
        return;
      }

      cards.forEach((card) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(24px) scale(0.95)";
      });

      try {
        const anime = (await import("animejs")).default;
        hasAnimated = true;
        anime({
          targets: cards,
          opacity: [0, 1],
          scale: [0.95, 1],
          translateY: [24, 0],
          delay: anime.stagger(200),
          easing: "easeOutElastic(1, .8)",
          duration: 1400,
          complete: () => {
            cards.forEach((card) => {
              card.style.opacity = "1";
              card.style.transform = "none";
              card.classList.remove("opacity-0");
              card.classList.remove("md:scale-95");
            });
          },
        });
      } catch (error) {
        hasAnimated = true;
        cards.forEach((card) => {
          card.style.opacity = "1";
          card.style.transform = "none";
          card.classList.remove("opacity-0");
          card.classList.remove("md:scale-95");
        });
        console.warn("Failed to start feature animation", error);
      }
    };

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runAnimation().catch(() => null);
            observer?.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(featuresRef.current);

    return () => observer?.disconnect();
  }, [prefersReducedMotion]);

  const statsItems = useMemo(
    () => [
      {
        label: "Siswa Aktif",
        value: stats.totalMembers,
        suffix: "+",
        description: "bergabung dan konsisten mengasah skill teknologi setiap semester.",
        icon: Users,
      },
      {
        label: "Proyek Aktif",
        value: stats.activeProjects,
        suffix: "+",
        description: "kolaborasi lintas angkatan yang sedang dikerjakan bersama mentor.",
        icon: Sparkles,
      },
      {
        label: "Workshop Tuntas",
        value: stats.completedWorkshops,
        suffix: "+",
        description: "pelatihan modul praktis yang telah diselesaikan komunitas.",
        icon: BookOpenCheck,
      },
      {
        label: "Prestasi",
        value: stats.achievements,
        suffix: "+",
        description: "penghargaan dan kompetisi IT tingkat regional hingga nasional.",
        icon: GraduationCap,
      },
    ],
    [stats],
  );

  useEffect(() => {
    if (!statsRef.current) {
      return;
    }

    if (prefersReducedMotion) {
      statsItems.forEach((stat, index) => {
        const target = countersRef.current[index];
        if (target) {
          target.textContent = formatStatValue(stat.value, stat.suffix);
        }
      });
      return;
    }

    let observer: IntersectionObserver | null = null;
    const animations: GSAP.Tween[] = [];
    let hasTriggered = false;

    const initAnimation = async () => {
      const { default: gsap } = await import("gsap");

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasTriggered) {
              hasTriggered = true;
              statsItems.forEach((stat, index) => {
                const counterElement = countersRef.current[index];
                if (!counterElement) {
                  return;
                }
                const state = { value: 0 };
                const tween = gsap.to(state, {
                  value: stat.value,
                  duration: 2,
                  ease: "cubic-bezier(0.16, 1, 0.3, 1)",
                  onUpdate: () => {
                    counterElement.textContent = formatStatValue(
                      Math.round(state.value),
                      stat.suffix,
                    );
                  },
                });
                animations.push(tween);
              });
              observer?.disconnect();
            }
          });
        },
        { threshold: 0.4 },
      );

      observer.observe(statsRef.current as Element);
    };

    initAnimation().catch(() => null);

    return () => {
      observer?.disconnect();
      animations.forEach((animation) => animation.kill());
    };
  }, [prefersReducedMotion, statsItems]);

  useEffect(() => {
    const button = ctaButtonRef.current;
    if (!button) {
      return;
    }

    if (prefersReducedMotion) {
      button.style.boxShadow = "0 0 0 rgba(127, 127, 255, 0)";
      return;
    }

    let animation: GSAP.Tween | null = null;
    let isMounted = true;

    import("gsap")
      .then(({ default: gsap }) => {
        if (!isMounted || !button) {
          return;
        }

        animation = gsap.to(button, {
          boxShadow: "0 0 28px rgba(127, 127, 255, 0.45)",
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      })
      .catch(() => null);

    return () => {
      isMounted = false;
      animation?.kill();
      button.style.boxShadow = "";
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!lottieContainerRef.current) {
      return;
    }

    let animationInstance: import("lottie-web").AnimationItem | null = null;
    let isCancelled = false;
    const markLoaded = () => setIsLottieLoaded(true);

    setIsLottieLoaded(false);

    import("lottie-web")
      .then(({ default: lottie }) => {
        if (!lottieContainerRef.current || isCancelled) {
          return;
        }
        animationInstance = lottie.loadAnimation({
          container: lottieContainerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: !prefersReducedMotion,
          animationData: innovationAnimationData,
        });

        animationInstance.addEventListener("DOMLoaded", markLoaded);
        animationInstance.addEventListener("loopComplete", markLoaded);

        if (prefersReducedMotion) {
          animationInstance.goToAndStop(0, true);
          markLoaded();
        }
      })
      .catch(() => {
        setIsLottieLoaded(false);
      });

    return () => {
      isCancelled = true;
      if (animationInstance) {
        animationInstance.removeEventListener("DOMLoaded", markLoaded);
        animationInstance.removeEventListener("loopComplete", markLoaded);
        animationInstance.destroy();
      }
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let scrollRevealInstance: ScrollRevealController | null = null;

    import("scrollreveal")
      .then(({ default: ScrollReveal }) => {
        scrollRevealInstance = ScrollReveal();
        scrollRevealInstance.reveal("[data-reveal]", {
          delay: 200,
          distance: "40px",
          origin: "bottom",
          duration: 800,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          interval: 120,
          cleanup: true,
        });
      })
      .catch(() => null);

    return () => {
      scrollRevealInstance?.clean?.("[data-reveal]");
    };
  }, [prefersReducedMotion, activities.length, announcements.length, gallery.length]);

  const heroGradientOverlay = useMemo(
    () =>
      resolvedTheme === "dark"
        ? "absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_18%,_rgba(94,234,212,0.18),transparent_58%)]"
        : "absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_18%,_rgba(108,99,255,0.12),transparent_68%)]",
    [resolvedTheme],
  );

  const heroBackdropOverlay = useMemo(
    () =>
      resolvedTheme === "dark"
        ? "absolute inset-0 pointer-events-none bg-gradient-to-br from-[#070721]/85 via-[#050513]/65 to-[#021119]/90"
        : "absolute inset-0 pointer-events-none bg-gradient-to-br from-[#ffffff]/92 via-[#eef3ff]/70 to-[#e6faff]/90",
    [resolvedTheme],
  );

  const featuredActivities = useMemo(() => activities.slice(0, 3), [activities]);
  const latestAnnouncements = useMemo(() => announcements.slice(0, 3), [announcements]);
  const highlightedGallery = useMemo(() => gallery.slice(0, 6), [gallery]);

  if (loading) {
    return (
      <>
        <SkipLink href="#main-content">Lewati ke konten utama</SkipLink>
        <div className="min-h-screen bg-gradient-to-b from-[#f6f7ff] via-white to-[#e9f6ff] text-slate-900 transition-colors duration-500 dark:from-[#040321] dark:via-[#050513] dark:to-[#0a0c1d] dark:text-white">
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <SkeletonGrid />
        </div>
      </>
    );
  }

  return (
    <>
      <SkipLink href="#main-content">Lewati ke konten utama</SkipLink>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-1 bg-slate-900/10 transition-colors duration-500 dark:bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-[#6C63FF] via-[#5EEAD4] to-[#96f7d6] transition-all duration-300"
          style={{ width: `${Math.min(scrollProgress * 100, 100).toFixed(2)}%` }}
        />
      </div>
      <main
        id="main-content"
        className="bg-gradient-to-b from-[#f6f7ff] via-white to-[#e9f6ff] text-slate-900 transition-colors duration-500 dark:from-[#040321] dark:via-[#050513] dark:to-[#0a0c1d] dark:text-white"
      >
        <section
          id="hero"
          ref={heroRef}
          className="relative overflow-hidden"
          aria-labelledby="hero-heading"
          data-parallax-root
        >
          <div className="absolute inset-0">
            {shouldRenderVanta ? (
              <InteractiveBackgroundBoundary>
                <VantaBackground className="absolute inset-0" theme={resolvedTheme} />
              </InteractiveBackgroundBoundary>
            ) : (
              <div className={`absolute inset-0 ${gradientBackground}`} aria-hidden="true" />
            )}
            <div className={heroGradientOverlay} aria-hidden="true" />
            <div className={heroBackdropOverlay} aria-hidden="true" />
            <div className="absolute inset-0 pointer-events-none">
              <div
                data-parallax="0.25"
                className="absolute -top-24 right-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#6C63FF]/45 to-transparent blur-3xl"
              />
              <div
                data-parallax="0.2"
                className="absolute bottom-0 left-16 h-72 w-72 rounded-full bg-gradient-to-br from-[#5EEAD4]/35 to-transparent blur-3xl"
              />
              <div
                data-parallax="0.35"
                className="absolute -bottom-20 right-24 h-44 w-44 rounded-full border border-[#5EEAD4]/40"
              />
            </div>
          </div>

          <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-20 pt-24 sm:px-10 md:flex-row md:items-center md:pb-28 md:pt-32">
            <div className="flex-1">
              <motion.div
                initial={prefersReducedMotion ? false : { scale: 0.7, opacity: 0 }}
                animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur"
              >
                <Image
                  src="/gema.svg"
                  alt="Logo GEMA SMA Wahidiyah"
                  width={48}
                  height={48}
                  priority
                />
              </motion.div>
              <p className="inline-flex items-center gap-3 text-sm font-medium uppercase tracking-[0.3em] text-[#5EEAD4]/80">
                Playful Tech Movement
                <span className="h-px w-10 bg-[#5EEAD4]/40" aria-hidden="true" />
              </p>
              <h1
                id="hero-heading"
                ref={heroTitleRef}
                className="mt-5 text-4xl font-semibold leading-tight text-slate-900 transition-colors duration-500 dark:text-white sm:text-5xl md:text-6xl"
              >
                Belajar Informatika jadi petualangan seru bareng GEMA SMA Wahidiyah
              </h1>
              <p
                ref={heroSubtitleRef}
                className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 transition-colors duration-500 dark:text-slate-200/85 sm:text-lg"
              >
                Gabung komunitas digital yang bikin ngoding terasa seperti main game: penuh tantangan
                seru, mentor suportif, dan ruang untuk eksplorasi ide liar jadi karya berdampak.
              </p>

              <ul className="mt-6 flex items-center gap-3 text-xl sm:gap-4" aria-hidden="true">
                {heroEmojis.map((emoji) => (
                  <li key={emoji.label} className="hero-emoji" title={emoji.label}>
                    {emoji.symbol}
                  </li>
                ))}
              </ul>

              <div
                ref={heroButtonsRef}
                className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
              >
                <Link
                  href="/contact"
                  ref={ctaButtonRef}
                  className="cta-button inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#6C63FF] to-[#5EEAD4] px-8 py-4 text-base font-semibold text-[#0b0b1c] shadow-lg transition-transform duration-300 hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4]"
                  aria-label="Hubungi tim GEMA untuk bergabung"
                >
                  Gabung Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/tutorial"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#5EEAD4] transition-colors duration-300 hover:text-[#6ff0df] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4]"
                >
                  Jelajahi Kurikulum
                  <span aria-hidden="true" className="h-px w-8 bg-[#5EEAD4]/50" />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4 text-base">
                <span className="rounded-full bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#5EEAD4]">
                  Tagline
                </span>
                <span ref={typedRef} className="text-xl font-semibold text-[#5EEAD4]" aria-live="polite" />
              </div>

              <div className="mt-8 grid gap-4 text-sm text-slate-600 transition-colors duration-500 dark:text-slate-200/70 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/80 p-4 backdrop-blur-sm dark:bg-white/5">
                  <p className="font-semibold text-slate-900 dark:text-white">Quest Harian &amp; Badge</p>
                  <p className="mt-1">
                    Sistem XP yang bikin tiap tugas kerasa seperti naik level di game favoritmu.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/80 p-4 backdrop-blur-sm dark:bg-white/5">
                  <p className="font-semibold text-slate-900 dark:text-white">Squad Support System</p>
                  <p className="mt-1">
                    Mentor, guru, dan alumni siap bantu brainstorming dan review karya secara realtime.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {heroSpotlightCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={
                      prefersReducedMotion
                        ? false
                        : { opacity: 0, y: 18, rotate: -2 }
                    }
                    animate={
                      prefersReducedMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }
                    }
                    transition={{
                      delay: prefersReducedMotion ? 0 : 0.2 + index * 0.12,
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="rounded-2xl border border-white/10 bg-white/90 p-4 text-left shadow-lg shadow-[#03030f]/20 backdrop-blur transition-colors duration-500 dark:bg-white/5 dark:shadow-[#03030f]/40"
                    style={{
                      borderColor: `${card.accent}33`,
                      boxShadow: `0 12px 28px ${card.accent}26`,
                    }}
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{card.title}</p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-200/75">{card.caption}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative flex-1 space-y-6">
              <div className="relative rounded-3xl border border-white/20 bg-white/95 p-6 backdrop-blur-lg transition-colors duration-500 dark:border-white/10 dark:bg-white/5">
                <div className="absolute inset-0 rounded-3xl border border-white/10" aria-hidden="true" />
                <div className="mb-4 flex items-center justify-between text-sm font-semibold uppercase tracking-[0.35em] text-[#5EEAD4]/80">
                  <span>Harmoni Digital</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-200/70">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Live
                  </span>
                </div>
                <VideoLogo
                  src="/videos/gema-animation.mp4"
                  width={560}
                  height={320}
                  className="overflow-hidden rounded-2xl"
                  fallbackImage="/gema.svg"
                />
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-200/75">
                  Visualisasi modul pembelajaran dan kolaborasi coding yang digunakan dalam sesi kelas
                  interaktif GEMA.
                </p>
              </div>

              <div className="flex flex-col gap-5 rounded-3xl border border-white/20 bg-white/95 p-6 backdrop-blur-lg transition-colors duration-500 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C63FF]/90 to-[#5EEAD4]/60 text-[#050513]">
                    <Calendar className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Agenda Pekan Ini</p>
                    <p className="text-xs text-slate-500 dark:text-slate-200/70">
                      {stats.upcomingEventsThisWeek} kegiatan siap diikuti
                    </p>
                  </div>
                </div>
                <div
                  ref={lottieContainerRef}
                  className="relative h-40 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#6C63FF]/20 via-transparent to-[#5EEAD4]/10 lottie-shell"
                  role="presentation"
                  aria-hidden="true"
                >
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs font-semibold text-slate-600 transition-opacity duration-300 dark:text-slate-200/70 ${
                      isLottieLoaded && !prefersReducedMotion ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <div className="lottie-placeholder-grid">
                      <span className="lottie-placeholder-dot" />
                      <span className="lottie-placeholder-dot" />
                      <span className="lottie-placeholder-dot" />
                    </div>
                    <span>Visual animatif akan tampil di sini</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/90 p-4 backdrop-blur transition-colors duration-500 dark:border-white/10 dark:bg-white/5">
                  <AnimatedLogoDemo />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="relative overflow-hidden bg-[#eef3ff] py-20 transition-colors duration-500 sm:py-24 dark:bg-[#06081C]"
          aria-labelledby="features-heading"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,99,255,0.08),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(108,99,255,0.12),transparent_60%)]" />
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6C63FF]/30 to-transparent dark:via-white/20"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
            <div className="max-w-2xl" data-reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#5EEAD4]/80">
                Program Unggulan
              </span>
              <h2
                id="features-heading"
                className="mt-5 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl"
              >
                Jalur belajar modern yang mengalir dari teori ke praktik
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-200/80">
                Setiap fitur dirancang untuk menjaga fokus siswa, mempermudah guru memantau progres,
                serta mempercepat ide menjadi prototipe nyata.
              </p>
            </div>

            <div
              ref={featuresRef}
              className="mt-12 grid gap-6 md:grid-cols-3 lg:[grid-template-columns:1.1fr_1fr_0.95fr]"
              aria-live="polite"
              aria-busy="false"
            >
              {featuresData.map((feature, index) => {
                const Icon = feature.icon;
                const cardStyle = {
                  boxShadow: feature.accent.shadow,
                  borderColor: `${feature.accent.primary}26`,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(247,249,255,0.95) 100%)",
                  "--card-accent-primary": feature.accent.primary,
                  "--card-accent-secondary": feature.accent.secondary,
                  "--card-accent-tertiary": feature.accent.spotlight,
                  "--card-shadow-hover": feature.accent.hoverShadow,
                  "--spotlight-x": "50%",
                  "--spotlight-y": "50%",
                } as CSSProperties;

                return (
                  <article
                    key={feature.title}
                    data-feature-card
                    data-reveal
                    className="group feature-card relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/90 p-8 shadow-xl shadow-[#050513]/10 backdrop-blur-xl transition-colors duration-500 will-change-transform dark:border-white/10 dark:bg-white/5 dark:shadow-[#050513]/40 sm:p-9"
                    style={cardStyle}
                    onPointerMove={handleFeaturePointerMove}
                    onPointerLeave={handleFeaturePointerLeave}
                    onPointerUp={handleFeaturePointerLeave}
                  >
                    <div className="absolute inset-0 pointer-events-none">
                      <span className="feature-card-ornament" aria-hidden="true" />
                    </div>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-200/70">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/40 px-3 py-1 text-[0.65rem] font-semibold dark:bg-white/10">
                        {feature.accent.emoji} {feature.accent.label}
                      </span>
                      <span className="hidden text-[0.65rem] font-semibold text-[#5EEAD4]/80 sm:inline">
                        #{(index + 1).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <div className="relative mt-4 flex items-center gap-4">
                      <div
                        className="feature-card-icon flex h-12 w-12 items-center justify-center rounded-2xl text-[#050513] shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${feature.accent.primary}, ${feature.accent.secondary})`,
                        }}
                      >
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                    </div>
                    <p className="relative mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-200/80">
                      {feature.description}
                    </p>
                    <ul className="relative mt-6 flex flex-wrap gap-2 text-xs text-[#5EEAD4]/90">
                      {feature.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="rounded-full border border-[#5EEAD4]/30 bg-[#06081C]/60 px-3 py-1"
                        >
                          {highlight}
                        </li>
                      ))}
                    </ul>
                    <div className="relative mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-[#5EEAD4]/80">
                      Selengkapnya
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="stats"
          ref={statsRef}
          className="relative overflow-hidden bg-[#f7f9ff] py-20 transition-colors duration-500 sm:py-24 dark:bg-[#050513]"
          aria-labelledby="stats-heading"
          data-parallax-root
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(94,234,212,0.16),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(94,234,212,0.14),transparent_65%)]" />
          <div className="absolute inset-0 opacity-75">
            <div
              data-parallax="0.18"
              className="absolute right-16 top-12 h-48 w-48 rounded-full border border-[#6C63FF]/30"
            />
            <div
              data-parallax="0.28"
              className="absolute -left-10 bottom-8 h-60 w-60 rounded-full bg-gradient-to-br from-[#6C63FF]/30 to-transparent blur-3xl"
            />
          </div>
          <div className="stats-grid relative mx-auto max-w-6xl px-6 sm:px-10">
            <div className="text-center" data-reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#5EEAD4]/80">
                Dampak Komunitas
              </span>
              <h2 id="stats-heading" className="mt-5 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
                Pertumbuhan ekosistem belajar yang terukur dan kolaboratif
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-200/75">
                Data berikut diperbarui secara realtime dari dashboard komunitas, memberikan gambaran
                nyata bagaimana siswa dan guru berinteraksi dalam program GEMA.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {statsItems.map((stat, index) => {
                const Icon = stat.icon;
                const accent = statsAccents[index % statsAccents.length];
                const statCardStyle = {
                  background: accent.surface,
                  borderColor: `${accent.primary}26`,
                  boxShadow: accent.glow,
                } as CSSProperties;
                return (
                  <article
                    key={stat.label}
                    data-reveal
                    className="stat-card relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-white/20 bg-white/90 p-8 shadow-xl shadow-[#040410]/10 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-white/5 dark:shadow-[#040410]/60"
                    style={statCardStyle}
                  >
                    <div
                      className="relative flex items-center gap-4"
                      data-shimmer
                    >
                      <div
                        className="stat-card-icon relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`,
                        }}
                      >
                        <Icon className="h-7 w-7 text-[#050513]" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-200/70">
                          {stat.label}
                        </p>
                        <p className="mt-1 flex items-baseline gap-2 text-3xl font-semibold text-slate-900 dark:text-white">
                          <span
                            ref={(element) => {
                              countersRef.current[index] = element;
                              if (prefersReducedMotion && element) {
                                element.textContent = formatStatValue(stat.value, stat.suffix);
                              }
                            }}
                          >
                            {prefersReducedMotion ? formatStatValue(stat.value, stat.suffix) : "0"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.45em] text-slate-500 dark:text-slate-300/80">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/40 px-3 py-1 text-[0.6rem] dark:bg-white/10">
                        {accent.emoji ?? "✨"} {accent.label}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-200/70">{stat.description}</p>
                    {index === 0 && (
                      <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/80 px-4 py-3 text-xs text-slate-600 transition-colors duration-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-200/70">
                        <Sparkles className="h-4 w-4 text-[#5EEAD4]" aria-hidden="true" />
                        {stats.upcomingEventsToday} agenda berlangsung hari ini ·{" "}
                        {stats.upcomingEventsThisWeek} agenda dalam satu pekan
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="activities"
          ref={activitiesRef}
          className="relative overflow-hidden bg-[#f2f5ff] py-20 transition-colors duration-500 sm:py-24 dark:bg-[#06081C]"
          aria-labelledby="activities-heading"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,99,255,0.08),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(108,99,255,0.08),transparent_65%)]" />
          <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl" data-reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#5EEAD4]/80">
                  Kegiatan Komunitas
                </span>
                <h2
                  id="activities-heading"
                  className="mt-5 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl"
                >
                  Agenda dan project yang membuat belajar semakin nyata
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-200/80">
                  Dari kelas mini, bootcamp, hingga showcase produk—semua dirancang untuk membangun
                  budaya eksplorasi dan kolaborasi.
                </p>
              </div>
              <Link
                href="/tutorial"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#5EEAD4] transition-colors hover:text-[#7cf1e2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4]"
              >
                Lihat roadmap lengkap
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {featuredActivities.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-200/70" data-reveal>
                  Belum ada kegiatan terbaru. Tim kami sedang menyiapkan agenda berikutnya.
                </p>
              ) : (
                featuredActivities.map((activity, index) => {
                  const accent = activityAccents[index % activityAccents.length];
                  const activityStyle = {
                    background: accent.surface,
                    borderColor: `${accent.primary}26`,
                    boxShadow: accent.glow,
                  } as CSSProperties;

                  return (
                    <article
                      key={activity.id}
                      data-reveal
                      className="activities-card relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/90 p-6 shadow-xl shadow-[#040410]/10 backdrop-blur-xl transition-transform duration-300 dark:border-white/10 dark:bg-white/5 dark:shadow-[#040410]/40"
                      style={activityStyle}
                      onPointerMove={prefersReducedMotion ? undefined : handleFeaturePointerMove}
                      onPointerLeave={prefersReducedMotion ? undefined : handleFeaturePointerLeave}
                      onPointerUp={prefersReducedMotion ? undefined : handleFeaturePointerLeave}
                    >
                      <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60" aria-hidden="true" />
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-200/70">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: accent.primary }} />
                          {activity.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-200/70">
                          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatDate(activity.date)}
                        </span>
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{activity.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-200/75">
                        {activity.description}
                      </p>
                      <dl className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-200/60">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" aria-hidden="true" style={{ color: accent.primary }} />
                          <dd>{activity.location}</dd>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" aria-hidden="true" style={{ color: accent.primary }} />
                          <dd>
                            {activity.participants}/{activity.capacity} peserta
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-auto flex items-center justify-between pt-6 text-xs text-[#5EEAD4]/80">
                        <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-200/70">
                          <span className="rounded-full bg-white/50 px-2 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.35em] dark:bg-white/10">
                            {accent.label}
                          </span>
                        </span>
                        <span className="text-slate-500 dark:text-slate-200/70">{activity.time}</span>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section
          id="announcements"
          ref={announcementsRef}
          className="relative overflow-hidden bg-[#f7f8ff] py-20 transition-colors duration-500 sm:py-24 dark:bg-[#050513]"
          aria-labelledby="announcements-heading"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(94,234,212,0.12),transparent_60%)] dark:bg-[radial-gradient(circle_at_bottom,_rgba(94,234,212,0.1),transparent_60%)]" />
          <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl" data-reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#5EEAD4]/80">
                  Pengumuman
                </span>
                <h2
                  id="announcements-heading"
                  className="mt-5 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl"
                >
                  Update terbaru dari tim GEMA SMA Wahidiyah
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-200/80">
                  Informasi kegiatan, prestasi siswa, dan highlight program dirangkum agar kamu tetap
                  terhubung dengan ekosistem komunitas.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#5EEAD4] transition-colors hover:text-[#7cf1e2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4]"
              >
                Kirim pertanyaan
                <Megaphone className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {latestAnnouncements.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-200/70" data-reveal>
                  Belum ada pengumuman baru. Pantau terus laman ini untuk informasi selanjutnya.
                </p>
              ) : (
                latestAnnouncements.map((announcement, index) => {
                  const accent = announcementAccentMap[announcement.type] ?? {
                    primary: "#6C63FF",
                    secondary: "#5EEAD4",
                    glow: "0 20px 45px rgba(108, 99, 255, 0.2)",
                    surface: "linear-gradient(165deg, rgba(255,255,255,0.94) 0%, rgba(241,244,ff,0.92) 100%)",
                    label: "Update",
                    emoji: "✨",
                  };

                  const announcementStyle = {
                    background: accent.surface,
                    borderColor: `${accent.primary}26`,
                    boxShadow: accent.glow,
                    "--announcement-glow": accent.glow,
                  } as CSSProperties;

                  return (
                    <article
                      key={announcement.id}
                      data-reveal
                      className="announcement-card relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-white/20 bg-white/90 p-6 shadow-xl shadow-[#040410]/10 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-white/5 dark:shadow-[#040410]/40"
                      style={announcementStyle}
                    >
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#5EEAD4]/80">
                        <span>
                          {accent.emoji} {announcement.type}
                        </span>
                        <time
                          dateTime={announcement.publishedAt}
                          className="text-[11px] text-slate-500 dark:text-slate-200/70"
                        >
                          {formatDate(announcement.publishedAt)}
                        </time>
                      </div>
                      <span data-label className="text-[#5EEAD4]/80">
                        {accent.label}
                      </span>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{announcement.title}</h3>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-200/75">
                        {announcement.content}
                      </p>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section
          id="gallery"
          ref={galleryRef}
          className="relative overflow-hidden bg-[#f3f4ff] py-20 transition-colors duration-500 sm:py-24 dark:bg-[#06081C]"
          aria-labelledby="gallery-heading"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,99,255,0.12),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(108,99,255,0.1),transparent_60%)]" />
          <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
            <div className="max-w-2xl" data-reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#5EEAD4]/80">
                Galeri Kegiatan
              </span>
              <h2
                id="gallery-heading"
                className="mt-5 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl"
              >
                Sekilas dokumentasi karya dan eksplorasi komunitas
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-200/80">
                Potret momen kolaborasi, sesi mentoring, hingga showcase proyek yang menggambarkan
                suasana belajar yang hidup.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {highlightedGallery.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-200/70" data-reveal>
                  Dokumentasi akan segera hadir setelah kegiatan terbaru berlangsung.
                </p>
              ) : (
                highlightedGallery.map((item, index) => {
                  const accent = galleryAccents[index % galleryAccents.length];
                  const galleryStyle = {
                    boxShadow: accent.glow,
                    borderColor: `${accent.primary}26`,
                    background: accent.surface,
                    "--gallery-primary": accent.primary,
                    "--gallery-secondary": accent.secondary,
                  } as CSSProperties;

                  return (
                    <article
                      key={item.id}
                      data-reveal
                      className="gallery-card group relative overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-xl shadow-[#040410]/10 backdrop-blur-xl transition-transform duration-300 dark:border-white/10 dark:bg-white/5 dark:shadow-[#040410]/40"
                      style={galleryStyle}
                    >
                      <div className="relative h-56 overflow-hidden">
                        <OptimizedImage
                          src={item.image}
                          alt={item.title}
                          width={600}
                          height={360}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="gallery-card-overlay absolute inset-0" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-200">
                              {item.category}
                            </p>
                            <h3 className="mt-2 text-lg font-semibold text-white dark:text-white">
                              {item.title}
                            </h3>
                          </div>
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/10 text-sm font-semibold text-white">
                            {(accent.label ?? " ").slice(0, 1)}
                          </span>
                        </div>
                      </div>
                      <p className="p-6 text-sm leading-relaxed text-slate-600 dark:text-slate-200/75">{item.description}</p>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section
          id="cta"
          className="relative overflow-hidden bg-gradient-to-br from-[#f7f8ff] via-[#eef7ff] to-[#e6fbff] py-20 transition-colors duration-500 sm:py-24 dark:from-[#050513] dark:via-[#06081C] dark:to-[#0b0f2b]"
          aria-labelledby="cta-heading"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(108,99,255,0.18),transparent_65%)] dark:bg-[radial-gradient(circle_at_bottom,_rgba(108,99,255,0.2),transparent_65%)]" />
          <div className="relative mx-auto max-w-5xl px-6 sm:px-10">
            <div
              data-reveal
              className="relative overflow-hidden rounded-4xl border border-white/30 bg-white/95 p-10 shadow-2xl shadow-[#040410]/15 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#6C63FF]/25 dark:via-[#06081C]/85 dark:to-[#5EEAD4]/25 dark:shadow-[#040410]/70 sm:p-12"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(108,99,255,0.22),transparent_65%)] opacity-70 dark:bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.24),transparent_60%)]"
              />
              <div className="relative flex flex-col items-start gap-6 text-slate-900 dark:text-white md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#5EEAD4]">
                    Ajukan Kolaborasi
                  </span>
                  <h2 id="cta-heading" className="mt-4 text-3xl font-semibold sm:text-4xl">
                    Siap membawa energi baru ke laboratorium inovasi GEMA?
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-100/80 sm:text-base">
                    Daftarkan dirimu, dapatkan modul eksklusif, dan nikmati suasana belajar yang
                    memadukan kreativitas, spiritualitas, dan teknologi.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-4 md:w-auto md:items-end">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white px-6 py-3 text-base font-semibold text-[#050513] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    aria-label="Mulai proses pendaftaran GEMA"
                  >
                    Hubungi Kami
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-100/70">
                    Terbuka untuk siswa SMA Wahidiyah dan kolaborator eksternal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
