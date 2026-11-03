/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useTasks() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
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
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchErr) {
        throw fetchErr;
      }

      setTasks(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load tasks';
      console.error('Fetch tasks error:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (title: string): Promise<boolean> => {
    const trimmed = title.trim();
    if (!trimmed || !user) return false;

    const client = getSupabase();
    if (!client) {
      addToast('Database connection not available', 'error');
      return false;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticTask: Task = {
      id: tempId,
      user_id: user.id,
      title: trimmed,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const { data, error: insertErr } = await client
        .from('tasks')
        .insert({
          user_id: user.id,
          title: trimmed,
          is_completed: false,
        })
        .select()
        .single();

      if (insertErr) {
        throw insertErr;
      }

      if (data) {
        setTasks((prev) => prev.map((t) => (t.id === tempId ? data : t)));
      }
      addToast('Task added', 'success');
      return true;
    } catch (err: unknown) {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      const message = err instanceof Error ? err.message : 'Failed to add task';
      addToast(message, 'error');
      return false;
    }
  };

  const toggleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
    if (!user) return;
    const client = getSupabase();
    if (!client) return;

    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, is_completed: isCompleted, updated_at: new Date().toISOString() }
          : t
      )
    );

    try {
      const { error: updateErr } = await client
        .from('tasks')
        .update({
          is_completed: isCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (updateErr) {
        throw updateErr;
      }

      if (isCompleted) {
        addToast('Task completed', 'success');
      }
    } catch (err: unknown) {
      setTasks(previousTasks);
      const message = err instanceof Error ? err.message : 'Failed to update task';
      addToast(message, 'error');
    }
  };

  const editTask = async (taskId: string, newTitle: string): Promise<boolean> => {
    const trimmed = newTitle.trim();
    if (!trimmed || !user) return false;

    const client = getSupabase();
    if (!client) return false;

    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, title: trimmed, updated_at: new Date().toISOString() }
          : t
      )
    );

    try {
      const { error: updateErr } = await client
        .from('tasks')
        .update({
          title: trimmed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (updateErr) {
        throw updateErr;
      }

      addToast('Task updated', 'success');
      return true;
    } catch (err: unknown) {
      setTasks(previousTasks);
      const message = err instanceof Error ? err.message : 'Failed to edit task';
      addToast(message, 'error');
      return false;
    }
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    if (!user) return false;
    const client = getSupabase();
    if (!client) return false;

    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const { error: deleteErr } = await client
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (deleteErr) {
        throw deleteErr;
      }

      addToast('Task deleted', 'info');
      return true;
    } catch (err: unknown) {
      setTasks(previousTasks);
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      addToast(message, 'error');
      return false;
    }
  };

  const pendingTasks = tasks.filter((t) => !t.is_completed);
  const completedTasks = tasks.filter((t) => t.is_completed);

  return {
    tasks,
    pendingTasks,
    completedTasks,
    loading,
    error,
    addTask,
    toggleTaskCompletion,
    editTask,
    deleteTask,
    refreshTasks: fetchTasks,
  };
}
