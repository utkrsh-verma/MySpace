/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveTab } from '../types';
import { CheckCircle2, BookOpen } from 'lucide-react';
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
  const items: { id: ActiveTab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2, count: pendingTasksCount },
    { id: 'journal', label: 'Journal', icon: BookOpen, count: journalEntriesCount },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between w-60 h-screen fixed left-0 top-0 bg-s1 z-30 select-none">
      <div className="p-5 flex flex-col flex-1 min-h-0">
        <div className="px-2 pt-1 pb-8">
          <h1 className="font-display text-2xl text-ink tracking-tight leading-none">MySpace</h1>
        </div>

        <nav className="space-y-1" aria-label="Main">
          {items.map(({ id, label, icon: Icon, count }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-s3 text-ink'
                    : 'text-ink2 hover:text-ink hover:bg-s2'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`w-[18px] h-[18px] ${active ? 'text-violet-soft' : ''}`} />
                  {label}
                </span>
                {count > 0 && (
                  <span className="text-xs tabular-nums text-ink3">{count}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4">
        <UserProfile />
      </div>
    </aside>
  );
};
