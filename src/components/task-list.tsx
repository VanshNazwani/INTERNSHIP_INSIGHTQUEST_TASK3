'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Project, Task, TaskStatus, UserProfile } from '@/lib/data';
import { TaskCard } from './task-card';
import { PlusCircle } from 'lucide-react';
import { NewTaskDialog } from './new-task-dialog';
import { useCollection, useFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, serverTimestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

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

  const projectUsersQuery = useMemoFirebase(() => {
    if (!firestore || !project.members || Object.keys(project.members).length === 0) return null;
    const memberUIDs = Object.keys(project.members);
    return query(collection(firestore, 'users'), where('id', 'in', memberUIDs));
  }, [firestore, project.members]);

  const { data: projectMembers } = useCollection<UserProfile>(projectUsersQuery);
  
  const getTaskById = (taskId: string) => tasks?.find(t => t.id === taskId);

  const createNotification = (userId: string, message: string, referenceId: string, type: string) => {
    if (firestore) {
      const notificationsCol = collection(firestore, 'users', userId, 'notifications');
      addDocumentNonBlocking(notificationsCol, {
        userId,
        message,
        referenceId,
        type,
        timestamp: Date.now(),
        isRead: false,
      });
    }
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    if (firestore) {
      const taskRef = doc(firestore, 'projects', project.id, 'tasks', taskId);
      updateDocumentNonBlocking(taskRef, { status });

      const task = getTaskById(taskId);
      if (task) {
        // Notify the assigned user
        if (task.assignedToId) {
          createNotification(
            task.assignedToId,
            `Task "${task.name}" status changed to ${status}.`,
            taskId,
            'task_status_updated'
          );
        }

        // Notify project owners
        const ownerIds = Object.keys(project.members).filter(
          (id) => project.members[id] === 'owner'
        );

        for (const ownerId of ownerIds) {
          // Don't notify the owner if they are the one who was assigned the task (they got the other notification)
          if (ownerId !== task.assignedToId) {
            createNotification(
              ownerId,
              `Task "${task.name}" in project "${project.name}" was updated to ${status}.`,
              taskId,
              'task_status_updated'
            );
          }
        }
      }
    }
  };

  const handleAssign = (taskId: string, userId: string) => {
    if (firestore) {
      const taskRef = doc(firestore, 'projects', project.id, 'tasks', taskId);
      updateDocumentNonBlocking(taskRef, { assignedToId: userId });

      const task = getTaskById(taskId);
      if (task) {
         createNotification(
          userId,
          `You have been assigned to task "${task.name}".`,
          taskId,
          'task_assigned'
        );
      }
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
