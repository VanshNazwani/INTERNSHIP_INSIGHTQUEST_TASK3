'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut, ChevronDown, Menu, UserPlus } from 'lucide-react';
import { PreferencesDialog } from './preferences-dialog';
import { NotificationsPopover } from './notifications-popover';
import { AppSidebar } from './app-sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Project } from '@/lib/data';
import { NewProjectDialog } from './new-project-dialog';
import { AddMemberDialog } from './add-member-dialog';

export function AppHeader() {
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const { user, firestore, auth } = useFirebase();

  const projectsQuery = useMemoFirebase(() => 
    (firestore && user) ? collection(firestore, 'projects') : null, 
    [firestore, user]
  );
  const { data: projects } = useCollection<Project>(projectsQuery);

  const userInitials = user?.isAnonymous ? 'A' : user?.displayName?.split(' ').map(n => n[0]).join('') || user?.email?.charAt(0).toUpperCase() || '?';
  const userDisplayName = user?.isAnonymous ? 'Anonymous User' : user?.displayName || user?.email;

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  const handleCreateProject = async (name: string, description: string) => {
    if (firestore && user) {
      const projectsCol = collection(firestore, 'projects');
      await addDoc(projectsCol, {
        name,
        description,
        members: { [user.uid]: 'owner' }
      });
    }
    setIsNewProjectDialogOpen(false);
  };

  return (
    <>
      <header className="flex h-16 items-center border-b bg-card px-4 md:px-6 shrink-0">
         <div className="flex items-center gap-4">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 flex flex-col">
                   <AppSidebar projects={projects || []} onSelectProject={() => {}} selectedProjectId={''} onNewProject={() => setIsNewProjectDialogOpen(true)} isSheet={true} />
                </SheetContent>
            </Sheet>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 12C22 6.47715 17.5228 2 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="font-bold text-xl tracking-tight">NotifyHub</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {user && <NotificationsPopover currentUser={user} />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 -mr-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || undefined} alt={userDisplayName || ''} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{userDisplayName}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsPrefsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setAddMemberDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Add Members</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <PreferencesDialog isOpen={isPrefsOpen} onOpenChange={setIsPrefsOpen} />
      <NewProjectDialog
        isOpen={isNewProjectDialogOpen}
        onOpenChange={setIsNewProjectDialogOpen}
        onCreateProject={handleCreateProject}
      />
      <AddMemberDialog
        isOpen={isAddMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
      />
    </>
  );
}
