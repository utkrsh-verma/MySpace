/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskInput } from '../components/TaskInput';
import { TaskItem } from '../components/TaskItem';
import { EmptyState } from '../components/EmptyState';

type Filter = 'all' | 'pending' | 'completed';

interface TasksPageProps {
  onOpenJournal?: () => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onOpenJournal }) => {
  const {
    tasks,
    pendingTasks,
    completedTasks,
    loading,
    error,
    addTask,
    toggleTaskCompletion,
    editTask,
    deleteTask,
  } = useTasks();
  const [filter, setFilter] = useState<Filter>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const showPending = filter !== 'completed';
  const showCompleted = filter !== 'pending';

  const filters: { id: Filter; label: string; count?: number }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending', count: pendingTasks.length },
    { id: 'completed', label: 'Completed', count: completedTasks.length },
  ];

  const renderList = (list: typeof tasks) => (
    <div className="space-y-2">
      {list.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={toggleTaskCompletion}
          onEdit={editTask}
          onDelete={deleteTask}
        />
      ))}
    </div>
  );

  const sectionHeading = (text: string) => (
    <h2 className="px-1 mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink3">
      {text}
    </h2>
  );

  const allDone = tasks.length > 0 && pendingTasks.length === 0;

  return (
    <div className="w-full max-w-[1040px] mx-auto py-4 sm:py-8 px-4 md:px-8 lg:px-12 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <span className="text-amber">Daily priorities</span>
            <span className="w-1 h-1 rounded-full bg-amber" />
            <span className="normal-case tracking-normal font-medium text-ink2">
              {pendingTasks.length} pending · {completedTasks.length} completed
            </span>
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink tracking-tight mt-2">
            My Tasks
          </h1>
        </div>

        <div
          role="tablist"
          aria-label="Filter tasks"
          className="flex self-start sm:self-auto p-1 rounded-full bg-s1 border border-line"
        >
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`min-h-[36px] px-4 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                filter === f.id ? 'bg-violet text-white' : 'text-ink2 hover:text-ink'
              }`}
            >
              {f.label}
              {f.count !== undefined && (
                <span className="ml-1.5 text-xs tabular-nums opacity-70">{f.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <TaskInput ref={inputRef} onAddTask={addTask} />

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 break-words">
          {error}
        </div>
      )}

      {loading && tasks.length === 0 ? (
        <div className="space-y-2 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[62px] rounded-xl bg-s1 border border-line animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          type="tasks"
          action={{ label: 'Create First Task', onClick: () => inputRef.current?.focus() }}
          secondaryAction={onOpenJournal ? { label: 'Open Journal', onClick: onOpenJournal } : undefined}
        />
      ) : (
        <div className="space-y-8">
          {showPending && (
            <section>
              {sectionHeading('In progress')}
              {pendingTasks.length === 0 ? (
                <EmptyState type="pending-tasks" />
              ) : (
                renderList(pendingTasks)
              )}
            </section>
          )}

          {showCompleted && (filter === 'completed' || completedTasks.length > 0) && (
            <section>
              {sectionHeading(filter === 'completed' ? 'Completed' : 'Accomplished')}
              {completedTasks.length === 0 ? (
                <EmptyState type="completed-tasks" />
              ) : (
                renderList(completedTasks)
              )}
            </section>
          )}

          {allDone && filter === 'all' && onOpenJournal && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-s1 border border-line">
              <div>
                <h3 className="text-base font-semibold text-ink">Pacing &amp; reflection</h3>
                <p className="mt-1 text-sm text-ink2 leading-relaxed">
                  All caught up. Capture loose insights in your journal before closing the session.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenJournal}
                className="flex items-center justify-center gap-2 min-h-[44px] px-5 text-sm font-medium text-ink bg-s2 hover:bg-s3 border border-line rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Open Journal
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
