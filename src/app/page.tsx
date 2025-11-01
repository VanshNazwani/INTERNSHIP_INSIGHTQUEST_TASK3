'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { TaskList } from '@/components/task-list';
import { ProjectChat } from '@/components/project-chat';
import type { Project } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Loader2, FolderPlus } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { NewProjectDialog } from '@/components/new-project-dialog';
import { useRouter } from 'next/navigation';

export default function NotifyHubDashboard() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  
  const { firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();

  const projectsQuery = useMemoFirebase(() => 
    (firestore && user) ? collection(firestore, 'projects') : null,
    [firestore, user]
  );
  const { data: projects, isLoading: projectsLoading } = useCollection<Project>(projectsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);
  
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    } else if (projects && projects.length === 0) {
      setSelectedProject(null);
    }
  }, [projects, selectedProject]);

  const handleProjectSelect = (projectId: string) => {
    const project = projects?.find((p) => p.id === projectId);
    setSelectedProject(project || null);
  };

  const handleCreateProject = (name: string, description: string) => {
    if (firestore && user) {
      const projectsCol = collection(firestore, 'projects');
      addDocumentNonBlocking(projectsCol, {
        name,
        description,
        members: { [user.uid]: 'owner' }
      });
    }
    setIsNewProjectDialogOpen(false);
  };


  if (isUserLoading || !user || projectsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <>
      <div className="flex h-screen bg-background text-foreground">
        <AppSidebar
          projects={projects || []}
          onSelectProject={handleProjectSelect}
          selectedProjectId={selectedProject?.id}
          onNewProject={() => setIsNewProjectDialogOpen(true)}
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
                    { projects && projects.length > 0 ? (
                        <>
                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="mt-4 text-2xl font-semibold">Welcome to NotifyHub</h2>
                        <p className="mt-2 text-muted-foreground">
                          Select a project from the sidebar to view tasks and start communicating with your team.
                        </p>
                       </>
                    ) : (
                        <>
                        <FolderPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="mt-4 text-2xl font-semibold">No Projects Yet</h2>
                        <p className="mt-2 text-muted-foreground">
                          Get started by creating your first project.
                        </p>
                        <Button onClick={() => setIsNewProjectDialogOpen(true)} className="mt-6">
                            Create a Project
                        </Button>
                        </>
                    )
                    }
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
      <NewProjectDialog
        isOpen={isNewProjectDialogOpen}
        onOpenChange={setIsNewProjectDialogOpen}
        onCreateProject={handleCreateProject}
      />
      </>
  );
}
