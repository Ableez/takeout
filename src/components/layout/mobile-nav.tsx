"use client";

import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "#/lib/utils";

const navItems = [
  {
    href: "/projects",
    icon: FolderKanban,
    label: "Projects",
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-border/40 bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/80 md:hidden">
      <div 
        className="flex h-20 items-center justify-around px-4"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
      >
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl px-8 py-3",
                "active:scale-95 transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground active:bg-accent"
              )}
            >
              <item.icon className={cn(
                "h-6 w-6 transition-transform",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
