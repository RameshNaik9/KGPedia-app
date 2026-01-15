/**
 * CareerAssistantWelcome - Career Assistant welcome/new chat page
 * 
 * Flow:
 * 1. User sees intro page with recommendations + input
 * 2. User sends message
 * 3. Show loading state with user's message visible
 * 4. Create conversation, send message, wait for response
 * 5. Navigate to conversation page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssistantWelcome, ASSISTANT_CONFIG } from '../components/assistant';
import { conversationApi } from '../services/assistantApi';
import { useConversations } from '../context/ConversationsContext';
import './CareerAssistantWelcome.css';

const CareerAssistantWelcome = () => {
  const navigate = useNavigate();
  const { addConversation, updateConversation, setActiveConversationId } = useConversations();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);

  // Clear active conversation highlight when on welcome page
  useEffect(() => {
    setActiveConversationId(null);
  }, [setActiveConversationId]);

  const handleSendMessage = async (message) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setPendingMessage(message); // Show user's message in loading state
    
    try {
      const config = ASSISTANT_CONFIG.career;
      
      // 1. Create new conversation
      const createResponse = await conversationApi.create(config.id);
      const conversationId = createResponse.conversation_id;
      
      // 2. Add to conversations list with temp title & set as active
      const tempTitle = message.slice(0, 50) + (message.length > 50 ? '...' : '');
      addConversation({
        _id: conversationId,
        chat_profile: config.id,
        chat_title: tempTitle,
        status: 'active',
        is_starred: false,
        createdAt: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      });
      setActiveConversationId(conversationId); // Highlight new conversation
      
      // 3. Send message and wait for response
      const messageResponse = await conversationApi.sendMessage(conversationId, message);
      
      // 4. Update conversation title if AI generated one
      if (messageResponse.chat_title && messageResponse.chat_title !== 'New Chat') {
        updateConversation(conversationId, {
          chat_title: messageResponse.chat_title,
          last_message_at: new Date().toISOString()
        });
      }
      
      // 5. Navigate to conversation page
      navigate(`/home/v2/career-assistant/${conversationId}`, { replace: true });
      
    } catch (error) {
      console.error('[CareerWelcome] Failed:', error);
      setIsLoading(false);
      setPendingMessage(null);
    }
  };

  // Show loading state with user's message
  if (isLoading && pendingMessage) {
    return (
      <div className="welcome-loading">
        <div className="welcome-loading__content">
          {/* User's message bubble */}
          <div className="welcome-loading__message">
            <div className="welcome-loading__bubble welcome-loading__bubble--user">
              {pendingMessage}
            </div>
          </div>
          
          {/* Typing indicator */}
          <div className="welcome-loading__message">
            <div className="welcome-loading__bubble welcome-loading__bubble--assistant">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="typing-text">Career Assistant is thinking...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AssistantWelcome 
      assistantType="career" 
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
    />
  );
};

export default CareerAssistantWelcome;
