/**
 * ConversationsContext - Global state for conversations
 * Manages fetching, caching, and updating conversations
 * Now also manages collections and collection filtering
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { conversationApi, collectionApi } from '../services/assistantApi';

const ConversationsContext = createContext(null);

export const useConversations = () => {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error('useConversations must be used within ConversationsProvider');
  }
  return context;
};

export const ConversationsProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Collections state
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);

  /**
   * Fetch all conversations from API
   */
  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await conversationApi.getAll();
      // Sort by last_message_at (most recent first)
      const sorted = data.sort((a, b) => 
        new Date(b.last_message_at || b.createdAt) - new Date(a.last_message_at || a.createdAt)
      );
      setConversations(sorted);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch collections for a specific assistant type
   */
  const fetchCollections = useCallback(async (chatProfile) => {
    if (!chatProfile) return;
    
    setCollectionsLoading(true);
    try {
      const data = await collectionApi.getAll(chatProfile);
      setCollections(data);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  /**
   * Move a conversation to a collection
   */
  const moveConversationToCollection = useCallback(async (conversationId, collectionId) => {
    try {
      console.log('[Context] Moving conversation:', conversationId, 'to collection:', collectionId);
      
      const result = await collectionApi.moveConversation(conversationId, collectionId);
      console.log('[Context] Move API result:', result);
      
      // Update conversation in state with the collection ID
      // Ensure we store the string ID, not ObjectId
      const collectionIdStr = collectionId ? String(collectionId) : null;
      
      setConversations(prev => 
        prev.map(c => c._id === conversationId ? { ...c, collectionId: collectionIdStr } : c)
      );
      
      // Refresh collections to update counts
      const conv = conversations.find(c => c._id === conversationId);
      if (conv) {
        await fetchCollections(conv.chat_profile);
      }
      
      console.log('[Context] Move completed successfully');
      return true;
    } catch (err) {
      console.error('[Context] Failed to move conversation:', err);
      console.error('[Context] Error details:', err.response?.data || err.message);
      return false;
    }
  }, [conversations, fetchCollections]);

  /**
   * Select/deselect a collection for filtering
   */
  const selectCollection = useCallback((collectionId) => {
    setSelectedCollectionId(prev => prev === collectionId ? null : collectionId);
  }, []);

  /**
   * Clear collection filter
   */
  const clearCollectionFilter = useCallback(() => {
    setSelectedCollectionId(null);
  }, []);

  /**
   * Rename a conversation
   */
  const renameConversation = useCallback(async (conversationId, newTitle) => {
    try {
      await conversationApi.rename(conversationId, newTitle);
      setConversations(prev => 
        prev.map(c => c._id === conversationId ? { ...c, chat_title: newTitle } : c)
      );
      return true;
    } catch (err) {
      console.error('Failed to rename conversation:', err);
      return false;
    }
  }, []);

  /**
   * Toggle star status
   */
  const toggleStar = useCallback(async (conversationId) => {
    try {
      const result = await conversationApi.toggleStar(conversationId);
      setConversations(prev => 
        prev.map(c => c._id === conversationId ? { ...c, is_starred: result.is_starred } : c)
      );
      return true;
    } catch (err) {
      console.error('Failed to toggle star:', err);
      return false;
    }
  }, []);

  /**
   * Archive a conversation
   */
  const archiveConversation = useCallback(async (conversationId) => {
    try {
      await conversationApi.archive(conversationId);
      setConversations(prev => 
        prev.map(c => c._id === conversationId ? { ...c, status: 'archived' } : c)
      );
      return true;
    } catch (err) {
      console.error('Failed to archive conversation:', err);
      return false;
    }
  }, []);

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback(async (conversationId) => {
    try {
      await conversationApi.delete(conversationId);
      setConversations(prev => prev.filter(c => c._id !== conversationId));
      return true;
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      return false;
    }
  }, []);

  /**
   * Add a new conversation to the list
   */
  const addConversation = useCallback((conversation) => {
    setConversations(prev => [conversation, ...prev]);
  }, []);

  /**
   * Update a conversation in the list
   */
  const updateConversation = useCallback((conversationId, updates) => {
    setConversations(prev => 
      prev.map(c => c._id === conversationId ? { ...c, ...updates } : c)
    );
  }, []);

  /**
   * Filtered and categorized conversations
   * Respects search query and collection filter
   */
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.chat_title?.toLowerCase().includes(query) ||
        c.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply collection filter
    // Handle both string IDs and ObjectId objects
    if (selectedCollectionId) {
      filtered = filtered.filter(c => {
        const convCollection = c.collectionId?._id || c.collectionId;
        return String(convCollection) === String(selectedCollectionId);
      });
    }

    return {
      all: filtered,
      recent: filtered.filter(c => c.status === 'active'),
      starred: filtered.filter(c => c.is_starred && c.status !== 'archived'),
      archived: filtered.filter(c => c.status === 'archived'),
      // Group by assistant type
      byAssistant: {
        Career: filtered.filter(c => c.chat_profile === 'Career' && c.status === 'active'),
        Academics: filtered.filter(c => c.chat_profile === 'Academics' && c.status === 'active'),
        Gymkhana: filtered.filter(c => c.chat_profile === 'Gymkhana' && c.status === 'active'),
        Bhaat: filtered.filter(c => c.chat_profile === 'Bhaat' && c.status === 'active'),
      }
    };
  }, [conversations, searchQuery, selectedCollectionId]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const value = {
    // State
    conversations,
    filteredConversations,
    isLoading,
    error,
    activeConversationId,
    searchQuery,
    
    // Collections State
    collections,
    collectionsLoading,
    selectedCollectionId,
    
    // Actions
    fetchConversations,
    setActiveConversationId,
    setSearchQuery,
    renameConversation,
    toggleStar,
    archiveConversation,
    deleteConversation,
    addConversation,
    updateConversation,
    
    // Collection Actions
    fetchCollections,
    moveConversationToCollection,
    selectCollection,
    clearCollectionFilter,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
};

export default ConversationsContext;

