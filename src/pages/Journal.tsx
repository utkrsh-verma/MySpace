/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useJournal } from '../hooks/useJournal';
import { JournalEntry } from '../types';
import { JournalCard } from '../components/JournalCard';
import { JournalEditor } from '../components/JournalEditor';
import { JournalReader } from '../components/JournalReader';
import { EmptyState } from '../components/EmptyState';
import { Plus, Search } from 'lucide-react';
import { countWords, writingStreak } from '../lib/text';

type Range = 'all' | 'week';

export const JournalPage: React.FC = () => {
  const { entries, loading, error, addEntry, updateEntry, deleteEntry } = useJournal();
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<Range>('all');

  // Always read from live state so edits are reflected in the reader.
  const readingEntry = readingId ? entries.find((e) => e.id === readingId) ?? null : null;

  const handleStartCreate = () => {
    setEditingEntry(null);
    setReadingId(null);
    setIsCreating(true);
  };

  const handleStartEdit = (entry: JournalEntry) => {
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
    }
    return await addEntry(title, content);
  };

  const stats = useMemo(() => {
    const totalWords = entries.reduce((sum, e) => sum + countWords(e.content), 0);
    return {
      streak: writingStreak(entries),
      total: entries.length,
      avgWords: entries.length ? Math.round(totalWords / entries.length) : 0,
    };
  }, [entries]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return entries.filter((e) => {
      if (range === 'week' && new Date(e.created_at).getTime() < weekAgo) return false;
      if (!q) return true;
      return (e.title ?? '').toLowerCase().includes(q) || e.content.toLowerCase().includes(q);
    });
  }, [entries, query, range]);

  const shell = 'w-full mx-auto py-4 sm:py-8 px-4 md:px-8 lg:px-12';

  // Writing / editing view
  if (isCreating || editingEntry) {
    return (
      <div className={shell}>
        <JournalEditor
          key={editingEntry?.id ?? 'new'}
          initialEntry={editingEntry}
          onSave={handleSaveEditor}
          onCancel={handleCloseEditor}
        />
      </div>
    );
  }

  // Reading view
  if (readingEntry) {
    return (
      <div className={shell}>
        <JournalReader
          entry={readingEntry}
          entries={entries}
          onBack={() => setReadingId(null)}
          onEdit={handleStartEdit}
          onDelete={deleteEntry}
          onSelect={(e) => setReadingId(e.id)}
          onNew={handleStartCreate}
        />
      </div>
    );
  }

  const statTiles = [
    { label: 'Writing streak', value: `${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}` },
    { label: 'Total entries', value: `${stats.total} recorded` },
    { label: 'Average length', value: `${stats.avgWords} w/entry` },
  ];

  return (
    <div className={`${shell} max-w-[1040px] space-y-6`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
            Chronicler
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink tracking-tight mt-2">
            My Journal
          </h1>
          <p className="text-sm text-ink2 mt-2">Reflections, ideas, and daily chronicles.</p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="flex items-center gap-2 min-h-[44px] px-4 sm:px-5 text-sm font-semibold text-white bg-violet hover:bg-[#9b72f8] hover:shadow-glow rounded-xl transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New<span className="hidden sm:inline"> Entry</span></span>
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 break-words">
          {error}
        </div>
      )}

      {entries.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {statTiles.map((t) => (
              <div key={t.label} className="p-3 sm:p-5 rounded-2xl bg-s1 border border-line min-w-0">
                <p className="text-[11px] sm:text-xs text-ink2 truncate">{t.label}</p>
                <p className="mt-1 text-sm sm:text-xl font-semibold text-ink truncate">{t.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1 flex items-center gap-3 px-4 rounded-xl bg-s1 border border-line focus-within:border-violet/50 focus-within:shadow-glow transition-all">
              <Search className="w-4 h-4 text-ink3 shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search thoughts, memories, or reflections..."
                aria-label="Search journal"
                className="flex-1 min-w-0 bg-transparent py-3 text-[15px] text-ink placeholder-ink3 focus:outline-none"
              />
            </label>
            <div className="flex gap-2">
              {([['all', 'All entries'], ['week', 'This week']] as [Range, string][]).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRange(id)}
                  aria-pressed={range === id}
                  className={`min-h-[44px] sm:min-h-[36px] self-center px-4 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                    range === id ? 'bg-violet/20 text-violet-soft' : 'bg-s2 text-ink2 hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {loading && entries.length === 0 ? (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-s1 border border-line animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          type="journal"
          action={{ label: 'Write First Entry', onClick: handleStartCreate }}
        />
      ) : visible.length === 0 ? (
        <EmptyState type="search" />
      ) : (
        <div className="space-y-3">
          {visible.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onSelect={(selected) => setReadingId(selected.id)}
              onEdit={handleStartEdit}
              onDelete={deleteEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
};
