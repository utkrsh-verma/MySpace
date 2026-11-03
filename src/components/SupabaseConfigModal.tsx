/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
} from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Database, Check, Copy, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { reloadConfig, isConfigured } = useAuth();
  const { addToast } = useToast();

  const creds = getSupabaseCredentials();
  const [url, setUrl] = useState(creds?.url || '');
  const [anonKey, setAnonKey] = useState(creds?.anonKey || '');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [activeTab, setActiveTab] = useState<'credentials' | 'sql'>('credentials');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      addToast('Please enter both Supabase URL and Anon Key', 'error');
      return;
    }

    saveSupabaseCredentials(url.trim(), anonKey.trim());
    reloadConfig();
    addToast('Supabase credentials saved successfully', 'success');
    onClose();
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    reloadConfig();
    addToast('Supabase credentials cleared', 'info');
  };

  const sqlSchema = `-- MySpace Database Schema for Supabase SQL Editor
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON public.tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS journal_entries_user_id_idx ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS journal_entries_created_at_idx ON public.journal_entries(created_at DESC);

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_journal_entries_updated_at ON public.journal_entries;
CREATE TRIGGER set_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSchema(true);
    addToast('SQL schema copied to clipboard', 'success');
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-xl bg-[#14171C] border border-[#292E38] shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#292E38]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#191D24] border border-[#292E38] text-[#8998F5]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F5F5F5]">Supabase Backend Setup</h3>
              <p className="text-xs text-[#9299A5]">PostgreSQL Database & Google Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#9299A5] hover:text-[#F5F5F5] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="mb-4 p-3 rounded-lg bg-[#191D24] border border-[#292E38] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-[#F5F5F5] font-medium">
              {isConfigured ? 'Supabase Connected' : 'Configuration Required'}
            </span>
          </div>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-[#8998F5] hover:underline"
          >
            <span>supabase.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 p-1 bg-[#191D24] rounded-lg border border-[#292E38]">
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'credentials'
                ? 'bg-[#14171C] text-[#F5F5F5] shadow-xs'
                : 'text-[#9299A5] hover:text-[#F5F5F5]'
            }`}
          >
            API Credentials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'sql'
                ? 'bg-[#14171C] text-[#F5F5F5] shadow-xs'
                : 'text-[#9299A5] hover:text-[#F5F5F5]'
            }`}
          >
            SQL Schema (RLS)
          </button>
        </div>

        {activeTab === 'credentials' ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#F5F5F5] mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                required
                className="w-full px-3 py-2 text-xs text-[#F5F5F5] bg-[#191D24] border border-[#292E38] rounded-lg focus:outline-none focus:border-[#8998F5] placeholder-[#9299A5]/50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F5F5F5] mb-1.5">
                Supabase Anon Public Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                required
                className="w-full px-3 py-2 text-xs text-[#F5F5F5] bg-[#191D24] border border-[#292E38] rounded-lg focus:outline-none focus:border-[#8998F5] placeholder-[#9299A5]/50 font-mono"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#191D24]/50 border border-[#292E38] text-[11px] text-[#9299A5] leading-relaxed">
              <span className="font-semibold text-[#F5F5F5]">Quick Steps:</span>
              <ol className="list-decimal list-inside space-y-0.5 mt-1">
                <li>Create a Supabase project at supabase.com.</li>
                <li>Run the provided SQL Schema tab in Supabase SQL Editor.</li>
                <li>Copy Project URL & Anon Key from Project Settings &rarr; API.</li>
                <li>In Auth &rarr; Providers, enable Google OAuth.</li>
              </ol>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-[#9299A5] hover:text-rose-400 transition-colors"
              >
                Clear Saved Credentials
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-[#9299A5] hover:text-[#F5F5F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-[#0D0F12] bg-[#8998F5] hover:bg-[#7888f3] rounded-lg transition-colors cursor-pointer"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9299A5]">PostgreSQL Schema with RLS Policies</span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#F5F5F5] bg-[#191D24] hover:bg-[#292E38] border border-[#292E38] rounded-md transition-colors cursor-pointer"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-[#0D0F12] border border-[#292E38] text-[11px] text-[#9299A5] font-mono max-h-56 overflow-y-auto leading-relaxed select-all">
              {sqlSchema}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
