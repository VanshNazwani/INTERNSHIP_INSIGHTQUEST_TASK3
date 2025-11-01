'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  FirebaseError,
} from 'firebase/auth';

type AuthErrorCallback = (error: FirebaseError | null) => void;

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, callback?: AuthErrorCallback): void {
  signInAnonymously(authInstance)
    .catch((error: FirebaseError) => {
        if (callback) callback(error);
        else console.error("Anonymous sign-in error:", error);
    });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, callback?: AuthErrorCallback): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(() => {
        if(callback) callback(null);
    })
    .catch((error: FirebaseError) => {
        if (callback) callback(error);
        else console.error("Email sign-up error:", error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, callback?: AuthErrorCallback): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .then(() => {
        if(callback) callback(null);
    })
    .catch((error: FirebaseError) => {
        if (callback) callback(error);
        else console.error("Email sign-in error:", error);
    });
}
