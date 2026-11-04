/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveTab } from '../types';
import { UserProfile } from './UserProfile';

interface HeaderProps {
  activeTab: ActiveTab;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-canvas/85 backdrop-blur-md">
      <div className="min-w-0">
        <span className="font-display text-xl text-ink tracking-tight leading-none">MySpace</span>
        <span className="sr-only">{activeTab === 'tasks' ? 'My Tasks' : 'My Journal'}</span>
      </div>
      <UserProfile compact />
    </header>
  );
};
