'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSocket } from '@/hooks/use-socket';
import { notifications as initialNotifications, type Notification, type User } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';

export function NotificationsPopover({ currentUser }: {currentUser: User}) {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!socket) return;
    
    socket.emit('joinUserChannel', currentUser.id);

    const handleNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, currentUser.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Mark all as read when closing
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4">
          <h4 className="font-medium leading-none">Notifications</h4>
        </div>
        <Separator />
        <ScrollArea className="h-96">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-secondary/50">
                <p className="text-sm">{notification.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </p>
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center p-4">
              <p className="text-sm text-muted-foreground">No new notifications</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
