/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { JournalEntry } from '../types';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

interface JournalEditorProps {
  initialEntry?: JournalEntry | null;
  onSave: (title: string, content: string) => Promise<boolean>;
  onCancel: () => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  initialEntry,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialEntry?.title || '');
  const [content, setContent] = useState(initialEntry?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSaving) return;

    setIsSaving(true);
    const success = await onSave(title, content);
    setIsSaving(false);
    if (success) {
      onCancel();
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="w-full max-w-3xl mx-auto py-2 animate-in fade-in duration-150">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#292E38]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="flex items-center gap-2 text-xs font-medium text-[#9299A5] hover:text-[#F5F5F5] transition-colors cursor-pointer py-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-xs text-[#9299A5] hidden sm:block tabular-nums">
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-3.5 py-1.5 text-xs font-medium text-[#F5F5F5] bg-[#14171C] hover:bg-[#292E38] border border-[#292E38] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={!content.trim() || isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-[#0D0F12] bg-[#8998F5] hover:bg-[#7888f3] disabled:bg-[#292E38] disabled:text-[#9299A5] rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isSaving ? 'Saving...' : initialEntry ? 'Update Entry' : 'Save Entry'}</span>
          </button>
        </div>
      </div>

      {/* Writing Area */}
      <div className="rounded-xl bg-[#14171C] border border-[#292E38] p-6 sm:p-8 space-y-4 shadow-sm">
        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full bg-transparent text-xl sm:text-2xl font-semibold text-[#F5F5F5] placeholder-[#9299A5]/50 focus:outline-none tracking-tight"
        />

        <div className="h-px bg-[#292E38]/60 w-full" />

        {/* Longform content textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts freely... what happened today? What's on your mind?"
          rows={14}
          className="w-full bg-transparent text-sm sm:text-base text-[#F5F5F5] placeholder-[#9299A5]/40 focus:outline-none resize-none leading-relaxed font-normal"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-[#9299A5]/60 px-1">
        <span>Private & encrypted with Row Level Security</span>
        <span className="sm:hidden tabular-nums">{wordCount} words</span>
      </div>
    </div>
  );
};
