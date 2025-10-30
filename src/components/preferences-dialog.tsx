'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type PreferencesDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function PreferencesDialog({ isOpen, onOpenChange }: PreferencesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>
            Manage how you receive notifications. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="in-app-notifications" className="text-base">
                In-App Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive real-time updates inside the app.
              </p>
            </div>
            <Switch id="in-app-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-base">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified about important updates via email.
              </p>
            </div>
            <Switch id="email-notifications" />
          </div>
           <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="sound-notifications" className="text-base">
                Sound Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Play a sound for new notifications.
              </p>
            </div>
            <Switch id="sound-notifications" defaultChecked />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
