/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveTab } from '../types';
import { UserProfile } from './UserProfile';
import { Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onOpenConfig }) => {
  const { isConfigured } = useAuth();

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#14171C]/95 backdrop-blur-md border-b border-[#292E38]">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#191D24] border border-[#292E38] flex items-center justify-center text-[#8998F5]">
          <span className="font-bold text-sm tracking-tight">M</span>
        </div>
        <span className="text-base font-semibold text-[#F5F5F5] tracking-tight">
          {activeTab === 'tasks' ? 'My Tasks' : 'My Journal'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenConfig}
          title={isConfigured ? 'Supabase connected' : 'Supabase setup required'}
          className="p-2 rounded-lg bg-[#191D24] border border-[#292E38] text-[#9299A5] hover:text-[#F5F5F5] transition-colors"
        >
          <Database className="w-4 h-4" />
        </button>
        <UserProfile compact />
      </div>
    </header>
  );
};
