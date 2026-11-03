/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { JournalEntry } from '../types';
import { getSupabase, describeDbError } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useJournal() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const client = getSupabase();
    if (!client) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await client
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchErr) {
        throw fetchErr;
      }

      setEntries(data || []);
    } catch (err: unknown) {
      const message = describeDbError('load journal', err, 'Failed to load journal entries');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = async (title: string, content: string): Promise<boolean> => {
    const trimmedContent = content.trim();
    if (!trimmedContent || !user) return false;

    const trimmedTitle = title.trim() || null;
    const client = getSupabase();
    if (!client) {
      addToast('Database connection not available', 'error');
      return false;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticEntry: JournalEntry = {
      id: tempId,
      user_id: user.id,
      title: trimmedTitle,
      content: trimmedContent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setEntries((prev) => [optimisticEntry, ...prev]);

    try {
      const { data, error: insertErr } = await client
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: trimmedTitle,
          content: trimmedContent,
        })
        .select()
        .single();

      if (insertErr) {
        throw insertErr;
      }

      if (data) {
        setEntries((prev) => prev.map((e) => (e.id === tempId ? data : e)));
      }
      addToast('Journal entry saved', 'success');
      return true;
    } catch (err: unknown) {
      setEntries((prev) => prev.filter((e) => e.id !== tempId));
      const message = describeDbError('add journal', err, 'Failed to save entry');
      addToast(message, 'error');
      return false;
    }
  };

  const updateEntry = async (id: string, title: string, content: string): Promise<boolean> => {
    const trimmedContent = content.trim();
    if (!trimmedContent || !user) return false;

    const trimmedTitle = title.trim() || null;
    const client = getSupabase();
    if (!client) return false;

    const previousEntries = [...entries];
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              title: trimmedTitle,
              content: trimmedContent,
              updated_at: new Date().toISOString(),
            }
          : e
      )
    );

    try {
      const { error: updateErr } = await client
        .from('journal_entries')
        .update({
          title: trimmedTitle,
          content: trimmedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateErr) {
        throw updateErr;
      }

      addToast('Journal entry updated', 'success');
      return true;
    } catch (err: unknown) {
      setEntries(previousEntries);
      const message = describeDbError('update journal', err, 'Failed to update entry');
      addToast(message, 'error');
      return false;
    }
  };

  const deleteEntry = async (id: string): Promise<boolean> => {
    if (!user) return false;
    const client = getSupabase();
    if (!client) return false;

    const previousEntries = [...entries];
    setEntries((prev) => prev.filter((e) => e.id !== id));

    try {
      const { error: deleteErr } = await client
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteErr) {
        throw deleteErr;
      }

      addToast('Journal entry deleted', 'info');
      return true;
    } catch (err: unknown) {
      setEntries(previousEntries);
      const message = describeDbError('delete journal', err, 'Failed to delete entry');
      addToast(message, 'error');
      return false;
    }
  };

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refreshEntries: fetchEntries,
  };
}
