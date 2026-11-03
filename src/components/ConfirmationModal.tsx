/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDangerous = true,
  isProcessing = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, isProcessing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-xl bg-[#191D24] border border-[#292E38] p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirmation-modal-title" className="text-base font-semibold text-[#F5F5F5] mb-1">
              {title}
            </h3>
            <p className="text-sm text-[#9299A5] leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            aria-label="Close dialog"
            className="text-[#9299A5] hover:text-[#F5F5F5] p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-medium text-[#F5F5F5] bg-[#14171C] hover:bg-[#292E38] border border-[#292E38] rounded-lg transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              isDangerous
                ? 'bg-rose-600 hover:bg-rose-500 disabled:opacity-50'
                : 'bg-[#8998F5] hover:bg-[#7888f3] text-[#0D0F12] disabled:opacity-50'
            }`}
          >
            {isProcessing ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
