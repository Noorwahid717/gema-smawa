"use client";

import { useEffect, useRef } from "react";

type VantaEffect = {
  destroy?: () => void;
};

interface VantaBackgroundProps {
  className?: string;
  theme: "light" | "dark";
}

const VantaBackground = ({ className, theme }: VantaBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const vantaEffectRef = useRef<VantaEffect | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !containerRef.current) {
      return;
    }

    let isCancelled = false;

    const initVanta = async () => {
      vantaEffectRef.current?.destroy?.();
      vantaEffectRef.current = null;

      const [{ default: NET }, THREE] = await Promise.all([
        import("vanta/dist/vanta.net.min"),
        import("three"),
      ]);

      if (!containerRef.current || isCancelled) {
        return;
      }

      const isDark = theme === "dark";

      vantaEffectRef.current = NET({
        el: containerRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: isDark ? 0x7f86ff : 0x5a4bff,
        backgroundColor: isDark ? 0x050513 : 0xf4f7ff,
        points: isDark ? 12.0 : 10.0,
        maxDistance: isDark ? 20.0 : 18.0,
        spacing: isDark ? 18.0 : 16.0,
        showDots: true,
      });
    };

    initVanta().catch(() => null);

    return () => {
      isCancelled = true;
      vantaEffectRef.current?.destroy?.();
      vantaEffectRef.current = null;
    };
  }, [theme]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
};

export default VantaBackground;
