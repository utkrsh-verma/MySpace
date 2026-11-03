/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { JournalEntry } from '../types';
import { X, Pencil, Calendar, Clock } from 'lucide-react';

interface JournalReaderModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
  onEdit: (entry: JournalEntry) => void;
}

export const JournalReaderModal: React.FC<JournalReaderModalProps> = ({
  entry,
  onClose,
  onEdit,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (entry) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [entry, onClose]);

  if (!entry) return null;

  const displayTitle = entry.title && entry.title.trim().length > 0
    ? entry.title.trim()
    : 'Untitled Entry';

  const createdDate = new Date(entry.created_at);
  const updatedDate = new Date(entry.updated_at);
  const wasEdited = Math.abs(updatedDate.getTime() - createdDate.getTime()) > 5000;

  const formattedDate = createdDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = createdDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-[#14171C] border border-[#292E38] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#292E38] bg-[#191D24]/60">
          <div className="flex items-center gap-3 text-xs text-[#9299A5]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedTime}</span>
            </div>
            {wasEdited && (
              <>
                <span aria-hidden="true">·</span>
                <span className="italic text-[11px]">Edited</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onClose();
                onEdit(entry);
              }}
              title="Edit entry"
              className="p-1.5 text-[#9299A5] hover:text-[#F5F5F5] hover:bg-[#191D24] rounded-lg transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close reader"
              className="p-1.5 text-[#9299A5] hover:text-[#F5F5F5] hover:bg-[#191D24] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] tracking-tight">
            {displayTitle}
          </h2>

          <div className="text-sm sm:text-base text-[#F5F5F5]/90 leading-relaxed whitespace-pre-wrap font-normal">
            {entry.content}
          </div>
        </div>
      </div>
    </div>
  );
};
