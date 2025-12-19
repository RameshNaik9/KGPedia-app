/**
 * ChatMessage - Individual message bubble
 * Supports user messages, assistant messages with images
 */

import React, { useState } from 'react';
import Icon from '../ui/Icon';
import './ChatMessage.css';

const ChatMessage = ({ 
  message,
  isUser = false,
  showActions = true,
  onCopy,
  onLike,
  onDislike
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      onCopy?.(message);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setIsDisliked(false);
    onLike?.(message, !isLiked);
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    setIsLiked(false);
    onDislike?.(message, !isDisliked);
  };

  return (
    <div className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'}`}>
      <div className="message-wrapper">
        {/* Message Actions (for assistant messages) */}
        {!isUser && showActions && (
          <div className="message-actions">
            <button 
              className="action-btn"
              onClick={() => {}}
              title="More options"
              aria-label="More options"
            >
              <Icon name="dotsHorizontal" size={16} />
            </button>
            <button 
              className="action-btn"
              onClick={handleCopy}
              title="Copy"
              aria-label="Copy message"
            >
              <Icon name="copy" size={16} />
            </button>
            <button 
              className={`action-btn ${isLiked ? 'active' : ''}`}
              onClick={handleLike}
              title="Like"
              aria-label="Like message"
            >
              <Icon name="thumbsUp" size={16} />
            </button>
            <button 
              className={`action-btn ${isDisliked ? 'active' : ''}`}
              onClick={handleDislike}
              title="Dislike"
              aria-label="Dislike message"
            >
              <Icon name="thumbsDown" size={16} />
            </button>
          </div>
        )}

        {/* Message Content */}
        <div className="message-bubble">
          {message.content && (
            <p className="message-text">{message.content}</p>
          )}
          
          {/* Image Attachment */}
          {message.image && (
            <div className="message-image">
              <img src={message.image} alt={message.imageAlt || 'Attached image'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

