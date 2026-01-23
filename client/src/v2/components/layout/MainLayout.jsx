/**
 * MainLayout - Primary layout wrapper for all pages
 * 
 * This component stays mounted across route changes, preventing
 * sidebar flickering and maintaining smooth transitions.
 * 
 * Modes:
 * - Standard View: Both sidebars visible
 * - Expand Left: Right hidden, content expands right
 * - Expand Right: Left hidden, content expands left
 * - Focus Mode: Both hidden, full content
 * 
 * Uses React Router's Outlet to render child routes.
 */

import React, { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import RightPanel from './RightPanel';
import { useLayout } from '../../context/LayoutContext';
import './MainLayout.css';

// Map URL paths to assistant types
const getAssistantTypeFromPath = (pathname) => {
  if (pathname.includes('/career-assistant')) return 'Career';
  if (pathname.includes('/academics-assistant')) return 'Academics';
  if (pathname.includes('/gymkhana-assistant')) return 'Gymkhana';
  if (pathname.includes('/bhaat-assistant')) return 'Bhaat';
  return null; // Home or other pages show all
};

const MainLayout = () => {
  const location = useLocation();
  const { 
    layoutMode, 
    isLeftSidebarVisible, 
    isRightPanelVisible,
    isLeftSidebarExpanded,
    isFocusMode
  } = useLayout();

  // Determine current assistant type from URL
  const currentAssistantType = useMemo(() => {
    return getAssistantTypeFromPath(location.pathname);
  }, [location.pathname]);

  // Generate layout class names
  const layoutClasses = useMemo(() => {
    const classes = ['main-layout'];
    classes.push(`layout-mode--${layoutMode}`);
    if (!isLeftSidebarVisible) classes.push('left-hidden');
    if (!isRightPanelVisible) classes.push('right-hidden');
    if (isLeftSidebarExpanded) classes.push('left-expanded');
    if (isFocusMode) classes.push('is-focus-mode');
    return classes.join(' ');
  }, [layoutMode, isLeftSidebarVisible, isRightPanelVisible, isLeftSidebarExpanded, isFocusMode]);

  return (
    <div className={layoutClasses}>
      {/* Left Sidebar - Static, never re-mounts */}
      <LeftSidebar />

      {/* Main Content Area - Only this part changes on navigation */}
      <main className="main-content">
        <div className="main-content__inner">
          <Outlet />
        </div>
      </main>

      {/* Right Panel - Static, filters conversations by assistant type */}
      <RightPanel currentAssistantType={currentAssistantType} />
    </div>
  );
};

export default MainLayout;

