import type { Timestamp } from 'firebase/firestore';
import { PlaceHolderImages } from "./placeholder-images";

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'manager' | 'member';
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
