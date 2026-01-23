/**
 * V2LayoutWrapper - Combines providers with persistent MainLayout
 * 
 * This component is used at the route level to:
 * 1. Wrap all V2 pages with theme, layout, and conversation providers
 * 2. Render the persistent sidebar layout (MainLayout)
 * 3. Use Outlet to render child routes in the main content area
 */

import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LayoutProvider } from './context/LayoutContext';
import { ConversationsProvider } from './context/ConversationsContext';
import { MainLayout } from './components/layout';
import './styles/variables.css';
import './styles/globals.css';

const V2LayoutWrapper = () => {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <ConversationsProvider>
          <div className="v2-app">
            <MainLayout />
          </div>
        </ConversationsProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
};

export default V2LayoutWrapper;

