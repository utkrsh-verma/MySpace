/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { BookOpen, Pencil, Trash2, Clock } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { countWords, readMinutes, formatShortDate } from '../lib/text';

interface JournalCardProps {
  entry: JournalEntry;
  onSelect: (entry: JournalEntry) => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export const JournalCard: React.FC<JournalCardProps> = ({
  entry,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayTitle = entry.title && entry.title.trim().length > 0
    ? entry.title.trim()
    : 'Untitled Entry';

  const createdDate = new Date(entry.created_at);
  const wasEdited =
    Math.abs(new Date(entry.updated_at).getTime() - createdDate.getTime()) > 5000;
  const minutes = readMinutes(countWords(entry.content));
  const isToday = formatShortDate(entry.created_at) === 'Today';
  const dateLabel = isToday
    ? `Today, ${createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : formatShortDate(entry.created_at);
  const formattedTime = createdDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(entry.id);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const iconBtn =
    'w-10 h-10 flex items-center justify-center text-ink2 rounded-lg transition-colors cursor-pointer';

  return (
    <>
      <article
        onClick={() => onSelect(entry)}
        className="group flex items-start gap-2 p-5 sm:p-6 rounded-2xl bg-s1 border border-line hover:bg-s2 hover:-translate-y-px hover:border-slate-400/20 transition-all cursor-pointer"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink2">
            <span className="px-2.5 py-1 rounded-full bg-s3 text-violet-soft font-medium">
              {dateLabel}
            </span>
            <span>{minutes} min read</span>
            {wasEdited && <span className="italic text-ink3">Edited</span>}
          </div>

          <h3 className="font-display text-2xl sm:text-[28px] leading-tight text-ink mt-3 break-words">
            {displayTitle}
          </h3>

          <p className="text-[15px] text-ink2 leading-relaxed line-clamp-2 mt-2 whitespace-pre-line">
            {entry.content}
          </p>

          <p className="flex items-center gap-1.5 text-xs text-ink3 mt-3">
            <Clock className="w-3.5 h-3.5" />
            {formattedTime}
          </p>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col shrink-0 -my-1 -mr-2 sm:mr-0 md:opacity-60 md:group-hover:opacity-100 transition-opacity"
        >
          <button
            type="button"
            onClick={() => onSelect(entry)}
            title="Read entry"
            aria-label="Read entry"
            className={`${iconBtn} hover:text-ink hover:bg-s3`}
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(entry)}
            title="Edit entry"
            aria-label="Edit entry"
            className={`${iconBtn} hover:text-ink hover:bg-s3`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete entry"
            aria-label="Delete entry"
            className={`${iconBtn} hover:text-rose-400 hover:bg-s3`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </article>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Journal Entry"
        message={`Are you sure you want to permanently delete "${displayTitle}"? This action cannot be undone.`}
        confirmLabel="Delete Entry"
        isDangerous={true}
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
