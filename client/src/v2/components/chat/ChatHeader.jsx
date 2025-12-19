/**
 * ChatHeader - Header for chat interface
 * Shows branding and layout control buttons
 */

import React from 'react';
import LayoutControls from '../layout/LayoutControls';
import './ChatHeader.css';

const ChatHeader = ({ 
  title = 'KGPedia',
  showLayoutControls = true
}) => {
  return (
    <header className="chat-header">
      <div className="header-content">
        {/* Logo/Brand */}
        <div className="header-brand">
          <span className="brand-icon">✦</span>
          <span className="brand-name">{title}</span>
        </div>

        {/* Layout Controls */}
        {showLayoutControls && (
          <LayoutControls />
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
