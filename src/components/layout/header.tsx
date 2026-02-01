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
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/projects" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">takeout</span>
        </Link>

        <div className="flex items-center gap-2">
          {isProjectsPage && onNewProject && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewProject}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New project</span>
            </Button>
          )}
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
