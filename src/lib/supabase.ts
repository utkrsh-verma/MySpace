/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { UserProfile } from '../types';

/**
 * Sanitizes and normalizes the Supabase project URL.
 * Strips accidental subpaths (like /rest/v1 or /auth/v1) and trailing slashes.
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/auth\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
}

/**
 * Validates and retrieves Supabase credentials exclusively from environment variables.
 * Returns null if either VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing,
 * empty, or contains a placeholder string.
 */
export function getSupabaseCredentials(): { url: string; anonKey: string } | null {
  const envUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!envUrl || !envKey) {
    return null;
  }

  // Reject placeholder values
  if (
    envUrl.includes('your-project') ||
    envKey.includes('your-anon') ||
    envUrl.includes('MY_SUPABASE')
  ) {
    return null;
  }

  const cleanUrl = sanitizeSupabaseUrl(envUrl);

  // Validate URL structure
  try {
    const parsed = new URL(cleanUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }
  } catch {
    return null;
  }

  return { url: cleanUrl, anonKey: envKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseCredentials() !== null;
}

// Singleton Supabase Client
let clientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const creds = getSupabaseCredentials();
  if (!creds) {
    return null;
  }

  if (clientInstance) {
    return clientInstance;
  }

  try {
    // Initialize the single Supabase client with verified URL and anon key.
    // Explicitly enforce apikey in global headers so all requests carry the key.
    clientInstance = createClient(creds.url, creds.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      global: {
        headers: {
          apikey: creds.anonKey,
        },
      },
    });
    return clientInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Initiates official Supabase Google OAuth sign-in flow.
 * Uses window.location.origin as the callback destination.
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  const client = getSupabase();
  if (!client) {
    return {
      error: new Error(
        'Supabase configuration missing. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.'
      ),
    };
  }

  try {
    const redirectUrl = window.location.origin;

    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    if (data?.url) {
      window.location.href = data.url;
    }

    return { error: null };
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
