/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useEffect, useState } from 'react';
import { ArrowUp, CheckCircle2 } from 'lucide-react';

interface TaskInputProps {
  onAddTask: (title: string) => Promise<boolean>;
}

export const TaskInput = forwardRef<HTMLInputElement, TaskInputProps>(({ onAddTask }, ref) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-2 sm:gap-3 p-2 pl-4 rounded-2xl bg-s1 border border-line focus-within:border-violet/50 focus-within:shadow-glow transition-all">
        <CheckCircle2 className="w-5 h-5 text-ink3 shrink-0 hidden sm:block" />
        <input
          ref={ref}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isNarrow ? "What's on your plate today?" : "What do you want to accomplish today?"}
          aria-label="New task"
          disabled={isSubmitting}
          className="flex-1 min-w-0 bg-transparent text-[15px] text-ink placeholder-ink3 focus:outline-none disabled:opacity-50 py-2.5"
        />
        <span className="hidden md:inline text-xs text-ink3 shrink-0">Enter to add</span>
        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="flex items-center gap-1.5 min-h-[44px] px-4 text-sm font-semibold text-white bg-violet hover:bg-[#9b72f8] hover:shadow-glow disabled:bg-s3 disabled:text-ink3 disabled:shadow-none rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          <span>Add<span className="hidden sm:inline"> Task</span></span>
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </form>
  );
});

TaskInput.displayName = 'TaskInput';
