/**
 * V2 Module - Main entry point
 */

// App Wrapper
export { default as V2App } from './V2App';

// Context
export { ThemeProvider, useTheme, LayoutProvider, useLayout, LAYOUT_MODES } from './context';

// Layout Components
export { MainLayout, LeftSidebar, RightPanel, LayoutControls } from './components/layout';

// Chat Components
export { ChatContainer, ChatHeader, ChatInput, ChatMessage } from './components/chat';

// UI Components
export { Icon } from './components/ui';

// Pages
export { default as CareerAssistantPageV2 } from './pages/CareerAssistantPage';
