/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useJournal } from '../hooks/useJournal';
import { JournalEntry } from '../types';
import { JournalCard } from '../components/JournalCard';
import { JournalEditor } from '../components/JournalEditor';
import { JournalReaderModal } from '../components/JournalReaderModal';
import { EmptyState } from '../components/EmptyState';
import { Plus } from 'lucide-react';

export const JournalPage: React.FC = () => {
  const { entries, loading, error, addEntry, updateEntry, deleteEntry } = useJournal();
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [readingEntry, setReadingEntry] = useState<JournalEntry | null>(null);

  const handleStartCreate = () => {
    setEditingEntry(null);
    setReadingEntry(null);
    setIsCreating(true);
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setReadingEntry(null);
    setIsCreating(false);
    setEditingEntry(entry);
  };

  const handleCloseEditor = () => {
    setIsCreating(false);
    setEditingEntry(null);
  };

  const handleSaveEditor = async (title: string, content: string): Promise<boolean> => {
    if (editingEntry) {
      return await updateEntry(editingEntry.id, title, content);
    } else {
      return await addEntry(title, content);
    }
  };

  // If user is actively writing or editing, show the clean distraction-free editor
  if (isCreating || editingEntry) {
    return (
      <div className="w-full max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <JournalEditor
          initialEntry={editingEntry}
          onSave={handleSaveEditor}
          onCancel={handleCloseEditor}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-8">
      {/* Page Header with New Entry Button */}
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] tracking-tight">
            My Journal
          </h1>
          <p className="text-sm text-[#9299A5] mt-1">
            A quiet space for your thoughts.
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#0D0F12] bg-[#8998F5] hover:bg-[#7888f3] rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Entries List or Empty State */}
      {loading && entries.length === 0 ? (
        <div className="space-y-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-[#191D24]/60 border border-[#292E38] animate-pulse"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          type="journal"
          action={{
            label: 'Write First Entry',
            onClick: handleStartCreate,
          }}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#9299A5] px-1 mb-1">
            <span>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
            <span>Sorted by newest</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {entries.map((entry) => (
              <JournalCard
                key={entry.id}
                entry={entry}
                onSelect={(selected) => setReadingEntry(selected)}
                onEdit={handleStartEdit}
                onDelete={deleteEntry}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reader Modal */}
      <JournalReaderModal
        entry={readingEntry}
        onClose={() => setReadingEntry(null)}
        onEdit={handleStartEdit}
      />
    </div>
  );
};
