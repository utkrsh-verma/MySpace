/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const STORAGE_KEY_URL = 'myspace_supabase_url';
const STORAGE_KEY_KEY = 'myspace_supabase_anon_key';

export function getSupabaseCredentials(): { url: string; anonKey: string } | null {
  // Check env vars first
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (
    envUrl &&
    envKey &&
    !envUrl.includes('your-project') &&
    !envKey.includes('your-anon')
  ) {
    return { url: envUrl.trim(), anonKey: envKey.trim() };
  }

  // Check localStorage fallback for dynamic developer configuration
  try {
    const localUrl = localStorage.getItem(STORAGE_KEY_URL);
    const localKey = localStorage.getItem(STORAGE_KEY_KEY);
    if (localUrl && localKey) {
      return { url: localUrl.trim(), anonKey: localKey.trim() };
    }
  } catch {
    // ignore
  }

  return null;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseCredentials() !== null;
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  } catch {
    // ignore
  }
}

export function clearSupabaseCredentials(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  } catch {
    // ignore
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUrl: string | null = null;
let lastKey: string | null = null;

export function getSupabase(): SupabaseClient | null {
  const creds = getSupabaseCredentials();
  if (!creds) {
    return null;
  }

  if (cachedClient && lastUrl === creds.url && lastKey === creds.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(creds.url, creds.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'myspace_auth_token',
      },
    });
    lastUrl = creds.url;
    lastKey = creds.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Initiates Supabase Google OAuth sign-in flow.
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  const client = getSupabase();
  if (!client) {
    return { error: new Error('Supabase is not configured. Please enter your project URL and Anon key.') };
  }

  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error('Failed to sign in with Google') };
  }
}

/**
 * Signs out the current user session from Supabase.
 */
export async function signOut(): Promise<{ error: Error | null }> {
  const client = getSupabase();
  if (!client) {
    return { error: null };
  }

  try {
    const { error } = await client.auth.signOut();
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error('Failed to sign out') };
  }
}

/**
 * Extracts normalized user profile information from Supabase User.
 */
export function extractUserProfile(user: User | null): UserProfile | null {
  if (!user) return null;

  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || metadata.email || null,
    full_name: metadata.full_name || metadata.name || user.email?.split('@')[0] || 'MySpace User',
    avatar_url: metadata.avatar_url || metadata.picture || null,
  };
}
