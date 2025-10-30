'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/hooks/use-socket';
import type { Project, Task, TaskStatus, User } from '@/lib/data';
import { users } from '@/lib/data';
import { TaskCard } from './task-card';
import { PlusCircle } from 'lucide-react';
import { NewTaskDialog } from './new-task-dialog';

type TaskListProps = {
  project: Project;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  currentUser: User;
};

export function TaskList({ project, setProjects, currentUser }: TaskListProps) {
  const { socket } = useSocket();
  const [tasks, setTasks] = useState<Task[]>(project.tasks);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);

  const projectMembers = users.filter(user => project.members.includes(user.id));

  useEffect(() => {
    setTasks(project.tasks);
  }, [project.id, project.tasks]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinProject', project.id);

    const handleTaskUpdate = (data: { projectId: string; task: Task }) => {
      if (data.projectId === project.id) {
        setTasks(prevTasks =>
          prevTasks.map(t => (t.id === data.task.id ? data.task : t))
        );
        setProjects(prevProjects => prevProjects.map(p => {
          if (p.id === data.projectId) {
            return { ...p, tasks: p.tasks.map(t => t.id === data.task.id ? data.task : t) };
          }
          return p;
        }))
      }
    };
    
    const handleNewTask = (data: { projectId: string; task: Task }) => {
        if (data.projectId === project.id) {
            setTasks(prevTasks => [...prevTasks, data.task]);
            setProjects(prevProjects => prevProjects.map(p => {
                if (p.id === data.projectId) {
                    return { ...p, tasks: [...p.tasks, data.task] };
                }
                return p;
            }));
        }
    };

    socket.on('taskUpdated', handleTaskUpdate);
    socket.on('taskCreated', handleNewTask);

    return () => {
      socket.off('taskUpdated', handleTaskUpdate);
      socket.off('taskCreated', handleNewTask);
    };
  }, [socket, project.id, setProjects]);

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    socket?.emit('updateTaskStatus', { projectId: project.id, taskId, status, updatedByUserId: currentUser.id });
  };

  const handleAssign = (taskId: string, userId: string) => {
    socket?.emit('assignTask', { projectId: project.id, taskId, userId, assignedByUserId: currentUser.id });
  };

  const handleCreateTask = (title: string, description: string) => {
    if (socket) {
      socket.emit('createTask', { projectId: project.id, title, description, createdByUserId: currentUser.id });
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
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            projectMembers={projectMembers}
                            onStatusChange={handleStatusChange}
                            onAssign={handleAssign}
                        />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No tasks in this project yet.</p>
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
