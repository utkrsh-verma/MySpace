/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface TaskInputProps {
  onAddTask: (title: string) => Promise<boolean>;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onAddTask(trimmed);
    setIsSubmitting(false);

    if (success) {
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="flex items-center gap-2 p-1.5 pl-4 rounded-xl bg-[#14171C] border border-[#292E38] focus-within:border-[#8998F5] transition-colors">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task... (Press Enter to save)"
          disabled={isSubmitting}
          className="flex-1 bg-transparent text-sm text-[#F5F5F5] placeholder-[#9299A5] focus:outline-none disabled:opacity-50 py-1.5"
        />
        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#0D0F12] bg-[#8998F5] hover:bg-[#7888f3] disabled:bg-[#292E38] disabled:text-[#9299A5] rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>
    </form>
  );
};
