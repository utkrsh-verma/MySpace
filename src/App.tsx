/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Login } from './pages/Login';
import { TasksPage } from './pages/Tasks';
import { JournalPage } from './pages/Journal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { ActiveTab } from './types';
import { useTasks } from './hooks/useTasks';
import { useJournal } from './hooks/useJournal';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');

  // Load counts for sidebar & navigation badges
  const { pendingTasks } = useTasks();
  const { entries } = useJournal();

  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F5F5F5] flex flex-col md:flex-row">
      {/* Desktop Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingTasksCount={pendingTasks.length}
        journalEntriesCount={entries.length}
      />

      {/* Mobile Top Header */}
      <Header activeTab={activeTab} />

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 min-h-screen pb-24 md:pb-8">
        {activeTab === 'tasks' ? <TasksPage /> : <JournalPage />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingTasksCount={pendingTasks.length}
        journalEntriesCount={entries.length}
      />
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0D0F12]">
        <div className="w-12 h-12 rounded-xl bg-[#14171C] border border-[#292E38] flex items-center justify-center text-[#8998F5] animate-pulse">
          <span className="font-bold text-xl tracking-tight">M</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <MainLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
