/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { signInWithGoogle, isConfigured, authError, clearAuthError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayError = errorMessage || authError;

  const handleContinueWithGoogle = async () => {
    setErrorMessage(null);
    clearAuthError();

    if (!isConfigured) {
      setErrorMessage(
        'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
      );
      return;
    }

    setIsSigningIn(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMessage(error.message);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-canvas relative overflow-hidden select-none">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 45% at 50% 100%, rgba(99,102,241,0.12), transparent 70%), radial-gradient(50% 40% at 50% 0%, rgba(139,92,246,0.08), transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-md rounded-3xl bg-s1 border border-line px-6 py-10 sm:px-12 sm:py-14 flex flex-col items-center text-center shadow-glow">
        <h1 className="font-display text-4xl sm:text-5xl text-ink tracking-tight">MySpace</h1>
        <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber" />
          Your quiet corner
        </p>

        <h2 className="mt-10 text-xl font-semibold text-ink">Welcome to MySpace</h2>
        <p className="mt-2 text-sm text-ink2 leading-relaxed max-w-xs">
          Your personal space to organize thoughts, manage tasks and stay focused.
        </p>

        {displayError && (
          <div
            role="alert"
            className="w-full mt-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 text-left flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-rose-200">Authentication Notice</p>
              <p className="text-rose-300/90 mt-0.5 leading-relaxed break-words">{displayError}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleContinueWithGoogle}
          disabled={isSigningIn}
          className="mt-8 w-full min-h-[52px] flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-s3 hover:bg-[#32353b] border border-line text-ink font-medium text-sm transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{isSigningIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <div className="mt-10 w-10 h-px bg-line" />
        <p className="mt-5 text-sm text-ink3">Made by Utkarsh Verma</p>
      </div>
    </div>
  );
};
