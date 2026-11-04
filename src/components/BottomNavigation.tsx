/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveTab } from '../types';
import { CheckCircle2, BookOpen } from 'lucide-react';

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
  const items: { id: ActiveTab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2, count: pendingTasksCount },
    { id: 'journal', label: 'Journal', icon: BookOpen, count: journalEntriesCount },
  ];

  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-safe pt-2 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-sm flex items-center gap-1 p-1.5 rounded-2xl bg-s1/85 backdrop-blur-xl border border-line shadow-glow">
        {items.map(({ id, label, icon: Icon, count }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 min-h-[48px] flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                active ? 'bg-violet/20 text-violet-soft' : 'text-ink2 hover:text-ink'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
              {count > 0 && (
                <span className="text-[11px] tabular-nums opacity-70">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
