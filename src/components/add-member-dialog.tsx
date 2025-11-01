'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebase, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import type { Project } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type AddMemberDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function AddMemberDialog({ isOpen, onOpenChange }: AddMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { firestore, user } = useFirebase();

  const projectsQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'projects'), where(`members.${user.uid}`, '==', 'owner')) : null),
    [firestore, user]
  );
  const { data: projects } = useCollection<Project>(projectsQuery);

  const handleAddMember = async () => {
    setError('');
    setSuccess('');
    if (!email || !selectedProjectId || !firestore) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      // Find user by email
      const usersRef = collection(firestore, 'users');
      const userQuery = query(usersRef, where('email', '==', email));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setError('User with this email does not exist.');
        return;
      }

      const userToAdd = userSnapshot.docs[0];
      const userId = userToAdd.id;
      const projectRef = doc(firestore, 'projects', selectedProjectId);

      // Add user to project members
      updateDocumentNonBlocking(projectRef, {
        [`members.${userId}`]: 'member',
      });

      setSuccess(`Successfully added ${email} to the project.`);
      setEmail('');
      setSelectedProjectId('');
      setTimeout(() => onOpenChange(false), 2000);

    } catch (e) {
      console.error(e);
      setError('Failed to add member.');
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setEmail('');
        setSelectedProjectId('');
        setError('');
        setSuccess('');
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Member to Project</DialogTitle>
          <DialogDescription>
            Enter the email of the user you want to add to a project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              Project
            </Label>
            <Select onValueChange={setSelectedProjectId} value={selectedProjectId}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                    {projects?.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="user@example.com"
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleAddMember} disabled={!email.trim() || !selectedProjectId}>Add Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    