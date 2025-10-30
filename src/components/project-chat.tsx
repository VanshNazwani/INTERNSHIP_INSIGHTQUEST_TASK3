'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/componentsui/scroll-area';
import { Send } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import { cn } from '@/lib/utils';
import type { Project, Message, User } from '@/lib/data';
import { users } from '@/lib/data';

type ProjectChatProps = {
  project: Project;
  currentUser: User;
};

export function ProjectChat({ project, currentUser }: ProjectChatProps) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>(project.messages);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(project.messages);
  }, [project.id, project.messages]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinProject', project.id);

    const handleNewMessage = (data: { projectId: string; message: Message }) => {
      if (data.projectId === project.id) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, project.id]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      const message: Message = {
        id: `msg-${Date.now()}`,
        userId: currentUser.id,
        text: newMessage,
        timestamp: Date.now(),
      };
      socket.emit('sendMessage', { projectId: project.id, message });
      setNewMessage('');
    }
  };

  const getUserById = (userId: string) => users.find((u) => u.id === userId);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Project Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-4">
            {messages.map((message) => {
              const user = getUserById(message.userId);
              const isCurrentUser = message.userId === currentUser.id;
              const userInitials = user ? user.name.split(' ').map(n => n[0]).join('') : '?';
              
              return (
                <div key={message.id} className={cn("flex items-start gap-3", isCurrentUser && "justify-end")}>
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-xs rounded-lg p-3 text-sm", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    {!isCurrentUser && <p className="font-semibold text-xs mb-1">{user?.name}</p>}
                    <p>{message.text}</p>
                  </div>
                   {isCurrentUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-6">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
