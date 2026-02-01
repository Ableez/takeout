"use client";

import { UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "#/components/ui/button";

interface HeaderProps {
  onNewProject?: () => void;
}

export function Header({ onNewProject }: HeaderProps) {
  const pathname = usePathname();
  const isProjectsPage = pathname === "/projects";

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border/40 bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/80">
      <div className="flex h-16 items-center justify-between px-5 sm:px-6">
        <Link 
          href="/projects" 
          className="group flex items-center gap-2.5 active:opacity-70 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <span className="text-lg font-bold">T</span>
          </div>
          <span className="text-lg font-bold tracking-tight">takeout</span>
        </Link>

        <div className="flex items-center gap-3">
          {isProjectsPage && onNewProject && (
            <Button
              size="default"
              onClick={onNewProject}
              className="gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Project</span>
            </Button>
          )}
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 rounded-xl",
                userButtonPopoverCard: "shadow-xl border-2 border-border rounded-2xl",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
