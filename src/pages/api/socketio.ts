import { Server as NetServer } from 'http';
import type { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import type { NextApiResponseServerIO } from '@/types';
import { addMessageToProject, assignTaskToUser, updateTaskStatus, users, addNotification as addNotificationToDb, projects } from '@/lib/data';

export const config = {
  api: {
    bodyParser: false,
  },
};

const socketio = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('Starting Socket.IO server...');
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('A client connected:', socket.id);

      socket.on('joinProject', (projectId) => {
        socket.join(projectId);
        console.log(`Socket ${socket.id} joined room ${projectId}`);
      });

      socket.on('sendMessage', (data) => {
        const { projectId, message } = data;
        const user = users.find(u => u.id === message.userId);
        addMessageToProject(projectId, message);
        io.to(projectId).emit('newMessage', { projectId, message });

        const project = projects.find(p => p.id === projectId);
        if(project && user) {
           project.members.forEach(memberId => {
              const member = users.find(u => u.id === memberId);
              if (member && member.id !== user.id) {
                const notif = { id: `notif-${Date.now()}`, text: `New message in ${project.name} from ${user.name}`, timestamp: Date.now(), read: false };
                addNotificationToDb(notif);
                io.to(member.id).emit('notification', notif);
              }
           })
        }
      });

      socket.on('updateTaskStatus', (data) => {
        const { projectId, taskId, status, updatedByUserId } = data;
        const updatedTask = updateTaskStatus(projectId, taskId, status);
        const project = projects.find(p => p.id === projectId);
        const updatedByUser = users.find(u => u.id === updatedByUserId);
        
        if (updatedTask && project && updatedByUser) {
          io.to(projectId).emit('taskUpdated', { projectId, task: updatedTask });
          
          const managers = users.filter(u => u.role === 'manager' && project.members.includes(u.id));
          managers.forEach(manager => {
            if (manager.id !== updatedByUserId) {
                const notif = { id: `notif-${Date.now()}`, text: `Task "${updatedTask.title}" in ${project.name} was updated to "${status}" by ${updatedByUser.name}.`, timestamp: Date.now(), read: false };
                addNotificationToDb(notif);
                io.to(manager.id).emit('notification', notif);
            }
          });
        }
      });

      socket.on('assignTask', (data) => {
        const { projectId, taskId, userId, assignedByUserId } = data;
        const updatedTask = assignTaskToUser(projectId, taskId, userId);
        const project = projects.find(p => p.id === projectId);
        const assignedUser = users.find(u => u.id === userId);
        const assignedByUser = users.find(u => u.id === assignedByUserId);

        if (updatedTask && project && assignedUser && assignedByUser) {
          io.to(projectId).emit('taskUpdated', { projectId, task: updatedTask });

          if (assignedUser.id !== assignedByUser.id) {
            const notif = { id: `notif-${Date.now()}`, text: `${assignedByUser.name} assigned you a new task: "${updatedTask.title}" in ${project.name}`, timestamp: Date.now(), read: false };
            addNotificationToDb(notif);
            io.to(assignedUser.id).emit('notification', notif);
          }
        }
      });

      socket.on('joinUserChannel', (userId) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined user channel ${userId}`);
      });

      socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default socketio;
