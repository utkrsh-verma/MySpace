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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    let isMounted = true;
    const client = getSupabase();

    if (!client) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    // 1. Initial session restoration
    client.auth
      .getSession()
      .then(({ data: { session: currentSession }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.error('Supabase getSession error:', error.message);
        }
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          setProfile(extractUserProfile(currentSession.user));
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to restore Supabase session:', err);
        setLoading(false);
      });

    // 2. Auth state subscription (handles SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        setProfile(extractUserProfile(currentSession.user));
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<{ error: Error | null }> => {
    return await authSignInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await authSignOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
  }, []);

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
