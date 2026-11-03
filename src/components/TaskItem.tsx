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

  return (
    <>
      <div className="group relative flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#191D24] border border-[#292E38] hover:border-[#384050] transition-colors">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Custom Checkbox */}
          <button
            type="button"
            role="checkbox"
            aria-checked={task.is_completed}
            aria-label={task.is_completed ? 'Mark task incomplete' : 'Mark task complete'}
            onClick={() => onToggleComplete(task.id, !task.is_completed)}
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              task.is_completed
                ? 'bg-[#8998F5] border-[#8998F5] text-[#0D0F12]'
                : 'border-[#292E38] bg-[#14171C] hover:border-[#8998F5]/50'
            }`}
          >
            {task.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          {/* Title or Inline Edit */}
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                className="flex-1 bg-[#14171C] border border-[#8998F5] rounded-md px-2.5 py-1 text-sm text-[#F5F5F5] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving || !editTitle.trim()}
                className="p-1.5 text-xs text-[#0D0F12] bg-[#8998F5] hover:bg-[#7888f3] rounded-md transition-colors cursor-pointer"
                title="Save changes"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="p-1.5 text-xs text-[#9299A5] hover:text-[#F5F5F5] hover:bg-[#14171C] rounded-md transition-colors cursor-pointer"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span
              onClick={() => onToggleComplete(task.id, !task.is_completed)}
              className={`text-sm break-words flex-1 cursor-pointer select-none transition-all ${
                task.is_completed
                  ? 'line-through text-[#9299A5]/80'
                  : 'text-[#F5F5F5]'
              }`}
            >
              {task.title}
            </span>
          )}
        </div>

        {/* Action icons */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              type="button"
              onClick={handleStartEdit}
              title="Edit task"
              aria-label="Edit task"
              className="p-1.5 text-[#9299A5] hover:text-[#F5F5F5] hover:bg-[#14171C] rounded-md transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete task"
              aria-label="Delete task"
              className="p-1.5 text-[#9299A5] hover:text-rose-400 hover:bg-[#14171C] rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
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
