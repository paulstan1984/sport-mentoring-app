"use client";

import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Plain CSS animation (see .page-transition in globals.css) so the fade-in
  // is applied by the browser before first paint of the new route, instead
  // of a JS-driven animation that can lag behind and flash the page fully
  // visible before animating.
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
