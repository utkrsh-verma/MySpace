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
  authError: string | null;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const isConfigured = isSupabaseConfigured();

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

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

    // 1. Inspect URL for OAuth error parameters returned from provider or gateway
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const urlError =
        searchParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error_description') ||
        hashParams.get('error');

      if (urlError) {
        const decoded = decodeURIComponent(urlError.replace(/\+/g, ' '));
        console.error('OAuth URL Error detected:', decoded);
        if (isMounted) {
          setAuthError(decoded);
          setLoading(false);
        }
        // Clean URL to prevent re-triggering error on reload
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
    }

    // Detect if we are returning from an OAuth redirect with authorization code or token
    const hasAuthCode =
      typeof window !== 'undefined' &&
      (window.location.search.includes('code=') || window.location.hash.includes('access_token='));

    let callbackTimer: ReturnType<typeof setTimeout> | null = null;

    // 2. Set up the single, authoritative Auth State listener first
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, currentSession) => {
      if (!isMounted) return;

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        setProfile(extractUserProfile(currentSession.user));
        setAuthError(null);

        // Remove auth code or access token from browser address bar cleanly
        if (
          typeof window !== 'undefined' &&
          (window.location.search.includes('code=') || window.location.hash.includes('access_token='))
        ) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (callbackTimer) {
          clearTimeout(callbackTimer);
          callbackTimer = null;
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        // If there are no incoming OAuth callback parameters to exchange,
        // we can safely finish the initial loading state.
        if (!hasAuthCode) {
          setLoading(false);
        }
        // If hasAuthCode is true, keep loading=true while the SDK exchanges the code!
      }
    });

    // 3. Check for existing cached session in storage
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
          setLoading(false);
        } else if (!hasAuthCode) {
          // If no session exists and no OAuth code is present in URL, finish loading.
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Session retrieval error:', err);
        if (!hasAuthCode) {
          setLoading(false);
        }
      });

    // 4. Safety timeout for OAuth callback in case code exchange fails or network drops
    if (hasAuthCode) {
      callbackTimer = setTimeout(() => {
        if (!isMounted) return;
        client.auth.getSession().then(({ data: { session: s } }) => {
          if (!isMounted) return;
          if (s?.user) {
            setSession(s);
            setUser(s.user);
            setProfile(extractUserProfile(s.user));
          } else {
            setAuthError('Authentication timed out. The authorization code may have expired.');
            if (typeof window !== 'undefined') {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
          setLoading(false);
        });
      }, 9000);
    }

    return () => {
      isMounted = false;
      if (callbackTimer) {
        clearTimeout(callbackTimer);
      }
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<{ error: Error | null }> => {
    setAuthError(null);
    return await authSignInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await authSignOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setAuthError(null);
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
        authError,
        signInWithGoogle,
        signOut,
        clearAuthError,
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
