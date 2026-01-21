/**
 * V2 Module - Main entry point
 */

// App Wrapper
export { default as V2App } from './V2App';
export { default as V2LayoutWrapper } from './V2LayoutWrapper';

// Context
export { 
  ThemeProvider, 
  useTheme, 
  LayoutProvider, 
  useLayout, 
  LAYOUT_MODES,
  ConversationsProvider,
  useConversations
} from './context';

// Layout Components
export { MainLayout, LeftSidebar, RightPanel, LayoutControls } from './components/layout';

// Chat Components
export { ChatContainer, ChatHeader, ChatInput, ChatMessage } from './components/chat';

// UI Components
export { Icon } from './components/ui';

// Assistant Components
export { AssistantWelcome } from './components/assistant';

// AI Components
export { AIModels } from './components/ai';

// Conversations Components
export { ConversationsHub } from './components/conversations';

// Services
export { conversationApi } from './services';

// Pages
export { 
  AuthPage as AuthPageV2,
  HomePage as HomePageV2,
  CareerAssistantPage as CareerAssistantPageV2,
  CareerAssistantWelcome as CareerAssistantWelcomeV2,
  AcademicsAssistantPage as AcademicsAssistantPageV2,
  AcademicsAssistantWelcome as AcademicsAssistantWelcomeV2,
  GymkhanaAssistantPage as GymkhanaAssistantPageV2,
  GymkhanaAssistantWelcome as GymkhanaAssistantWelcomeV2,
  BhaatAssistantPage as BhaatAssistantPageV2,
  BhaatAssistantWelcome as BhaatAssistantWelcomeV2
} from './pages';
