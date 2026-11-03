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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#0D0F12] relative select-none">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-xl bg-[#14171C] border border-[#292E38] flex items-center justify-center text-[#8998F5] mb-8 shadow-sm">
          <span className="font-bold text-xl tracking-tight">M</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F5] tracking-tight mb-3">
          Your space. Your thoughts. Your day.
        </h1>

        {/* Supporting text */}
        <p className="text-sm text-[#9299A5] leading-relaxed mb-8 max-w-xs">
          A minimalist personal space for your daily tasks and private journal entries.
        </p>

        {/* Error message */}
        {displayError && (
          <div className="w-full mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 text-left flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-rose-200">Authentication Notice</p>
              <p className="text-rose-300/90 mt-0.5 leading-relaxed">{displayError}</p>
            </div>
          </div>
        )}

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleContinueWithGoogle}
          disabled={isSigningIn}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-[#14171C] hover:bg-[#191D24] border border-[#292E38] hover:border-[#8998F5]/50 text-[#F5F5F5] font-medium text-sm transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {/* Official Google 'G' icon */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isSigningIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>
      </div>
    </div>
  );
};
