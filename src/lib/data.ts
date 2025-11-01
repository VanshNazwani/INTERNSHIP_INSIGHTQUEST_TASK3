import type { Timestamp } from 'firebase/firestore';

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
};

export type TaskStatus = 'todo' | 'inprogress' | 'done';

export type Task = {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  assignedToId?: string;
  projectId: string;
};

export type Message = {
  id: string;
  userId: string;
  content: string;
  timestamp: Timestamp;
  projectId: string;
};

export type Project = {
  id:string;
  name: string;
  description: string;
  members: { [key: string]: 'owner' | 'member' };
};

export type Notification = {
  id: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  userId: string;
  type: string;
  referenceId?: string;
};
