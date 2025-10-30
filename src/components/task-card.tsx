'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { CheckCircle2, Circle, Loader2, MoreVertical, UserPlus, ChevronsRight } from 'lucide-react';
import type { Task, TaskStatus, User } from '@/lib/data';
import { users } from '@/lib/data';

type TaskCardProps = {
  task: Task;
  projectMembers: User[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onAssign: (taskId: string, userId: string) => void;
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  todo: <Circle className="h-4 w-4 text-muted-foreground" />,
  inprogress: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
  done: <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

const statusVariants: Record<TaskStatus, 'default' | 'secondary' | 'outline'> = {
    done: 'default',
    inprogress: 'secondary',
    todo: 'outline'
}

export function TaskCard({ task, projectMembers, onStatusChange, onAssign }: TaskCardProps) {
  const assignedUser = users.find((u) => u.id === task.assignedTo);
  const userInitials = assignedUser?.name.split(' ').map(n => n[0]).join('') || '?';

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1.5">
            <CardTitle className="text-base font-semibold leading-none tracking-tight">{task.title}</CardTitle>
            <Badge variant={statusVariants[task.status]} className="capitalize">{task.status}</Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <ChevronsRight className="mr-2 h-4 w-4" />
                    <span>Change Status</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => onStatusChange(task.id, 'todo')} disabled={task.status === 'todo'}>To Do</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(task.id, 'inprogress')} disabled={task.status === 'inprogress'}>In Progress</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(task.id, 'done')} disabled={task.status === 'done'}>Done</DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Assign to</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    {projectMembers.map(member => (
                        <DropdownMenuItem key={member.id} onClick={() => onAssign(task.id, member.id)} disabled={task.assignedTo === member.id}>
                            {member.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{task.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            {statusIcons[task.status]}
            <span className="text-xs text-muted-foreground capitalize">{task.status}</span>
        </div>
        {assignedUser ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{assignedUser.name}</span>
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignedUser.avatarUrl} alt={assignedUser.name} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </div>
        ) : (
            <span className="text-xs text-muted-foreground italic">Unassigned</span>
        )}
      </CardFooter>
    </Card>
  );
}
