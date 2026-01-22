/**
 * Icon Component - SVG icon library for KGPedia v2
 * All icons are inline SVGs for maximum control and performance
 */

import React from 'react';

const icons = {
  // Navigation & UI
  plus: (
    <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  folder: (
    <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  ),
  emoji: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
      <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 10v6" strokeLinecap="round" />
      <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  alertTriangle: (
    <>
      <path d="M12 3l10 18H2L12 3z" strokeLinejoin="round" />
      <path d="M12 9v5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </>
  ),
  chat: (
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  ),
  
  // Group Chat
  groupChat: (
    <>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </>
  ),
  
  // AI Assistants
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </>
  ),
  graduationCap: (
    <>
      <path d="M22 10l-10-5L2 10l10 5 10-5z" />
      <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
      <path d="M22 10v6" strokeLinecap="round" />
    </>
  ),
  trophy: (
    <>
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" />
      <path d="M10 22V10a2 2 0 014 0v12" />
      <rect x="6" y="2" width="12" height="7" rx="1" />
    </>
  ),
  utensils: (
    <>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </>
  ),
  
  // Private Chat / Messages
  messageLock: (
    <>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      <rect x="9" y="9" width="6" height="5" rx="1" />
      <path d="M10 9V7a2 2 0 114 0v2" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </>
  ),
  
  // Arrows & Navigation
  send: (
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  arrowUp: (
    <path d="M12 19V5m0 0l-7 7m7-7l7 7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  arrowRight: (
    <path d="M5 12h14m0 0l-7-7m7 7l-7 7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  arrowLeft: (
    <path d="M19 12H5m0 0l7 7m-7-7l7-7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  chevronDown: (
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  chevronUp: (
    <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  chevronRight: (
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  chevronLeft: (
    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  
  // Layout Controls
  panelLeft: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </>
  ),
  panelLeftClose: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M14 9l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  panelLeftOpen: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M14 9l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  panelRight: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M15 3v18" />
    </>
  ),
  panelRightClose: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M15 3v18" />
      <path d="M10 9l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  panelRightOpen: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M15 3v18" />
      <path d="M10 9l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  maximize: (
    <>
      <path d="M8 3H5a2 2 0 00-2 2v3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 8V5a2 2 0 00-2-2h-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16v3a2 2 0 002 2h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 21h3a2 2 0 002-2v-3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  minimize: (
    <>
      <path d="M4 14h6v6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 10h-6V4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 10l7-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  fullscreen: (
    <>
      <path d="M3 8V5a2 2 0 012-2h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3h3a2 2 0 012 2v3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 16v3a2 2 0 01-2 2h-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 21H5a2 2 0 01-2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  exitFullscreen: (
    <>
      <path d="M8 3v4a1 1 0 01-1 1H3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 8h-4a1 1 0 01-1-1V3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16h4a1 1 0 011 1v4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 21v-4a1 1 0 011-1h4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  
  // Actions
  attachment: (
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" strokeLinecap="round" strokeLinejoin="round" />
  ),
  sparkles: (
    <>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" />
      <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </>
  ),
  thumbsUp: (
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
  ),
  thumbsUpFilled: (
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" fill="currentColor" />
  ),
  thumbsDown: (
    <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" />
  ),
  thumbsDownFilled: (
    <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" fill="currentColor" />
  ),
  star: (
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" strokeLinecap="round" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </>
  ),
  menu: (
    <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
  ),
  close: (
    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
  ),
  x: (
    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
  ),
  check: (
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  edit: (
    <>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    </>
  ),
  moreVertical: (
    <>
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="5" r="1" fill="currentColor" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </>
  ),
  messageCircle: (
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  ),
  starOff: (
    <>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      <path d="M2 2l20 20" strokeLinecap="round" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6M10 22h4" strokeLinecap="round" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A7 7 0 1012 19" />
    </>
  ),
  
  // User & Profile
  user: (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a7.5 7.5 0 0113 0" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" strokeLinecap="round" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
      <path d="M1 1l22 22" strokeLinecap="round" />
    </>
  ),
  
  // Theme
  moon: (
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
    </>
  ),
  
  // Misc
  dots: (
    <>
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="5" r="1" fill="currentColor" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </>
  ),
  dotsHorizontal: (
    <>
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </>
  ),
  refresh: (
    <>
      <path d="M23 4v6h-6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  archive: (
    <>
      <path d="M21 8v13H3V8" />
      <path d="M1 3h22v5H1z" />
      <path d="M10 12h4" strokeLinecap="round" />
    </>
  ),
  folderOpen: (
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  ),
  
  // KGPedia Logo (stylized K)
  kgpediaLogo: (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
      <path d="M8 7v10M8 12l6-5M8 12l6 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  
  // Additional icons for AI Models, Trending, Quick Actions
  crown: (
    <>
      <path d="M2 17l2-9 4 4 4-8 4 8 4-4 2 9H2z" strokeLinejoin="round" />
      <path d="M2 17h20v4H2z" strokeLinejoin="round" />
    </>
  ),
  zap: (
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" />
  ),
  fire: (
    <path d="M12 2c.5 3-2 5-2 8 0 2 2 4 4 4s4-1 4-4c0-4-5-8-6-10 0 4-4 5-4 8 0 1.5 1 3 3 3" strokeLinejoin="round" />
  ),
  trendingUp: (
    <>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points="17 6 23 6 23 12" strokeLinejoin="round" strokeLinecap="round" />
    </>
  ),
  map: (
    <>
      <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
      <path d="M8 2v16" />
      <path d="M16 6v16" />
    </>
  ),
  layers: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" strokeLinejoin="round" />
      <polyline points="2 17 12 22 22 17" strokeLinejoin="round" />
      <polyline points="2 12 12 17 22 12" strokeLinejoin="round" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </>
  ),
};

const Icon = ({
  name,
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.75,
  className = '',
  style = {},
  ...props
}) => {
  const iconPath = icons[name];
  
  if (!iconPath) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      className={`icon icon-${name} ${className}`}
      style={{ flexShrink: 0, ...style }}
      {...props}
    >
      {iconPath}
    </svg>
  );
};

export default Icon;
