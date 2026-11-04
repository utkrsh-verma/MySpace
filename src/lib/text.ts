/**
 * Small, pure helpers derived from real entry data (no stored fields needed).
 */
import { JournalEntry } from '../types';

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export function readMinutes(words: number): number {
  return Math.max(1, Math.round(words / 200));
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Consecutive days with at least one entry, ending today or yesterday. */
export function writingStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;
  const days = new Set(entries.map((e) => dayKey(new Date(e.created_at))));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (dayKey(d) === dayKey(today)) return 'Today';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
