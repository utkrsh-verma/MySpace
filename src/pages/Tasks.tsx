/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskInput } from '../components/TaskInput';
import { TaskItem } from '../components/TaskItem';
import { EmptyState } from '../components/EmptyState';

export const TasksPage: React.FC = () => {
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

  return (
    <div className="w-full max-w-2xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] tracking-tight">
          My Tasks
        </h1>
        <p className="text-sm text-[#9299A5] mt-1">
          Keep track of what needs to get done.
        </p>
      </div>

      {/* Add Task Input */}
      <div>
        <TaskInput onAddTask={addTask} />
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Content Area */}
      {loading && tasks.length === 0 ? (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-[#191D24]/60 border border-[#292E38] animate-pulse"
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState type="tasks" />
      ) : (
        <div className="space-y-8">
          {/* Pending Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-semibold text-[#9299A5] uppercase tracking-wider">
                Pending
              </h2>
              <span className="text-xs font-mono text-[#9299A5] px-1.5 py-0.5 rounded bg-[#191D24] border border-[#292E38] tabular-nums">
                {pendingTasks.length}
              </span>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#14171C]/50 border border-dashed border-[#292E38] text-center text-xs text-[#9299A5]">
                All pending tasks completed. Nice work!
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleTaskCompletion}
                    onEdit={editTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Completed Section */}
          {completedTasks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold text-[#9299A5] uppercase tracking-wider">
                  Completed
                </h2>
                <span className="text-xs font-mono text-[#9299A5] px-1.5 py-0.5 rounded bg-[#191D24] border border-[#292E38] tabular-nums">
                  {completedTasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleTaskCompletion}
                    onEdit={editTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
