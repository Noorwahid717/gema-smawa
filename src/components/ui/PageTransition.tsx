"use client";

import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

export function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="page-transition-container">
      <div key={pathname} className="page-transition-content">
        {children}
      </div>
    </div>
  );
}

export default PageTransition;
