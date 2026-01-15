/**
 * ChatMessage - Individual message component
 * User messages: Right-aligned bubble
 * Assistant messages: Full-width with markdown, no box border
 * Includes Web3-styled action buttons for assistant messages
 */

import React, { useState, useCallback } from 'react';
import Icon from '../ui/Icon';
import MarkdownRenderer from './MarkdownRenderer';
import { conversationApi } from '../../services/assistantApi';
import './ChatMessage.css';

const ChatMessage = ({ 
  message,
  isUser = false,
  isStreaming = false,
  showActions = true,
  isLatestResponse = false, // New prop to always show actions for latest response
  onRefresh
}) => {
  const [feedback, setFeedback] = useState(message.feedback || 2.5);
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Handle copy to clipboard
  const handleCopy = useCallback(() => {
    if (message.content) {
      navigator.clipboard.writeText(message.content).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  }, [message.content]);

  // Handle feedback (like = 5, dislike = 1, neutral = 2.5)
  const handleFeedback = useCallback(async (newRating) => {
    // Don't submit feedback for temp messages or while submitting
    if (message.id?.startsWith('temp-') || message.id?.startsWith('user-') || isSubmittingFeedback) {
      return;
    }

    // Toggle: if same rating, reset to neutral
    const finalRating = feedback === newRating ? 2.5 : newRating;
    
    setIsSubmittingFeedback(true);
    setFeedback(finalRating);

    try {
      // Extract actual message ID (remove prefix if present)
      const messageId = message.messageId || message.id;
      await conversationApi.submitFeedback(messageId, finalRating);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      // Revert on error
      setFeedback(feedback);
    } finally {
      setIsSubmittingFeedback(false);
    }
  }, [message.id, message.messageId, feedback, isSubmittingFeedback]);

  // Render User Message
  if (isUser) {
    return (
      <div className="chat-message chat-message--user">
        <div className="user-message-bubble">
          <span className="user-message-text">{message.content}</span>
        </div>
      </div>
    );
  }

  // Render Assistant Message
  return (
    <div className={`chat-message chat-message--assistant ${isLatestResponse ? 'is-latest' : ''}`}>
      {/* Assistant Avatar */}
      <div className={`assistant-avatar ${isStreaming ? 'is-streaming' : ''}`}>
        <img 
          src="/icons/img1-icon.png" 
          alt="KGPedia Assistant" 
          className="avatar-image"
        />
      </div>

      {/* Message Content */}
      <div className="assistant-message-content">
        <MarkdownRenderer 
          content={message.content} 
          isStreaming={isStreaming} 
        />

        {/* Action Buttons - Only show when not streaming and has content */}
        {showActions && !isStreaming && message.content && (
          <div className="message-action-bar">
            {/* Copy Button */}
            <button 
              className={`action-pill ${isCopied ? 'is-copied' : ''}`}
              onClick={handleCopy}
              title={isCopied ? 'Copied!' : 'Copy'}
              aria-label="Copy message"
            >
              <Icon name={isCopied ? 'check' : 'copy'} size={14} />
              <span className="action-label">{isCopied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Like Button */}
            <button 
              className={`action-pill ${feedback === 5 ? 'is-active is-liked' : ''}`}
              onClick={() => handleFeedback(5)}
              title="Helpful"
              aria-label="Mark as helpful"
              disabled={isSubmittingFeedback}
            >
              <Icon name={feedback === 5 ? 'thumbsUpFilled' : 'thumbsUp'} size={14} />
              <span className="action-label">Helpful</span>
            </button>

            {/* Dislike Button */}
            <button 
              className={`action-pill ${feedback === 1 ? 'is-active is-disliked' : ''}`}
              onClick={() => handleFeedback(1)}
              title="Not helpful"
              aria-label="Mark as not helpful"
              disabled={isSubmittingFeedback}
            >
              <Icon name={feedback === 1 ? 'thumbsDownFilled' : 'thumbsDown'} size={14} />
              <span className="action-label">Not helpful</span>
            </button>

            {/* Refresh Button */}
            {onRefresh && (
              <button 
                className="action-pill"
                onClick={() => onRefresh(message)}
                title="Regenerate"
                aria-label="Regenerate response"
              >
                <Icon name="refresh" size={14} />
                <span className="action-label">Retry</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
