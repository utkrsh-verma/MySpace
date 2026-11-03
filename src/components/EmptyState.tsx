/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckSquare, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  type: 'tasks' | 'completed-tasks' | 'journal';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, action }) => {
  const content = {
    tasks: {
      icon: CheckSquare,
      title: 'Nothing here yet.',
      subtitle: 'Add your first task and get started.',
    },
    'completed-tasks': {
      icon: CheckSquare,
      title: 'No completed tasks yet.',
      subtitle: 'Complete tasks to see them archived here.',
    },
    journal: {
      icon: BookOpen,
      title: 'Your story starts here.',
      subtitle: 'Write down whatever is on your mind.',
    },
  }[type];

  const Icon = content.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border border-dashed border-[#292E38] bg-[#14171C]/50">
      <div className="w-12 h-12 rounded-lg bg-[#191D24] border border-[#292E38] flex items-center justify-center text-[#9299A5] mb-4">
        <Icon className="w-5 h-5 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-medium text-[#F5F5F5] mb-1">{content.title}</h3>
      <p className="text-sm text-[#9299A5] max-w-sm mb-5">{content.subtitle}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-xs font-medium text-[#0D0F12] bg-[#8998F5] hover:bg-[#7888f3] rounded-lg transition-colors cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
