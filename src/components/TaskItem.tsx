/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onEdit: (id: string, newTitle: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditTitle(task.title);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setIsEditing(false);
      return;
    }
    if (trimmed === task.title) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    const success = await onEdit(task.id, trimmed);
    setIsSaving(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const stamp = new Date(task.is_completed ? task.updated_at : task.created_at);
  const stampLabel = `${task.is_completed ? 'Completed' : 'Added'} ${stamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;

  return (
    <>
      <div
        className={`group flex items-center justify-between gap-2 pl-3 pr-1.5 py-2.5 rounded-xl border border-line transition-all hover:-translate-y-px hover:border-slate-400/20 ${
          task.is_completed ? 'bg-s1/60' : 'bg-s1 hover:bg-s2'
        }`}
      >
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {/* Circular checkbox (44px touch target, 20px visual) */}
          <button
            type="button"
            role="checkbox"
            aria-checked={task.is_completed}
            aria-label={task.is_completed ? 'Mark task incomplete' : 'Mark task complete'}
            onClick={() => onToggleComplete(task.id, !task.is_completed)}
            className="w-10 h-10 -ml-2 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <span
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                task.is_completed
                  ? 'bg-violet/60 border-violet/60 text-white'
                  : 'border-slate-500 group-hover:border-violet'
              }`}
            >
              {task.is_completed && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
          </button>

          {isEditing ? (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                aria-label="Edit task title"
                className="flex-1 min-w-0 bg-s2 border border-violet/60 rounded-lg px-3 py-2 text-[15px] text-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving || !editTitle.trim()}
                className="w-10 h-10 flex items-center justify-center text-white bg-violet hover:bg-[#9b72f8] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                title="Save changes"
                aria-label="Save changes"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="w-10 h-10 flex items-center justify-center text-ink2 hover:text-ink hover:bg-s3 rounded-lg transition-colors cursor-pointer"
                title="Cancel"
                aria-label="Cancel editing"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => onToggleComplete(task.id, !task.is_completed)}
              className="min-w-0 flex-1 cursor-pointer select-none py-1"
            >
              <p
                className={`text-[15px] break-words transition-colors ${
                  task.is_completed ? 'line-through text-ink3' : 'text-ink'
                }`}
              >
                {task.title}
              </p>
              <p className="text-xs text-ink3 mt-0.5">{stampLabel}</p>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center shrink-0 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleStartEdit}
              title="Edit task"
              aria-label="Edit task"
              className="w-10 h-10 flex items-center justify-center text-ink2 hover:text-ink hover:bg-s3 rounded-lg transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete task"
              aria-label="Delete task"
              className="w-10 h-10 flex items-center justify-center text-ink2 hover:text-rose-400 hover:bg-s3 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        isDangerous={true}
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
