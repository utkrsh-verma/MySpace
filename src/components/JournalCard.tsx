/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { Pencil, Trash2, Calendar, Clock } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

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
  const updatedDate = new Date(entry.updated_at);
  const wasEdited = Math.abs(updatedDate.getTime() - createdDate.getTime()) > 5000;

  const formattedDate = createdDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

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

  return (
    <>
      <article
        onClick={() => onSelect(entry)}
        className="group relative flex flex-col justify-between p-5 rounded-xl bg-[#191D24] border border-[#292E38] hover:border-[#384050] transition-all cursor-pointer"
      >
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-base font-semibold text-[#F5F5F5] group-hover:text-white transition-colors line-clamp-1">
              {displayTitle}
            </h3>

            {/* Actions */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <button
                type="button"
                onClick={() => onEdit(entry)}
                title="Edit entry"
                aria-label="Edit entry"
                className="p-1.5 text-[#9299A5] hover:text-[#F5F5F5] hover:bg-[#14171C] rounded-md transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete entry"
                aria-label="Delete entry"
                className="p-1.5 text-[#9299A5] hover:text-rose-400 hover:bg-[#14171C] rounded-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Snippet preview */}
          <p className="text-sm text-[#9299A5] leading-relaxed line-clamp-3 mb-4 whitespace-pre-line">
            {entry.content}
          </p>
        </div>

        {/* Metadata footer */}
        <div className="flex items-center gap-3 text-xs text-[#9299A5]/80 pt-3 border-t border-[#292E38]/50">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          <span aria-hidden="true" className="text-[#292E38]">·</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedTime}</span>
          </div>
          {wasEdited && (
            <>
              <span aria-hidden="true" className="text-[#292E38]">·</span>
              <span className="text-[11px] text-[#9299A5]/60 italic">Edited</span>
            </>
          )}
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
