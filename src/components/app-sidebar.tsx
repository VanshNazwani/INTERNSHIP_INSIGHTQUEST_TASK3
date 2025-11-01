'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, Dot, PlusCircle } from 'lucide-react';
import type { Project } from '@/lib/data';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

type AppSidebarProps = {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  selectedProjectId?: string;
  isSheet?: boolean;
  onNewProject: () => void;
};

export function AppSidebar({ projects, onSelectProject, selectedProjectId, onNewProject, isSheet = false }: AppSidebarProps) {
  const pathname = usePathname();
  
  const Component = isSheet ? 'div' : 'aside';

  const handleSelect = (id: string) => {
    if (isSheet && 'onClose' in onSelectProject) {
        // A bit of a hack to close sheet on mobile
        const closeButton = document.querySelector('button[aria-label="Close"]');
        if(closeButton) (closeButton as HTMLElement).click();
    }
    onSelectProject(id)
  }

  return (
    <Component className={cn("flex-col border-r bg-card", isSheet ? "w-full flex" : "w-64 hidden md:flex")}>
      <div className="flex h-16 items-center justify-between border-b px-4">
        <h2 className="font-semibold tracking-tight text-lg">Projects</h2>
        <Button size="sm" variant="ghost" onClick={onNewProject}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New
        </Button>
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
                  onClick={() => handleSelect(project.id)}
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="truncate">{project.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
    </Component>
  );
}
