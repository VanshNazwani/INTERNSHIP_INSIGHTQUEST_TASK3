'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { TaskList } from '@/components/task-list';
import { ProjectChat } from '@/components/project-chat';
import { SocketProvider } from '@/context/socket-provider';
import type { Project } from '@/lib/data';
import { projects as initialProjects, users as allUsers } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function NotifyHubDashboard() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  useEffect(() => {
    // On initial load, select the first project
    if (initialProjects.length > 0) {
      setSelectedProject(initialProjects[0]);
    }
  }, []);

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    setSelectedProject(project || null);
  };
  
  const currentUser = allUsers[0]; // Assuming the current user is the first user for demo purposes

  return (
    <SocketProvider>
      <div className="flex h-screen bg-background text-foreground">
        <AppSidebar
          projects={projects}
          onSelectProject={handleProjectSelect}
          selectedProjectId={selectedProject?.id}
        />
        <div className="flex flex-1 flex-col">
          <AppHeader currentUser={currentUser} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {selectedProject ? (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
                <div className="xl:col-span-2 flex flex-col h-full">
                   <TaskList project={selectedProject} setProjects={setProjects} currentUser={currentUser} />
                </div>
                <div className="flex flex-col h-full">
                  <ProjectChat project={selectedProject} currentUser={currentUser} />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Card className="w-full max-w-md text-center">
                  <CardContent className="p-10">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-2xl font-semibold">Welcome to NotifyHub</h2>
                    <p className="mt-2 text-muted-foreground">
                      Select a project from the sidebar to view tasks and start communicating with your team.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </SocketProvider>
  );
}
