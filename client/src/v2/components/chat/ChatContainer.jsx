/**
 * ChatContainer - Main chat interface wrapper
 * Contains header, messages area, and input
 * Supports streaming messages with real-time updates
 */

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import './ChatContainer.css';

const ChatContainer = forwardRef(({
  title = 'aero',
  chatTitle = null, // Specific conversation title
  conversationDate = null, // Conversation creation date
  messages = [],
  isLoading = false,
  isStreaming = false,
  streamingMessageId = null,
  onSendMessage,
  onTogglePanel,
  onRefresh,
  placeholder = 'Ask aero anything...'
}, ref) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Find the index of the last assistant message
  const lastAssistantIndex = messages.reduce((lastIdx, msg, idx) => 
    msg.role === 'assistant' ? idx : lastIdx, -1
  );

  // Expose scroll method to parent
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }));

  // Auto-scroll to bottom on new messages or when streaming
  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [messages.length, isStreaming]);

  // Also scroll when content changes during streaming
  useEffect(() => {
    if (isStreaming && streamingMessageId) {
      const streamingMsg = messages.find(m => m.id === streamingMessageId);
      if (streamingMsg?.content) {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }
  }, [messages, isStreaming, streamingMessageId]);

  return (
    <div className="chat-container">
      {/* Header */}
      <ChatHeader 
        assistantName={title}
        chatTitle={chatTitle}
        conversationDate={conversationDate}
        onTogglePanel={onTogglePanel}
      />

      {/* Messages Area */}
      <div className="chat-messages" ref={messagesContainerRef}>
        <div className="messages-inner">
          {messages.length === 0 && !isLoading && (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <p className="chat-empty-title">Start a conversation</p>
              <p className="chat-empty-text">Send a message to begin chatting</p>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <ChatMessage
              key={msg.id || index}
              message={msg}
              isUser={msg.role === 'user'}
              isStreaming={isStreaming && msg.id === streamingMessageId}
              showActions={msg.role === 'assistant' && !!msg.content && !isStreaming}
              isLatestResponse={msg.role === 'assistant' && index === lastAssistantIndex}
              onRefresh={onRefresh}
            />
          ))}
          
          {/* Loading indicator - show when loading but not streaming yet */}
          {isLoading && !isStreaming && (
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
        isLoading={isLoading || isStreaming}
      />
    </div>
  );
});

ChatContainer.displayName = 'ChatContainer';

export default ChatContainer;


