/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { JournalEntry } from '../types';
import { ArrowLeft, Check } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { countWords, readMinutes } from '../lib/text';

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
  const [showDiscard, setShowDiscard] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const dirty =
    title !== (initialEntry?.title || '') || content !== (initialEntry?.content || '');

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

  const handleDiscard = () => {
    if (dirty) {
      setShowDiscard(true);
    } else {
      onCancel();
    }
  };

  const wordCount = countWords(content);
  const charCount = content.length;
  const today = new Date(initialEntry?.created_at ?? Date.now()).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="w-full max-w-[760px] mx-auto pb-28">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={isSaving}
            className="flex items-center gap-2 min-h-[44px] pr-2 text-sm font-medium text-ink2 hover:text-ink transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Journal</span>
          </button>
          <span className="hidden sm:flex items-center gap-2 text-xs text-ink3 tabular-nums">
            <span className={`w-1.5 h-1.5 rounded-full ${dirty ? 'bg-amber' : 'bg-violet'}`} />
            {dirty ? 'Unsaved changes' : 'No changes'} · {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={isSaving}
            className="min-h-[44px] px-3 text-sm font-medium text-ink2 hover:text-ink transition-colors cursor-pointer"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={!content.trim() || isSaving}
            className="flex items-center gap-1.5 min-h-[44px] px-4 text-sm font-semibold text-white bg-violet hover:bg-[#9b72f8] hover:shadow-glow disabled:bg-s3 disabled:text-ink3 disabled:shadow-none rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isSaving ? 'Saving...' : initialEntry ? 'Update Entry' : 'Save Entry'}</span>
          </button>
        </div>
      </div>

      <p className="inline-block px-3 py-1.5 rounded-full bg-s1 text-xs text-ink2 mb-4">{today}</p>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        aria-label="Entry title"
        className="w-full bg-transparent font-display text-4xl sm:text-5xl text-ink placeholder-ink3/60 focus:outline-none tracking-tight"
      />

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your thoughts freely... what happened today? What's on your mind?"
        aria-label="Entry content"
        rows={14}
        className="mt-6 w-full min-h-[50vh] bg-transparent text-[17px] sm:text-lg text-ink/95 placeholder-ink3/60 focus:outline-none resize-none leading-[1.75]"
      />

      {/* Floating stats bar */}
      <div className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-6 md:ml-30 z-20 px-5 py-2.5 rounded-full bg-s1/90 backdrop-blur-xl border border-line text-xs text-ink2 tabular-nums shadow-glow whitespace-nowrap">
        <span className="text-ink">{wordCount}</span> words
        <span className="mx-2 text-ink3">/</span>
        {readMinutes(wordCount)} min read
        <span className="mx-2 text-ink3">/</span>
        {charCount} chars
      </div>

      <ConfirmationModal
        isOpen={showDiscard}
        title="Discard changes?"
        message="Your unsaved changes to this entry will be lost."
        confirmLabel="Discard"
        isDangerous={true}
        onConfirm={() => {
          setShowDiscard(false);
          onCancel();
        }}
        onCancel={() => setShowDiscard(false)}
      />
    </div>
  );
};
