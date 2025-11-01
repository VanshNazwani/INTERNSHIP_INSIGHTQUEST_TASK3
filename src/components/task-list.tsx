'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Project, Task, TaskStatus } from '@/lib/data';
import { TaskCard } from './task-card';
import { PlusCircle } from 'lucide-react';
import { NewTaskDialog } from './new-task-dialog';
import { useCollection, useFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

type UserProfile = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

type TaskListProps = {
  project: Project;
  currentUser: FirebaseUser;
};

export function TaskList({ project, currentUser }: TaskListProps) {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const { firestore } = useFirebase();

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'projects', project.id, 'tasks');
  }, [firestore, project.id]);

  const { data: tasks } = useCollection<Task>(tasksQuery);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !project.members || Object.keys(project.members).length === 0) return null;
    const memberUIDs = Object.keys(project.members);
    return query(collection(firestore, 'users'), where('id', 'in', memberUIDs));
  }, [firestore, project.members]);
  const { data: projectMembers } = useCollection<UserProfile>(usersQuery);

  const allUsersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: allUsers } = useCollection<UserProfile>(allUsersQuery);

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    if (firestore) {
      const taskRef = doc(firestore, 'projects', project.id, 'tasks', taskId);
      updateDocumentNonBlocking(taskRef, { status });
    }
  };

  const handleAssign = (taskId: string, userId: string) => {
    if (firestore) {
      const taskRef = doc(firestore, 'projects', project.id, 'tasks', taskId);
      updateDocumentNonBlocking(taskRef, { assignedToId: userId });
    }
  };

  const handleCreateTask = (title: string, description: string) => {
    if (firestore) {
      const tasksCol = collection(firestore, 'projects', project.id, 'tasks');
      addDocumentNonBlocking(tasksCol, {
        name: title,
        description,
        status: 'todo',
        projectId: project.id
      });
    }
    setIsNewTaskDialogOpen(false);
  };

  return (
    <>
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks for {project.name}</CardTitle>
        <Button size="sm" onClick={() => setIsNewTaskDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Task
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
            <div className="p-6 space-y-4">
                {tasks && tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            projectMembers={projectMembers || []}
                            allUsers={allUsers || []}
                            onStatusChange={handleStatusChange}
                            onAssign={handleAssign}
                        />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No tasks in this project yet.</p>
                        <p className="text-sm mt-2">Click "New Task" to add one.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
    <NewTaskDialog
        isOpen={isNewTaskDialogOpen}
        onOpenChange={setIsNewTaskDialogOpen}
        onCreateTask={handleCreateTask}
    />
    </>
  );
}
