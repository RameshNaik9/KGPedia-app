/**
 * ChatHeader - Header for chat interface
 * Shows dynamic content based on sidebar state:
 * - Left sidebar collapsed/hidden: Show "Assistant Name - Chat Title" + date
 * - Left sidebar expanded: Show only "Chat Title"
 */

import React from 'react';
import LayoutControls from '../layout/LayoutControls';
import { useLayout } from '../../context/LayoutContext';
import './ChatHeader.css';

const ChatHeader = ({ 
  assistantName = 'KGPedia',
  chatTitle = null,
  conversationDate = null,
  showLayoutControls = true
}) => {
  const { isLeftSidebarVisible, isLeftSidebarExpanded, isFocusMode } = useLayout();

  // Determine if left sidebar is "fully open" (visible AND expanded)
  const isLeftSidebarFullyOpen = isLeftSidebarVisible && isLeftSidebarExpanded && !isFocusMode;

  // Format date
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const formattedDate = formatDate(conversationDate);

  // Determine what to display
  const getHeaderTitle = () => {
    if (isLeftSidebarFullyOpen) {
      // Left sidebar fully open: show only chat title
      return chatTitle || assistantName;
    } else {
      // Left sidebar collapsed or hidden: show "Assistant - Chat Title"
      if (chatTitle && chatTitle !== 'New Chat') {
        return (
          <>
            <span className="header-assistant-name">{assistantName}</span>
            <span className="header-separator">—</span>
            <span className="header-chat-title">{chatTitle}</span>
          </>
        );
      }
      return assistantName;
    }
  };

  return (
    <header className="chat-header">
      <div className="header-content">
        {/* Title Section */}
        <div className="header-brand">
          <div className="brand-text">
            <span className="brand-name">{getHeaderTitle()}</span>
            {/* Always show date when available */}
            {formattedDate && (
              <span className="header-date">{formattedDate}</span>
            )}
          </div>
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
