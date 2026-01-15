/**
 * V2LayoutWrapper - Combines V2App providers with persistent V2Layout
 * 
 * This component is used at the route level to:
 * 1. Wrap all V2 pages with theme, layout, and conversation providers
 * 2. Render the persistent sidebar layout (V2Layout)
 * 3. Use Outlet to render child routes in the main content area
 */

import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LayoutProvider } from './context/LayoutContext';
import { ConversationsProvider } from './context/ConversationsContext';
import { V2Layout } from './components/layout';
import './styles/variables.css';
import './styles/globals.css';

const V2LayoutWrapper = () => {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <ConversationsProvider>
          <div className="v2-app">
            <V2Layout />
          </div>
        </ConversationsProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
};

export default V2LayoutWrapper;

