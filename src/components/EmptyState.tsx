/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  type: 'tasks' | 'completed-tasks' | 'pending-tasks' | 'journal' | 'search';
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, action, secondaryAction }) => {
  const content = {
    tasks: {
      title: 'All clear for today',
      subtitle: 'Nothing on your canvas yet. Capture a thought or add your first task whenever you are ready.',
    },
    'pending-tasks': {
      title: 'Nothing pending',
      subtitle: 'Every task is done. Take a breath, or write a few lines in your journal.',
    },
    'completed-tasks': {
      title: 'Nothing completed yet',
      subtitle: 'Tasks you finish will be gathered here.',
    },
    journal: {
      title: 'Your story starts here',
      subtitle: 'Write down whatever is on your mind. Entries are private to your account.',
    },
    search: {
      title: 'No matching entries',
      subtitle: 'Try a different word, or clear the search.',
    },
  }[type];

  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center rounded-2xl bg-s1 border border-line">
      <h3 className="font-display text-2xl sm:text-3xl text-ink mb-2">{content.title}</h3>
      <p className="text-sm text-ink2 max-w-sm leading-relaxed">{content.subtitle}</p>
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="flex items-center gap-2 min-h-[44px] px-5 text-sm font-semibold text-white bg-violet hover:bg-[#9b72f8] hover:shadow-glow rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="flex items-center gap-2 min-h-[44px] px-5 text-sm font-medium text-ink bg-s2 hover:bg-s3 border border-line rounded-xl transition-colors cursor-pointer"
            >
              {secondaryAction.label}
              <BookOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
