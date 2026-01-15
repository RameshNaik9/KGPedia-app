/**
 * GymkhanaAssistantPage v2 - Conversation page for Gymkhana Assistant
 * 
 * Features:
 * 1. SSE Streaming for real-time AI responses
 * 2. Markdown rendering with proper formatting
 * 3. Optimistic UI updates
 * 4. Feedback integration (like/dislike)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatContainer } from '../components/chat';
import { conversationApi, streamResponse } from '../services/assistantApi';
import { useConversations } from '../context/ConversationsContext';
import './CareerAssistantPage.css';

const GymkhanaAssistantPage = () => {
  const { conversation_id } = useParams();
  const navigate = useNavigate();
  const { updateConversation, setActiveConversationId } = useConversations();
  
  const [messages, setMessages] = useState([]);
  const [chatTitle, setChatTitle] = useState(null);
  const [conversationDate, setConversationDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const chatContainerRef = useRef(null);
  const eventSourceRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    chatContainerRef.current?.scrollToBottom?.();
  }, []);

  useEffect(() => {
    if (conversation_id) {
      setActiveConversationId(conversation_id);
    }
  }, [conversation_id, setActiveConversationId]);

  // Set browser tab title (document.title)
  useEffect(() => {
    const baseTitle = 'KGPedia';
    if (chatTitle && chatTitle !== 'New Chat') {
      document.title = `${chatTitle} - ${baseTitle}`;
    } else {
      document.title = `Gymkhana Assistant - ${baseTitle}`;
    }
    return () => { document.title = baseTitle; };
  }, [chatTitle]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!conversation_id) {
        setMessages([]);
        setChatTitle(null);
        setConversationDate(null);
        setIsInitialLoading(false);
        return;
      }

      try {
        setIsInitialLoading(true);
        const data = await conversationApi.getById(conversation_id);
        
        setChatTitle(data.chat_title || null);
        setConversationDate(data.createdAt || null);
        
        const transformedMessages = [];
        data.messages?.forEach((msg, index) => {
          if (msg.user_message?.content) {
            transformedMessages.push({
              id: `${conversation_id}-${index}-user`,
              role: 'user',
              content: msg.user_message.content,
              timestamp: new Date(msg.user_message.timestamp || Date.now())
            });
          }
          if (msg.assistant_response?.content) {
            transformedMessages.push({
              id: `${conversation_id}-${index}-assistant`,
              messageId: msg.message_id,
              role: 'assistant',
              content: msg.assistant_response.content,
              feedback: msg.feedback || 2.5,
              timestamp: new Date(msg.assistant_response.timestamp || Date.now())
            });
          }
        });

        setMessages(transformedMessages);
      } catch (err) {
        console.error('[GymkhanaAssistant] Failed to load messages:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadMessages();
  }, [conversation_id]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const handleSendMessage = useCallback(async (content) => {
    if (!content.trim() || !conversation_id) return;

    const trimmedContent = content.trim();
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    const newUserMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmedContent,
      timestamp: new Date()
    };
    
    setMessages(currentMessages => [...currentMessages, newUserMessage]);
    setIsLoading(true);

    try {
      const postPromise = conversationApi.sendMessage(conversation_id, trimmedContent);

      const newAssistantMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };
      setMessages(currentMessages => [...currentMessages, newAssistantMessage]);
      setStreamingMessageId(assistantMessageId);
      setIsStreaming(true);
      setIsLoading(false);

      eventSourceRef.current = streamResponse(
        conversation_id,
        (chunk) => {
          setMessages(currentMessages => 
            currentMessages.map(msg => 
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunk + '\n' }
                : msg
            )
          );
          scrollToBottom();
        },
        async () => {
          try {
            const response = await postPromise;
            
            setMessages(currentMessages => 
              currentMessages.map(msg => 
                msg.id === assistantMessageId
                  ? { 
                      ...msg, 
                      content: response.assistant_response?.content || msg.content,
                      messageId: response.message_id
                    }
                  : msg
              )
            );

            if (response.chat_title && response.chat_title !== 'New Chat') {
              setChatTitle(response.chat_title);
              updateConversation(conversation_id, {
                chat_title: response.chat_title,
                last_message_at: new Date().toISOString()
              });
            }
          } catch (err) {
            console.error('[SSE] Error getting final response:', err);
          }
          
          setIsStreaming(false);
          setStreamingMessageId(null);
          scrollToBottom();
        },
        (error) => {
          console.error('[SSE] Stream error:', error);
          setIsStreaming(false);
          setStreamingMessageId(null);
        }
      );

    } catch (err) {
      console.error('[GymkhanaAssistant] Failed to send message:', err);
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessageId(null);
      setMessages(currentMessages => 
        currentMessages.filter(msg => msg.id !== userMessageId && msg.id !== assistantMessageId)
      );
    }
  }, [conversation_id, updateConversation, scrollToBottom]);

  const handleNewChat = useCallback(() => {
    navigate('/v2/gymkhana-assistant');
  }, [navigate]);

  const handleRefresh = useCallback((message) => {
    console.log('Regenerate response for:', message);
  }, []);

  if (isInitialLoading) {
    return (
      <div className="conversation-loading">
        <div className="loading-spinner" />
        <p>Loading conversation...</p>
      </div>
    );
  }

  return (
    <ChatContainer
      ref={chatContainerRef}
      title="Gymkhana Assistant"
      chatTitle={chatTitle}
      conversationDate={conversationDate}
      messages={messages}
      isLoading={isLoading}
      isStreaming={isStreaming}
      streamingMessageId={streamingMessageId}
      onSendMessage={handleSendMessage}
      onNewChat={handleNewChat}
      onRefresh={handleRefresh}
      placeholder="Ask me anything about gymkhana, fests, clubs..."
    />
  );
};

export default GymkhanaAssistantPage;
