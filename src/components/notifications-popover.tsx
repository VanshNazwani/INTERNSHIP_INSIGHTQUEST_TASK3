'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { type Notification } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { useCollection, useFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export function NotificationsPopover({ currentUser }: {currentUser: User}) {
  const [isOpen, setIsOpen] = useState(false);
  const { firestore } = useFirebase();

  const notificationsQuery = firestore ? query(collection(firestore, 'users', currentUser.uid, 'notifications'), orderBy('timestamp', 'desc')) : null;
  const { data: notifications } = useCollection<Notification>(notificationsQuery);

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (!open && firestore && notifications) {
      // Mark all as read when closing
      const unreadNotifications = notifications.filter(n => !n.isRead);
      for (const notification of unreadNotifications) {
        const notifRef = doc(firestore, 'users', currentUser.uid, 'notifications', notification.id);
        await updateDoc(notifRef, { isRead: true });
      }
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
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-secondary/50">
                <p className="text-sm">{notification.message}</p>
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
