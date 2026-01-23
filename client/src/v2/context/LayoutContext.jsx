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

// Right panel width constraints
// Default: 22% of viewport, Min: 250px, Max: 35% of viewport
const RIGHT_PANEL_DEFAULT_PERCENT = 22; // 22%
const RIGHT_PANEL_MIN_WIDTH = 250; // 250px minimum
const RIGHT_PANEL_MAX_PERCENT = 35; // 35% maximum
const RIGHT_PANEL_STORAGE_KEY = 'kgpedia-right-panel-width';

// Helper to calculate initial width based on viewport
const getInitialRightPanelWidth = () => {
  if (typeof window === 'undefined') return 280; // SSR fallback
  const viewportWidth = window.innerWidth;
  const layoutPadding = 12; // var(--layout-padding)
  const availableWidth = viewportWidth - (layoutPadding * 2); // Account for screen padding
  const defaultWidth = Math.round((availableWidth * RIGHT_PANEL_DEFAULT_PERCENT) / 100);
  return Math.max(RIGHT_PANEL_MIN_WIDTH, Math.min(defaultWidth, (availableWidth * RIGHT_PANEL_MAX_PERCENT) / 100));
};

export const LayoutProvider = ({ children }) => {
  // Sidebar states
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(false);
  const [isLeftSidebarVisible, setIsLeftSidebarVisible] = useState(true);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Right panel resizable width - load from localStorage or calculate from viewport
  const [rightPanelWidth, setRightPanelWidth] = useState(() => {
    const saved = localStorage.getItem(RIGHT_PANEL_STORAGE_KEY);
    if (saved) {
      const savedWidth = parseInt(saved, 10);
      // Validate saved width is within reasonable bounds
      if (savedWidth >= RIGHT_PANEL_MIN_WIDTH && savedWidth <= window.innerWidth * 0.4) {
        return savedWidth;
      }
    }
    return getInitialRightPanelWidth();
  });
  const [isResizingRightPanel, setIsResizingRightPanel] = useState(false);

  // Recalculate right panel width on window resize (for percentage-based behavior)
  useEffect(() => {
    const handleResize = () => {
      if (!isResizingRightPanel) {
        setRightPanelWidth(prevWidth => {
          const viewportWidth = window.innerWidth;
          const layoutPadding = 12;
          const availableWidth = viewportWidth - (layoutPadding * 2);
          const maxWidth = (availableWidth * RIGHT_PANEL_MAX_PERCENT) / 100;
          
          // If current width exceeds max, clamp it
          if (prevWidth > maxWidth) {
            return Math.round(maxWidth);
          }
          // If current width is below min, bring it up
          if (prevWidth < RIGHT_PANEL_MIN_WIDTH) {
            return RIGHT_PANEL_MIN_WIDTH;
          }
          return prevWidth;
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isResizingRightPanel]);

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

  // Save right panel width to localStorage
  useEffect(() => {
    if (!isResizingRightPanel) {
      localStorage.setItem(RIGHT_PANEL_STORAGE_KEY, rightPanelWidth.toString());
    }
  }, [rightPanelWidth, isResizingRightPanel]);

  // Right panel resize handlers
  const startResizingRightPanel = useCallback(() => {
    setIsResizingRightPanel(true);
  }, []);

  const stopResizingRightPanel = useCallback(() => {
    setIsResizingRightPanel(false);
  }, []);

  const resizeRightPanel = useCallback((clientX) => {
    if (!isResizingRightPanel) return;
    
    const viewportWidth = window.innerWidth;
    const layoutPadding = 12; // var(--layout-padding)
    
    // Calculate new width from right edge, accounting for layout padding
    const newWidth = viewportWidth - clientX - layoutPadding;
    
    // Calculate max width as 35% of available space
    const availableWidth = viewportWidth - (layoutPadding * 2);
    const maxWidth = (availableWidth * RIGHT_PANEL_MAX_PERCENT) / 100;
    
    // Clamp to min/max
    const clampedWidth = Math.min(
      Math.max(newWidth, RIGHT_PANEL_MIN_WIDTH),
      maxWidth
    );
    
    setRightPanelWidth(Math.round(clampedWidth));
  }, [isResizingRightPanel]);

  // Reset right panel to default width (22% of viewport)
  const resetRightPanelWidth = useCallback(() => {
    setRightPanelWidth(getInitialRightPanelWidth());
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
    
    // Right panel resize states
    rightPanelWidth,
    isResizingRightPanel,
    rightPanelMinWidth: RIGHT_PANEL_MIN_WIDTH,
    rightPanelMaxPercent: RIGHT_PANEL_MAX_PERCENT,
    rightPanelDefaultPercent: RIGHT_PANEL_DEFAULT_PERCENT,
    
    // Actions
    toggleLeftSidebar,
    toggleFocusMode,
    toggleRightPanel,
    setLayoutMode,
    setIsLeftSidebarExpanded,
    setIsLeftSidebarVisible,
    setIsRightPanelVisible,
    
    // Right panel resize actions
    startResizingRightPanel,
    stopResizingRightPanel,
    resizeRightPanel,
    resetRightPanelWidth,
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
