'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project, Message } from '@/lib/data';
import { useCollection, useFirebase, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, where } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

type ProjectChatProps = {
  project: Project;
  currentUser: FirebaseUser;
};

export function ProjectChat({ project, currentUser }: ProjectChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { firestore } = useFirebase();

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'projects', project.id, 'chat_messages'), orderBy('timestamp', 'asc'));
  }, [firestore, project.id]);

  const { data: messages } = useCollection<Message>(messagesQuery);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !project.members || Object.keys(project.members).length === 0) return null;
    const memberUIDs = Object.keys(project.members);
    return query(collection(firestore, 'users'), where('id', 'in', memberUIDs));
  }, [firestore, project.members]);

  const { data: users } = useCollection<any>(usersQuery);

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
    if (newMessage.trim() && firestore) {
      const messagesCol = collection(firestore, 'projects', project.id, 'chat_messages');
      addDocumentNonBlocking(messagesCol, {
        userId: currentUser.uid,
        content: newMessage,
        timestamp: serverTimestamp(),
        projectId: project.id,
      });
      setNewMessage('');
    }
  };

  const getUserById = (userId: string) => users?.find((u: any) => u.id === userId);

  return (
    <Card className="flex flex-col max-h-[calc(100vh-10rem)] h-full">
      <CardHeader>
        <CardTitle>Project Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-4">
            {messages && messages.map((message) => {
              const user = getUserById(message.userId);
              const isCurrentUser = message.userId === currentUser.uid;
              const userInitials = user ? user.username?.split(' ').map(n => n[0]).join('') : '?';
              
              return (
                <div key={message.id} className={cn("flex items-start gap-3", isCurrentUser && "justify-end")}>
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-xs rounded-lg p-3 text-sm", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    {!isCurrentUser && user && <p className="font-semibold text-xs mb-1">{user?.username}</p>}
                    <p>{message.content}</p>
                  </div>
                   {isCurrentUser && (
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={currentUser.photoURL || undefined} />
                       <AvatarFallback>{currentUser.isAnonymous ? 'A' : currentUser.displayName?.charAt(0) || '?'}</AvatarFallback>
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
