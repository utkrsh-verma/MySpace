/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

interface UserProfileProps {
  compact?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ compact = false }) => {
  const { profile, signOut } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!profile) return null;

  const initials = (profile.full_name || profile.email || 'U')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {profile.avatar_url && !imageError ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name || 'User avatar'}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-8 h-8 rounded-full object-cover border border-[#292E38]"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#191D24] border border-[#292E38] text-[#8998F5] flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sign out"
          aria-label="Sign out"
          className="p-1.5 text-[#9299A5] hover:text-[#F5F5F5] hover:bg-[#191D24] rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-[#14171C] border border-[#292E38] flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {profile.avatar_url && !imageError ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name || 'User avatar'}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-9 h-9 rounded-full object-cover border border-[#292E38] shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#191D24] border border-[#292E38] text-[#8998F5] flex items-center justify-center text-xs font-semibold shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#F5F5F5] truncate leading-tight">
            {profile.full_name || 'User'}
          </p>
          <p className="text-xs text-[#9299A5] truncate leading-tight mt-0.5 font-mono text-[11px]">
            {profile.email || ''}
          </p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        title="Sign out of MySpace"
        aria-label="Sign out"
        className="p-2 text-[#9299A5] hover:text-[#F5F5F5] hover:bg-[#191D24] rounded-lg transition-colors shrink-0 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};
