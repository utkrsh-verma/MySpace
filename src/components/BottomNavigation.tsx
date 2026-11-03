/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveTab } from '../types';
import { CheckSquare, BookOpen } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingTasksCount: number;
  journalEntriesCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  pendingTasksCount,
  journalEntriesCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#14171C]/95 backdrop-blur-md border-t border-[#292E38] px-4 py-2 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          type="button"
          onClick={() => onTabChange('tasks')}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-lg py-1 transition-colors ${
            activeTab === 'tasks'
              ? 'text-[#8998F5]'
              : 'text-[#9299A5] hover:text-[#F5F5F5]'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5" />
            {pendingTasksCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#8998F5] text-[#0D0F12] text-[10px] font-bold flex items-center justify-center">
                {pendingTasksCount > 99 ? '99+' : pendingTasksCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium leading-none">Tasks</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('journal')}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-lg py-1 transition-colors ${
            activeTab === 'journal'
              ? 'text-[#8998F5]'
              : 'text-[#9299A5] hover:text-[#F5F5F5]'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-5 h-5" />
            {journalEntriesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#292E38] text-[#F5F5F5] text-[10px] font-medium flex items-center justify-center">
                {journalEntriesCount > 99 ? '99+' : journalEntriesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium leading-none">Journal</span>
        </button>
      </div>
    </nav>
  );
};
