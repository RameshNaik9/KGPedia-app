/**
 * AcademicsAssistantWelcome - Academics Assistant welcome/new chat page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssistantWelcome, ASSISTANT_CONFIG } from '../components/assistant';
import { conversationApi } from '../services/assistantApi';
import { useConversations } from '../context/ConversationsContext';
import './CareerAssistantWelcome.css';

const AcademicsAssistantWelcome = () => {
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
    setPendingMessage(message);
    
    try {
      const config = ASSISTANT_CONFIG.academics;
      const createResponse = await conversationApi.create(config.id);
      const conversationId = createResponse.conversation_id;
      
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
      setActiveConversationId(conversationId);
      
      const messageResponse = await conversationApi.sendMessage(conversationId, message);
      
      if (messageResponse.chat_title && messageResponse.chat_title !== 'New Chat') {
        updateConversation(conversationId, {
          chat_title: messageResponse.chat_title,
          last_message_at: new Date().toISOString()
        });
      }
      
      navigate(`/home/v2/academics-assistant/${conversationId}`, { replace: true });
      
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setIsLoading(false);
      setPendingMessage(null);
    }
  };

  if (isLoading && pendingMessage) {
    return (
      <div className="welcome-loading">
        <div className="welcome-loading__content">
          <div className="welcome-loading__message">
            <div className="welcome-loading__bubble welcome-loading__bubble--user">
              {pendingMessage}
            </div>
          </div>
          <div className="welcome-loading__message">
            <div className="welcome-loading__bubble welcome-loading__bubble--assistant">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="typing-text">Academics Assistant is thinking...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AssistantWelcome 
      assistantType="academics" 
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
    />
  );
};

export default AcademicsAssistantWelcome;
