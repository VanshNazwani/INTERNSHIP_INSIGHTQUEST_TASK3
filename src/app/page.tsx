'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { TaskList } from '@/components/task-list';
import { ProjectChat } from '@/components/project-chat';
import type { Project } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase, initiateAnonymousSignIn } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

export default function NotifyHubDashboard() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const { firestore, user, isUserLoading, auth } = useFirebase();

  const projectsQuery = useMemoFirebase(() => 
    (firestore && user) ? collection(firestore, 'projects') : null,
    [firestore, user]
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
  
  const handleLogin = () => {
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  }

  if (isUserLoading || (user && projectsLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Card className="w-full max-w-sm">
                <CardContent className="flex flex-col items-center justify-center p-10">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mb-4">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 12C22 6.47715 17.5228 2 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h2 className="text-2xl font-bold">Welcome to NotifyHub</h2>
                    <p className="text-muted-foreground mt-2 mb-6 text-center">
                        Sign in to collaborate with your team.
                    </p>
                    <Button onClick={handleLogin} className="w-full">
                        Sign In Anonymously
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
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
            {selectedProject && user ? (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <div className="xl:col-span-2 flex flex-col h-full">
                   <TaskList project={selectedProject} currentUser={user} />
                </div>
                <div className="flex flex-col">
                  <ProjectChat project={selectedProject} currentUser={user} />
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
