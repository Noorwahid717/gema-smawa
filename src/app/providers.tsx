"use client";

import type { ReactNode } from "react";
import { AppSessionProvider } from "@/components/providers/AppSessionProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import PageTransition from "@/components/ui/PageTransition";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AppSessionProvider>
        <PageTransition>{children}</PageTransition>
      </AppSessionProvider>
    </ThemeProvider>
  );
}
