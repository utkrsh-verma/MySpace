/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { JournalEntry } from '../types';
import { ArrowLeft, ArrowRight, Calendar, Clock, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { countWords, readMinutes } from '../lib/text';

interface JournalReaderProps {
  entry: JournalEntry;
  /** Entries sorted newest first (same order as the list). */
  entries: JournalEntry[];
  onBack: () => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => Promise<boolean>;
  onSelect: (entry: JournalEntry) => void;
  onNew: () => void;
}

const titleOf = (e: JournalEntry) => (e.title && e.title.trim() ? e.title.trim() : 'Untitled Entry');

export const JournalReader: React.FC<JournalReaderProps> = ({
  entry,
  entries,
  onBack,
  onEdit,
  onDelete,
  onSelect,
  onNew,
}) => {
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [entry.id]);

  const index = entries.findIndex((e) => e.id === entry.id);
  const newer = index > 0 ? entries[index - 1] : null;
  const older = index >= 0 && index < entries.length - 1 ? entries[index + 1] : null;

  const created = new Date(entry.created_at);
  const wasEdited = Math.abs(new Date(entry.updated_at).getTime() - created.getTime()) > 5000;
  const words = countWords(entry.content);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const ok = await onDelete(entry.id);
      setShowDelete(false);
      if (ok) onBack();
    } finally {
      setIsDeleting(false);
    }
  };

  const barBtn =
    'flex items-center gap-2 min-h-[44px] px-3 text-sm font-medium rounded-lg transition-colors cursor-pointer';

  return (
    <article className="w-full max-w-[760px] mx-auto">
      <div className="flex items-center justify-between gap-2 mb-8">
        <button type="button" onClick={onBack} className={`${barBtn} text-ink2 hover:text-ink -ml-3`}>
          <ArrowLeft className="w-4 h-4" />
          Journal
        </button>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onEdit(entry)} className={`${barBtn} text-ink2 hover:text-ink hover:bg-s2`}>
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            aria-label="Delete entry"
            title="Delete entry"
            className={`${barBtn} text-ink2 hover:text-rose-400 hover:bg-s2`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[1.1] tracking-tight break-words">
        {titleOf(entry)}
      </h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 text-xs text-ink2">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {created.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {created.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          {words} {words === 1 ? 'word' : 'words'} · {readMinutes(words)} min read
        </span>
        {wasEdited && <span className="italic text-ink3">Edited</span>}
      </div>

      <div className="mt-10 text-[17px] sm:text-lg text-ink/90 leading-[1.8] whitespace-pre-wrap break-words">
        {entry.content}
      </div>

      <div className="mt-14 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-s1 border border-line">
        <div>
          <h3 className="text-base font-semibold text-ink">Add another reflection</h3>
          <p className="text-sm text-ink2 mt-0.5">Capture another observation or closing thought.</p>
        </div>
        <button
          type="button"
          onClick={onNew}
          className="flex items-center justify-center gap-2 min-h-[44px] px-5 text-sm font-semibold text-white bg-violet hover:bg-[#9b72f8] hover:shadow-glow rounded-xl transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {(newer || older) && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {older ? (
            <button
              type="button"
              onClick={() => onSelect(older)}
              className="text-left p-4 rounded-2xl bg-s1 hover:bg-s2 border border-line transition-colors cursor-pointer min-w-0"
            >
              <span className="flex items-center gap-1.5 text-xs text-ink3">
                <ArrowLeft className="w-3.5 h-3.5" /> Older entry
              </span>
              <span className="block mt-1.5 text-[15px] font-medium text-ink truncate">{titleOf(older)}</span>
            </button>
          ) : (
            <span className="hidden sm:block" />
          )}
          {newer && (
            <button
              type="button"
              onClick={() => onSelect(newer)}
              className="text-left sm:text-right p-4 rounded-2xl bg-s1 hover:bg-s2 border border-line transition-colors cursor-pointer min-w-0"
            >
              <span className="flex items-center sm:justify-end gap-1.5 text-xs text-ink3">
                Newer entry <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="block mt-1.5 text-[15px] font-medium text-ink truncate">{titleOf(newer)}</span>
            </button>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={showDelete}
        title="Delete Journal Entry"
        message={`Are you sure you want to permanently delete "${titleOf(entry)}"? This action cannot be undone.`}
        confirmLabel="Delete Entry"
        isDangerous={true}
        isProcessing={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setShowDelete(false)}
      />
    </article>
  );
};
