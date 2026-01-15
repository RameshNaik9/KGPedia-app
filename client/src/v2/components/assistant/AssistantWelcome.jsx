/**
 * AssistantWelcome - Reusable welcome/intro page for AI assistants
 * Shows when starting a new chat (no conversation selected)
 * 
 * Layout:
 * - Top: Assistant illustration/image + info
 * - Bottom: Recommended questions + Message input (same as conversation page)
 */

import React, { useState, useRef, useEffect } from 'react';
import Icon from '../ui/Icon';
import './AssistantWelcome.css';

// Assistant configurations
export const ASSISTANT_CONFIG = {
  career: {
    id: 'Career',
    name: 'Career Assistant',
    tagline: 'Your guide to placements, internships & career growth',
    description: 'Get personalized career advice, interview tips, resume reviews, and guidance on navigating the placement season at IIT Kharagpur.',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '💼',
    placeholder: 'Ask about placements, interviews, resume tips...',
    recommendations: [
      'How do I prepare for placement season?',
      'What skills are companies looking for?',
      'Review my resume for software roles',
      'Tips for technical interviews',
      'How to choose between offers?',
      'Best resources for coding practice'
    ]
  },
  academics: {
    id: 'Academics',
    name: 'Academics Assistant',
    tagline: 'Master your courses & excel in academics',
    description: 'Get help with course selection, study strategies, understanding concepts, and academic planning throughout your journey at KGP.',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    icon: '📚',
    placeholder: 'Ask about courses, exams, study tips...',
    recommendations: [
      'Best electives for CSE students?',
      'How to manage course load?',
      'Explain breadth vs depth courses',
      'Tips for mid-semester preparation',
      'How does CGPA calculation work?',
      'Resources for learning DSA'
    ]
  },
  gymkhana: {
    id: 'Gymkhana',
    name: 'Gymkhana Assistant',
    tagline: 'Explore clubs, events & campus activities',
    description: 'Discover opportunities in Technology, Social & Cultural, and Sports Gymkhana. Get info about fests, competitions, and how to get involved.',
    gradient: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
    icon: '🏆',
    placeholder: 'Ask about clubs, fests, events...',
    recommendations: [
      'What are the major tech clubs?',
      'How to join a Gymkhana society?',
      'Tell me about Spring Fest',
      'Sports facilities at KGP',
      'How to organize an event?',
      'Upcoming competitions this semester'
    ]
  },
  bhaat: {
    id: 'Bhaat',
    name: 'Bhaat Assistant',
    tagline: 'Casual convos about campus life & beyond',
    description: 'Chat about anything and everything - from hostel life and mess food to late-night maggi runs and KGP culture. Your friendly campus companion!',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '💬',
    placeholder: 'Let\'s bhaat about anything...',
    recommendations: [
      'Best places to eat near campus?',
      'Tell me some KGP lingo',
      'Night canteen recommendations',
      'How to survive first semester?',
      'Fun things to do on weekends',
      'Best chai spots in KGP'
    ]
  }
};

const AssistantWelcome = ({ 
  assistantType = 'career', 
  onSendMessage,
  isLoading = false 
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  
  const config = ASSISTANT_CONFIG[assistantType] || ASSISTANT_CONFIG.career;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage?.(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleRecommendationClick = (question) => {
    if (!isLoading) {
      onSendMessage?.(question);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="assistant-welcome">
      {/* Top Section - Hero */}
      <div className="assistant-welcome__hero">
        {/* Gradient Background */}
        <div 
          className="assistant-welcome__gradient"
          style={{ background: config.gradient }}
        >
          <div className="gradient-orb gradient-orb--1"></div>
          <div className="gradient-orb gradient-orb--2"></div>
        </div>

        {/* Icon */}
        <div className="assistant-welcome__icon">
          <span className="icon-emoji">{config.icon}</span>
        </div>
        
        {/* Info */}
        <div className="assistant-welcome__info">
          <h1 className="assistant-welcome__title">{config.name}</h1>
          <p className="assistant-welcome__tagline">{config.tagline}</p>
          <p className="assistant-welcome__description">{config.description}</p>
        </div>
      </div>

      {/* Bottom Section - Input Area */}
      <div className="assistant-welcome__input-area">
        {/* Recommendations */}
        <div className="assistant-welcome__recommendations">
          <p className="recommendations__label">
            <Icon name="sparkles" size={14} />
            <span>Try asking</span>
          </p>
          <div className="recommendations__grid">
            {config.recommendations.map((question, index) => (
              <button
                key={index}
                className="recommendation-chip"
                onClick={() => handleRecommendationClick(question)}
                disabled={isLoading}
              >
                <span className="recommendation-chip__text">{question}</span>
                <Icon name="arrowRight" size={14} className="recommendation-chip__arrow" />
              </button>
            ))}
          </div>
        </div>

        {/* Message Input - Same style as conversation page */}
        <div className="chat-input-container">
          <form className="chat-input-form" onSubmit={handleSubmit}>
            {/* Attachment Button */}
            <button
              type="button"
              className="input-action attachment-btn"
              aria-label="Add attachment"
              disabled={isLoading}
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
                placeholder={config.placeholder}
                disabled={isLoading}
                rows={1}
                aria-label="Message input"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              className={`input-action send-btn ${message.trim() ? 'active' : ''}`}
              disabled={!message.trim() || isLoading}
              aria-label="Send message"
            >
              {isLoading ? (
                <span className="loading-spinner" />
              ) : (
                <Icon name="arrowUp" size={18} />
              )}
            </button>
          </form>
          <p className="input-hint">
            Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssistantWelcome;
