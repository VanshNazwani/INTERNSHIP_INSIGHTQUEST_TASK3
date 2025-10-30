export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'manager' | 'member';
};

export type TaskStatus = 'todo' | 'inprogress' | 'done';

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo?: string;
};

export type Message = {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
};

export type Project = {
  id: string;
  name: string;
  members: string[];
  tasks: Task[];
  messages: Message[];
};

export type Notification = {
  id: string;
  text: string;
  timestamp: number;
  read: boolean;
};

export const users: User[] = [
  { id: 'user-1', name: 'Vansh Nazwani', avatarUrl: 'https://picsum.photos/seed/101/40/40', role: 'manager' },
  { id: 'user-2', name: 'Rohan Sharma', avatarUrl: 'https://picsum.photos/seed/102/40/40', role: 'member' },
  { id: 'user-3', name: 'Anjali Singh', avatarUrl: 'https://picsum.photos/seed/103/40/40', role: 'member' },
  { id: 'user-4', name: 'Vikram Kumar', avatarUrl: 'https://picsum.photos/seed/104/40/40', role: 'manager' },
];

export let projects: Project[] = [
  {
    id: 'project-1',
    name: 'E-commerce Platform',
    members: ['user-1', 'user-2'],
    tasks: [
      { id: 'task-1-1', title: 'Setup project structure', description: "Initialize repository and basic folder structure.", status: 'done', assignedTo: 'user-2' },
      { id: 'task-1-2', title: 'Design user authentication', description: "Create UX/UI mockups for login and registration pages.", status: 'inprogress', assignedTo: 'user-2' },
      { id: 'task-1-3', title: 'Develop homepage UI', description: "Implement the main landing page based on the design.", status: 'todo', assignedTo: 'user-1' },
    ],
    messages: [
      { id: 'msg-1', userId: 'user-1', text: 'Hey team, let\'s kick off the new e-commerce project!', timestamp: Date.now() - 200000 },
      { id: 'msg-2', userId: 'user-2', text: 'Sounds great! I\'ve pushed the initial project structure.', timestamp: Date.now() - 100000 },
    ],
  },
  {
    id: 'project-2',
    name: 'Mobile App Launch',
    members: ['user-3', 'user-4'],
    tasks: [
      { id: 'task-2-1', title: 'Plan marketing campaign', description: "Define strategy for social media and press releases.", status: 'inprogress', assignedTo: 'user-3' },
      { id: 'task-2-2', title: 'Finalize App Store assets', description: "Create screenshots and promotional videos.", status: 'todo', assignedTo: 'user-4' },
    ],
    messages: [],
  },
  {
    id: 'project-3',
    name: 'Internal Wiki',
    members: ['user-1', 'user-3'],
    tasks: [
        { id: 'task-3-1', title: 'Gather documentation', description: "Collect all existing SOPs and guides.", status: 'done', assignedTo: 'user-3' },
        { id: 'task-3-2', title: 'Choose a Wiki platform', description: "Research and decide on the best platform to use.", status: 'inprogress', assignedTo: 'user-1' },
    ],
    messages: [
        { id: 'msg-3', userId: 'user-1', text: 'Anjali, can you start gathering the existing docs?', timestamp: Date.now() - 500000 },
    ],
  }
];

export let notifications: Notification[] = [
    {id: 'notif-1', text: "Welcome to NotifyHub!", timestamp: Date.now() - 100000, read: true}
];

// Helper functions to manipulate in-memory data
export const addMessageToProject = (projectId: string, message: Message) => {
  const project = projects.find(p => p.id === projectId);
  if (project) {
    project.messages.push(message);
  }
};

export const createTaskInProject = (projectId: string, task: Task) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        project.tasks.push(task);
        return task;
    }
    return null;
}

export const updateTaskStatus = (projectId: string, taskId: string, status: TaskStatus) => {
    const project = projects.find(p => p.id === projectId);
    const task = project?.tasks.find(t => t.id === taskId);
    if (task) {
        task.status = status;
        return task;
    }
    return null;
}

export const assignTaskToUser = (projectId: string, taskId: string, userId: string) => {
    const project = projects.find(p => p.id === projectId);
    const task = project?.tasks.find(t => t.id === taskId);
    if (task) {
        task.assignedTo = userId;
        return task;
    }
    return null;
}

export const addNotification = (notification: Notification) => {
    notifications.unshift(notification);
}
