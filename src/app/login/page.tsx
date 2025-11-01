'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebase, initiateEmailSignIn } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FirebaseError } from 'firebase/app';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { auth, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = () => {
    if (auth) {
      setError(null);
      initiateEmailSignIn(auth, email, password, (err) => {
        if (err) {
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                setError('Invalid email or password. Please try again.');
            } else {
                setError(err.message);
            }
        }
      });
    }
  };
  
  if (isUserLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div>Loading...</div>
        </div>
    );
  }
  
  if (user) {
    const from = searchParams.get('from');
    router.replace(from || '/');
    return null;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
