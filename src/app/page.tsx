'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { TaskList } from '@/components/task-list';
import { ProjectChat } from '@/components/project-chat';
import type { Project } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function NotifyHubDashboard() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const { firestore, user } = useFirebase();

  const projectsQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'projects') : null,
    [firestore]
  );
  const { data: projects, isLoading: projectsLoading } = useCollection<Project>(projectsQuery);

  useEffect(() => {
    // On initial load, select the first project
    if (projects && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  const handleProjectSelect = (projectId: string) => {
    const project = projects?.find((p) => p.id === projectId);
    setSelectedProject(project || null);
  };
  
  const currentUser = user;

  if (projectsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }


  return (
      <div className="flex h-screen bg-background text-foreground">
        <AppSidebar
          projects={projects || []}
          onSelectProject={handleProjectSelect}
          selectedProjectId={selectedProject?.id}
        />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {selectedProject && currentUser ? (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <div className="xl:col-span-2 flex flex-col h-full">
                   <TaskList project={selectedProject} currentUser={currentUser} />
                </div>
                <div className="flex flex-col">
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
  );
}
