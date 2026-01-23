// /**
//  * MainLayout - Primary layout wrapper
//  * 
//  * Modes:
//  * - Standard View: Both sidebars visible
//  * - Expand Left: Right hidden, content expands right
//  * - Expand Right: Left hidden, content expands left
//  * - Focus Mode: Both hidden, full content
//  */

// import React from 'react';
// import LeftSidebar from './LeftSidebar';
// import RightPanel from './RightPanel';
// import { useLayout, LAYOUT_MODES } from '../../context/LayoutContext';
// // import './MainLayout.css';  // Disabled - using MainLayoutNew.css via V2Layout instead

// const MainLayout = ({ 
//   children,
//   showRightPanel = true,
//   conversations = [],
//   collections = [],
//   activeConversationId,
//   onConversationSelect,
//   onCollectionSelect,
//   onNewChat
// }) => {
//   const { 
//     layoutMode, 
//     isLeftSidebarVisible, 
//     isRightPanelVisible,
//     isLeftSidebarExpanded,
//     isFocusMode
//   } = useLayout();

//   // Generate layout class names
//   const getLayoutClasses = () => {
//     const classes = ['main-layout'];
    
//     // Layout mode
//     classes.push(`layout-mode--${layoutMode}`);
    
//     // State classes
//     if (!isLeftSidebarVisible) classes.push('left-hidden');
//     if (!isRightPanelVisible) classes.push('right-hidden');
//     if (isLeftSidebarExpanded) classes.push('left-expanded');
//     if (isFocusMode) classes.push('is-focus-mode');
    
//     return classes.join(' ');
//   };

//   return (
//     <div className={getLayoutClasses()}>
//       {/* Left Sidebar - Always in DOM for smooth animations */}
//       <LeftSidebar onNewChat={onNewChat} />

//       {/* Main Content Area */}
//       <main className="main-content">
//         <div className="main-content__inner">
//           {children}
//         </div>
//       </main>

//       {/* Right Panel - Always in DOM for smooth animations */}
//       {showRightPanel && (
//         <RightPanel
//           conversations={conversations}
//           collections={collections}
//           activeConversationId={activeConversationId}
//           onConversationSelect={onConversationSelect}
//           onCollectionSelect={onCollectionSelect}
//         />
//       )}
//     </div>
//   );
// };

// export default MainLayout;
