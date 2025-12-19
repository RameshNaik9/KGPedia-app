/**
 * ChatContainer - Main chat interface wrapper
 * Contains header, messages area, and input
 */

import React, { useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import './ChatContainer.css';

const ChatContainer = ({
  title = 'aero',
  messages = [],
  isLoading = false,
  onSendMessage,
  onTogglePanel,
  placeholder = 'Ask aero anything...'
}) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container">
      {/* Header */}
      <ChatHeader 
        title={title}
        onTogglePanel={onTogglePanel}
      />

      {/* Messages Area */}
      <div className="chat-messages">
        <div className="messages-inner">
          {messages.map((msg, index) => (
            <ChatMessage
              key={msg.id || index}
              message={msg}
              isUser={msg.role === 'user'}
              showActions={msg.role === 'assistant'}
            />
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        placeholder={placeholder}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatContainer;

