/**
 * CareerAssistantPage v2 - Career Guide Assistant
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MainLayout } from '../components/layout';
import { ChatContainer } from '../components/chat';
import './CareerAssistantPage.css';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://kgpedia-app.azurewebsites.net';

const CareerAssistantPage = () => {
  const { conversation_id } = useParams();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) return;

        const response = await axios.get(
          `${apiBaseUrl}/api/assistant/conversations/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setConversations(response.data.map(conv => ({
          id: conv._id,
          title: conv.title || 'New Conversation',
          timestamp: new Date(conv.updatedAt)
        })));
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };

    loadConversations();
  }, []);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversation_id) {
        setMessages([]);
        return;
      }

      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(
          `${apiBaseUrl}/api/assistant/conversation/${conversation_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const transformedMessages = response.data.messages?.map((msg, index) => ({
          id: `${conversation_id}-${index}`,
          role: msg.user_message ? 'user' : 'assistant',
          content: msg.user_message?.content || msg.assistant_response?.content || '',
          timestamp: new Date(msg.timestamp || Date.now())
        })).filter(msg => msg.content) || [];

        setMessages(transformedMessages);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [conversation_id]);

  const handleNewChat = useCallback(async () => {
    navigate('/v2/career-assistant');
    setMessages([]);
  }, [navigate]);

  const handleConversationSelect = useCallback((convId) => {
    navigate(`/v2/career-assistant/${convId}`);
  }, [navigate]);

  const handleSendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let currentConversationId = conversation_id;

      if (!currentConversationId) {
        const createResponse = await axios.post(
          `${apiBaseUrl}/api/assistant/conversation`,
          { 
            user_id: userId,
            user_message: { content: content.trim() }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        currentConversationId = createResponse.data.conversation_id;
        navigate(`/v2/career-assistant/${currentConversationId}`, { replace: true });
      } else {
        await axios.post(
          `${apiBaseUrl}/api/assistant/${currentConversationId}`,
          { user_message: { content: content.trim() } },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const eventSource = new EventSource(
        `${apiBaseUrl}/api/assistant/stream-response/${currentConversationId}?token=${token}`
      );

      const assistantMessageId = `assistant-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }]);

      eventSource.onmessage = (event) => {
        if (event.data.trim()) {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + event.data + '\n' }
              : msg
          ));
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsLoading(false);
      };

      eventSource.addEventListener('end', () => {
        eventSource.close();
        setIsLoading(false);
      });

    } catch (err) {
      console.error('Failed to send message:', err);
      setIsLoading(false);
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    }
  }, [conversation_id, navigate]);

  // Demo messages
  const demoMessages = messages.length > 0 ? messages : [
    {
      id: 'demo-1',
      role: 'user',
      content: 'Create a minimalist bedroom, with all walls painted in a muted olive green color. A floor-to-ceiling window on the left side of the room offers a view of the forest.',
      timestamp: new Date()
    },
    {
      id: 'demo-2',
      role: 'assistant',
      content: 'Here is the minimalist bedroom design with muted olive green walls, a view of the forest through a floor-to-ceiling window, and the oak wood bed with grey linen sheets. Let me know your thoughts!',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=60',
      imageAlt: 'Minimalist bedroom with olive green walls',
      timestamp: new Date()
    }
  ];

  return (
    <MainLayout
      conversations={conversations}
      activeConversationId={conversation_id}
      onConversationSelect={handleConversationSelect}
      onNewChat={handleNewChat}
    >
      <ChatContainer
        title="KGPedia"
        messages={demoMessages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        placeholder="Ask me anything about careers..."
      />
    </MainLayout>
  );
};

export default CareerAssistantPage;
