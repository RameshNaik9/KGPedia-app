/**
 * LayoutContext - Global layout state management
 * 
 * Layout Modes:
 * - STANDARD: Both sidebars visible (default)
 * - EXPAND_LEFT: Right sidebar hidden, content expands right
 * - EXPAND_RIGHT: Left sidebar hidden, content expands left  
 * - FOCUS: Both sidebars hidden, full content focus
 * 
 * Special:
 * - IMMERSIVE: Browser native fullscreen (Cmd/Ctrl + middle button)
 * - Cmd/Ctrl + left/right button: Toggle visibility completely
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const LayoutContext = createContext(undefined);

// Layout modes with professional names
export const LAYOUT_MODES = {
  STANDARD: 'standard',           // Both visible
  EXPAND_LEFT: 'expand-left',     // Right hidden
  EXPAND_RIGHT: 'expand-right',   // Left hidden
  FOCUS: 'focus',                 // Both hidden
};

export const LayoutProvider = ({ children }) => {
  // Sidebar states
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(false);
  const [isLeftSidebarVisible, setIsLeftSidebarVisible] = useState(true);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Listen for native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsImmersiveMode(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Start animation
  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 450);
  }, []);

  // Toggle left sidebar
  // Normal click: expand/collapse (icons only ↔ icons + text)
  // Cmd/Ctrl + click: hide/show completely
  const toggleLeftSidebar = useCallback((event) => {
    const isModifierPressed = event?.metaKey || event?.ctrlKey;
    
    startAnimation();
    
    if (isModifierPressed) {
      // Toggle visibility completely
      setIsLeftSidebarVisible(prev => !prev);
      if (isFocusMode && !isLeftSidebarVisible) {
        // Exiting focus mode by showing left
        setIsFocusMode(false);
      }
    } else {
      // Toggle expand/collapse
      if (!isLeftSidebarVisible) {
        // If hidden, first make it visible
        setIsLeftSidebarVisible(true);
        setIsFocusMode(false);
      } else {
        // Toggle between expanded and collapsed
        setIsLeftSidebarExpanded(prev => !prev);
      }
    }
  }, [isLeftSidebarVisible, isFocusMode, startAnimation]);

  // Toggle Focus Mode (both sidebars hidden)
  // Normal click: Toggle Focus Mode
  // Cmd/Ctrl + click: Toggle Immersive Mode (browser fullscreen)
  const toggleFocusMode = useCallback((event) => {
    const isModifierPressed = event?.metaKey || event?.ctrlKey;
    
    if (isModifierPressed) {
      // Toggle Immersive Mode (browser fullscreen)
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.() ||
        document.documentElement.webkitRequestFullscreen?.();
      } else {
        document.exitFullscreen?.() ||
        document.webkitExitFullscreen?.();
      }
      return;
    }

    startAnimation();
    
    setIsFocusMode(prev => {
      if (!prev) {
        // Entering Focus Mode - hide both
        setIsLeftSidebarVisible(false);
        setIsRightPanelVisible(false);
        return true;
      } else {
        // Exiting Focus Mode - show both
        setIsLeftSidebarVisible(true);
        setIsRightPanelVisible(true);
        return false;
      }
    });
  }, [startAnimation]);

  // Toggle right panel
  // Normal click: toggle visibility
  // Cmd/Ctrl + click: same as normal (no expand/collapse for right)
  const toggleRightPanel = useCallback((event) => {
    startAnimation();
    
    setIsRightPanelVisible(prev => {
      const newValue = !prev;
      // If showing right panel while in focus mode, exit focus mode
      if (newValue && isFocusMode) {
        setIsFocusMode(false);
      }
      return newValue;
    });
  }, [isFocusMode, startAnimation]);

  // Compute current layout mode
  const layoutMode = useMemo(() => {
    if (!isLeftSidebarVisible && !isRightPanelVisible) {
      return LAYOUT_MODES.FOCUS;
    }
    if (!isRightPanelVisible && isLeftSidebarVisible) {
      return LAYOUT_MODES.EXPAND_LEFT;
    }
    if (!isLeftSidebarVisible && isRightPanelVisible) {
      return LAYOUT_MODES.EXPAND_RIGHT;
    }
    return LAYOUT_MODES.STANDARD;
  }, [isLeftSidebarVisible, isRightPanelVisible]);

  // Set specific layout mode
  const setLayoutMode = useCallback((mode) => {
    startAnimation();
    switch (mode) {
      case LAYOUT_MODES.STANDARD:
        setIsFocusMode(false);
        setIsLeftSidebarVisible(true);
        setIsRightPanelVisible(true);
        break;
      case LAYOUT_MODES.EXPAND_LEFT:
        setIsFocusMode(false);
        setIsLeftSidebarVisible(true);
        setIsRightPanelVisible(false);
        break;
      case LAYOUT_MODES.EXPAND_RIGHT:
        setIsFocusMode(false);
        setIsLeftSidebarVisible(false);
        setIsRightPanelVisible(true);
        break;
      case LAYOUT_MODES.FOCUS:
        setIsFocusMode(true);
        setIsLeftSidebarVisible(false);
        setIsRightPanelVisible(false);
        break;
      default:
        break;
    }
  }, [startAnimation]);

  const value = {
    // States
    isLeftSidebarExpanded,
    isLeftSidebarVisible,
    isRightPanelVisible,
    isFocusMode,
    isImmersiveMode,
    isAnimating,
    layoutMode,
    
    // Actions
    toggleLeftSidebar,
    toggleFocusMode,
    toggleRightPanel,
    setLayoutMode,
    setIsLeftSidebarExpanded,
    setIsLeftSidebarVisible,
    setIsRightPanelVisible,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export default LayoutContext;
