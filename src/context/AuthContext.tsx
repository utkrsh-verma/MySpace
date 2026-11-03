/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  getSupabase,
  isSupabaseConfigured,
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
  extractUserProfile,
} from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  reloadConfig: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(isSupabaseConfigured());

  const initAuth = useCallback(async () => {
    setLoading(true);
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    if (!configured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const client = getSupabase();
    if (!client) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data: { session: initialSession }, error } = await client.auth.getSession();
      if (error) {
        console.warn('Supabase getSession error:', error.message);
      }
      if (initialSession?.user) {
        setSession(initialSession);
        setUser(initialSession.user);
        setProfile(extractUserProfile(initialSession.user));
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error checking auth state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();

    const client = getSupabase();
    if (!client) return;

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      setProfile(extractUserProfile(currentUser));
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initAuth]);

  const signInWithGoogle = async () => {
    setLoading(true);
    const res = await authSignInWithGoogle();
    if (res.error) {
      setLoading(false);
    }
    return res;
  };

  const signOut = async () => {
    setLoading(true);
    await authSignOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
  };

  const reloadConfig = () => {
    initAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured,
        signInWithGoogle,
        signOut,
        reloadConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
