/**
 * ChatInput - Message input bar matching Aero design
 * Features attachment button, text input, send button
 */

import React, { useState, useRef, useEffect } from 'react';
import Icon from '../ui/Icon';
import './ChatInput.css';

const ChatInput = ({ 
  onSend,
  placeholder = 'Ask aero anything...',
  disabled = false,
  isLoading = false
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message.trim() && !disabled && !isLoading) {
      onSend?.(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAttachment = () => {
    // TODO: Implement attachment functionality
    console.log('Attachment clicked');
  };

  return (
    <div className="chat-input-container">
      <form className="chat-input-form" onSubmit={handleSubmit}>
        {/* Attachment Button */}
        <button
          type="button"
          className="input-action attachment-btn"
          onClick={handleAttachment}
          aria-label="Add attachment"
          disabled={disabled}
        >
          <Icon name="attachment" size={18} />
        </button>

        {/* Text Input */}
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            aria-label="Message input"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className={`input-action send-btn ${message.trim() ? 'active' : ''}`}
          disabled={!message.trim() || disabled || isLoading}
          aria-label="Send message"
        >
          {isLoading ? (
            <span className="loading-spinner" />
          ) : (
            <Icon name="arrowUp" size={18} />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;

