/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveTab } from '../types';
import { CheckSquare, BookOpen } from 'lucide-react';
import { UserProfile } from './UserProfile';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingTasksCount: number;
  journalEntriesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingTasksCount,
  journalEntriesCount,
}) => {
  return (
    <aside className="hidden md:flex flex-col justify-between w-64 h-screen fixed left-0 top-0 bg-[#14171C] border-r border-[#292E38] z-30 select-none">
      {/* Top Branding & Navigation */}
      <div className="p-5 flex flex-col flex-1 min-h-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5 pb-6 border-b border-[#292E38]/50 mb-6">
          <div className="w-7 h-7 rounded-lg bg-[#191D24] border border-[#292E38] flex items-center justify-center text-[#8998F5] shadow-xs">
            <span className="font-bold text-sm tracking-tight">M</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#F5F5F5] tracking-tight leading-none">
              MySpace
            </h1>
            <span className="text-[10px] text-[#9299A5] tracking-wide uppercase font-mono">
              v1.0
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          <button
            type="button"
            onClick={() => onTabChange('tasks')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-[#191D24] text-[#F5F5F5] border border-[#292E38]'
                : 'text-[#9299A5] hover:text-[#F5F5F5] hover:bg-[#191D24]/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare
                className={`w-4 h-4 ${
                  activeTab === 'tasks' ? 'text-[#8998F5]' : 'text-[#9299A5]'
                }`}
              />
              <span>My Tasks</span>
            </div>
            {pendingTasksCount > 0 && (
              <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-md bg-[#14171C] border border-[#292E38] text-[#9299A5]">
                {pendingTasksCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('journal')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'journal'
                ? 'bg-[#191D24] text-[#F5F5F5] border border-[#292E38]'
                : 'text-[#9299A5] hover:text-[#F5F5F5] hover:bg-[#191D24]/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen
                className={`w-4 h-4 ${
                  activeTab === 'journal' ? 'text-[#8998F5]' : 'text-[#9299A5]'
                }`}
              />
              <span>My Journal</span>
            </div>
            {journalEntriesCount > 0 && (
              <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-md bg-[#14171C] border border-[#292E38] text-[#9299A5]">
                {journalEntriesCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* User profile section at the bottom */}
      <div className="p-4 border-t border-[#292E38]/60 bg-[#14171C]">
        <UserProfile />
      </div>
    </aside>
  );
};
