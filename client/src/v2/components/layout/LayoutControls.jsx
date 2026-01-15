/**
 * LayoutControls - Layout mode controls
 * 
 * Left Button: Toggle sidebar expand/collapse (Cmd/Ctrl = hide/show)
 * Middle Button: Toggle Focus Mode (Cmd/Ctrl = Immersive Mode)
 * Right Button: Toggle right panel visibility
 * 
 * Icons change based on current state
 */

import React from 'react';
import Icon from '../ui/Icon';
import { useLayout, LAYOUT_MODES } from '../../context/LayoutContext';
import './LayoutControls.css';

const LayoutControls = () => {
  const {
    isLeftSidebarVisible,
    isLeftSidebarExpanded,
    isRightPanelVisible,
    isFocusMode,
    isImmersiveMode,
    layoutMode,
    toggleLeftSidebar,
    toggleFocusMode,
    toggleRightPanel,
  } = useLayout();

  // Check if in focus state (both sidebars hidden)
  const isInFocusState = !isLeftSidebarVisible && !isRightPanelVisible;

  // Button states for highlighting
  const getLeftButtonState = () => {
    if (!isLeftSidebarVisible) return 'is-dim';
    return 'is-highlighted';
  };

  const getMiddleButtonState = () => {
    // Highlight when both sidebars are hidden OR in immersive mode
    if (isInFocusState || isImmersiveMode) return 'is-highlighted';
    return 'is-dim';
  };

  const getRightButtonState = () => {
    if (!isRightPanelVisible) return 'is-dim';
    return 'is-highlighted';
  };

  // Get appropriate icon for middle button
  const getMiddleIcon = () => {
    if (isImmersiveMode) {
      // Browser fullscreen - different icon
      return 'minimize';
    }
    // Show exit icon when both sidebars are hidden
    if (isInFocusState) {
      return 'exitFullscreen';
    }
    return 'fullscreen';
  };

  // Get tooltip for middle button
  const getMiddleTooltip = () => {
    if (isImmersiveMode) {
      return 'Exit Immersive Mode (browser fullscreen)';
    }
    if (isInFocusState) {
      return 'Exit Focus Mode (⌘/Ctrl+click for Immersive)';
    }
    return 'Focus Mode (⌘/Ctrl+click for Immersive)';
  };

  return (
    <div className="layout-controls">
      {/* Left Sidebar Control */}
      <button
        className={`layout-control-btn ${getLeftButtonState()}`}
        onClick={toggleLeftSidebar}
        title={`${isLeftSidebarVisible ? (isLeftSidebarExpanded ? 'Compact Navigation' : 'Full Navigation') : 'Show Navigation'} (⌘/Ctrl+click to ${isLeftSidebarVisible ? 'hide' : 'show'})`}
        aria-label="Toggle left sidebar"
      >
        <Icon 
          name={isLeftSidebarVisible ? 'panelLeftClose' : 'panelLeftOpen'} 
          size={18} 
        />
      </button>

      {/* Focus Mode / Immersive Mode Control */}
      <button
        className={`layout-control-btn layout-control-btn--focus ${getMiddleButtonState()} ${isImmersiveMode ? 'is-immersive' : ''}`}
        onClick={toggleFocusMode}
        title={getMiddleTooltip()}
        aria-label="Toggle focus mode"
      >
        <Icon 
          name={getMiddleIcon()} 
          size={18} 
        />
      </button>

      {/* Right Panel Control */}
      <button
        className={`layout-control-btn ${getRightButtonState()}`}
        onClick={toggleRightPanel}
        title={isRightPanelVisible ? 'Expand Left' : 'Show Panel'}
        aria-label="Toggle right panel"
      >
        <Icon 
          name={isRightPanelVisible ? 'panelRightClose' : 'panelRightOpen'} 
          size={18} 
        />
      </button>
    </div>
  );
};

export default LayoutControls;
