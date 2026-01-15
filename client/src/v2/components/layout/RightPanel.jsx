/**
 * RightPanel - Resizable sidebar with Conversations, Collections, AI Models
 * Order: Conversations → Collections → AI Model → Trending → Quick Actions
 * 
 * Features:
 * - Resizable width (drag left edge)
 * - Min/Max width constraints
 * - Saves preference to localStorage
 * 
 * Props:
 * - currentAssistantType: Filter by assistant type (Career, Academics, etc.)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLayout } from '../../context/LayoutContext';
import { AIModels } from '../ai';
import { ConversationsHub } from '../conversations';
import { CollectionsList } from '../collections';
// import TrendingTopics from './TrendingTopics';  // Disabled for now
// import QuickActions from './QuickActions';      // Disabled for now
import './RightPanel.css';

const RightPanel = ({ currentAssistantType = null }) => {
  const { 
    isRightPanelVisible,
    rightPanelWidth,
    isResizingRightPanel,
    startResizingRightPanel,
    stopResizingRightPanel,
    resizeRightPanel,
    resetRightPanelWidth
  } = useLayout();
  
  const [selectedModel, setSelectedModel] = useState('kgpedia-standard');

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
  };

  // Handle mouse move for resizing
  const handleMouseMove = useCallback((e) => {
    if (isResizingRightPanel) {
      resizeRightPanel(e.clientX);
    }
  }, [isResizingRightPanel, resizeRightPanel]);

  // Handle mouse up to stop resizing
  const handleMouseUp = useCallback(() => {
    if (isResizingRightPanel) {
      stopResizingRightPanel();
    }
  }, [isResizingRightPanel, stopResizingRightPanel]);

  // Add/remove global mouse listeners
  useEffect(() => {
    if (isResizingRightPanel) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingRightPanel, handleMouseMove, handleMouseUp]);

  // Handle resize start
  const handleResizeStart = (e) => {
    e.preventDefault();
    startResizingRightPanel();
  };

  // Double-click to reset width
  const handleResizeDoubleClick = () => {
    resetRightPanelWidth();
  };

  return (
    <aside 
      className={`right-panel ${!isRightPanelVisible ? 'is-hidden' : ''} ${isResizingRightPanel ? 'is-resizing' : ''}`}
      style={{ width: isRightPanelVisible ? rightPanelWidth : 0 }}
    >
      {/* Resize Handle */}
      <div 
        className="right-panel__resize-handle"
        onMouseDown={handleResizeStart}
        onDoubleClick={handleResizeDoubleClick}
        title="Drag to resize • Double-click to reset"
      >
        <div className="resize-handle__line" />
      </div>

      <div className="right-panel__content">
        {/* Scrollable container for all components */}
        <div className="right-panel__scroll">
          {/* 1. Collections - only show when on an assistant page */}
          {currentAssistantType && (
            <CollectionsList chatProfile={currentAssistantType} />
          )}

          {/* 2. Conversations Hub - filtered by assistant type and collection */}
          <ConversationsHub filterByAssistant={currentAssistantType} />

          {/* 3. AI Model Selector */}
          <AIModels 
            selectedModel={selectedModel} 
            onModelChange={handleModelChange} 
          />

          {/* Future: Trending Topics and Quick Actions (disabled for now) */}
          {/* <TrendingTopics /> */}
          {/* <QuickActions /> */}
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
