'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, Dot } from 'lucide-react';
import type { Project } from '@/lib/data';
import { cn } from '@/lib/utils';

type AppSidebarProps = {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  selectedProjectId?: string;
};

export function AppSidebar({ projects, onSelectProject, selectedProjectId }: AppSidebarProps) {
  return (
    <aside className="w-64 flex-col border-r bg-card hidden md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="font-semibold tracking-tight text-lg">Projects</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-4">
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    selectedProjectId === project.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => onSelectProject(project.id)}
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="truncate">{project.name}</span>
                  {project.messages.length > 0 && <Dot className="ml-auto text-primary" />}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
    </aside>
  );
}
