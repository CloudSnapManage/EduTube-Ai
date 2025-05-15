
"use client";

import type { User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  type AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Assumes firebase.ts is set up

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<User | null>;
  signup: (email: string, pass: string) => Promise<User | null>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      setError(null); // Clear error on auth state change
    }, (err) => {
      console.error("Auth state change error:", err);
      setError("Failed to subscribe to authentication changes.");
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const login = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (err) {
      const authError = err as AuthError;
      console.error("Login error:", authError);
      setError(authError.message || "Failed to login. Please check your credentials.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (err) {
      const authError = err as AuthError;
      console.error("Signup error:", authError);
      setError(authError.message || "Failed to create account. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
    } catch (err) {
      const authError = err as AuthError;
      console.error("Logout error:", authError);
      setError(authError.message || "Failed to logout.");
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
