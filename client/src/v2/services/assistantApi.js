/**
 * Assistant API Service
 * Centralized API calls for assistant-related operations
 * Supports SSE streaming for real-time AI responses
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://kgpedia-app.azurewebsites.net';

/**
 * SSE Streaming Helper
 * Opens an EventSource connection and streams assistant response
 * @param {string} conversationId - Conversation ID
 * @param {function} onChunk - Callback for each chunk received
 * @param {function} onComplete - Callback when stream ends
 * @param {function} onError - Callback on error
 * @returns {EventSource} - The EventSource instance for cleanup
 */
export const streamResponse = (conversationId, onChunk, onComplete, onError) => {
  const token = localStorage.getItem('token');
  const url = `${API_BASE_URL}/api/assistant/stream-response/${conversationId}?token=${token}`;
  
  const eventSource = new EventSource(url);
  
  eventSource.onmessage = (event) => {
    if (event.data && event.data.trim()) {
      onChunk(event.data);
    }
  };
  
  eventSource.addEventListener('end', () => {
    eventSource.close();
    onComplete?.();
  });
  
  eventSource.onerror = (error) => {
    console.error('[SSE] Stream error:', error);
    eventSource.close();
    onError?.(error);
  };
  
  return eventSource;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/assistant`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - could trigger logout here
      console.warn('Authentication expired');
    }
    return Promise.reject(error);
  }
);

/**
 * Conversation API Methods
 */
export const conversationApi = {
  /**
   * Get all conversations for the current user
   * @returns {Promise<Array>} List of conversations
   */
  getAll: async () => {
    const response = await api.get('/conversations');
    return response.data;
  },

  /**
   * Get a single conversation with messages
   * @param {string} conversationId 
   * @returns {Promise<Object>} Conversation with messages
   */
  getById: async (conversationId) => {
    const response = await api.get(`/conversation/${conversationId}`);
    return response.data;
  },

  /**
   * Create a new conversation
   * @param {string} chatProfile - 'Career', 'Academics', 'Gymkhana', 'Bhaat'
   * @returns {Promise<Object>} New conversation
   */
  create: async (chatProfile) => {
    const response = await api.post('/new-conversation', { chat_profile: chatProfile });
    return response.data;
  },

  /**
   * Send a message in a conversation
   * @param {string} conversationId 
   * @param {string} message 
   * @returns {Promise<Object>} Message response
   */
  sendMessage: async (conversationId, message) => {
    const response = await api.post(`/${conversationId}`, {
      user_message: { content: message }
    });
    return response.data;
  },

  /**
   * Rename a conversation
   * @param {string} conversationId 
   * @param {string} title 
   * @returns {Promise<Object>} Updated conversation
   */
  rename: async (conversationId, title) => {
    const response = await api.patch(`/conversation/${conversationId}/rename`, { title });
    return response.data;
  },

  /**
   * Toggle star status
   * @param {string} conversationId 
   * @returns {Promise<Object>} Updated star status
   */
  toggleStar: async (conversationId) => {
    const response = await api.patch(`/conversation/${conversationId}/star`);
    return response.data;
  },

  /**
   * Archive a conversation
   * @param {string} conversationId 
   * @returns {Promise<Object>} Result
   */
  archive: async (conversationId) => {
    const response = await api.patch(`/conversation/${conversationId}`, { status: 'archived' });
    return response.data;
  },

  /**
   * Delete (close) a conversation
   * @param {string} conversationId 
   * @returns {Promise<Object>} Result
   */
  delete: async (conversationId) => {
    const response = await api.delete(`/conversation/${conversationId}`);
    return response.data;
  },

  /**
   * Submit feedback for a message
   * @param {string} messageId 
   * @param {number} rating - 1, 2.5, or 5
   * @returns {Promise<Object>} Result
   */
  submitFeedback: async (messageId, rating) => {
    const response = await api.post('/feedback', { message_id: messageId, feedback: rating });
    return response.data;
  },
};

/**
 * Collection API Methods
 */
export const collectionApi = {
  /**
   * Get all collections for the current user
   * @param {string} chatProfile - Optional filter by assistant type
   * @returns {Promise<Array>} List of collections
   */
  getAll: async (chatProfile = null) => {
    const params = chatProfile ? { chat_profile: chatProfile } : {};
    const response = await axios.get(`${API_BASE_URL}/api/collections`, {
      params,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  /**
   * Create a new collection
   * @param {Object} data - { name, description, chat_profile, color, icon }
   * @returns {Promise<Object>} Created collection
   */
  create: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/collections`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  /**
   * Update a collection
   * @param {string} collectionId 
   * @param {Object} data - { name, description, color, icon }
   * @returns {Promise<Object>} Updated collection
   */
  update: async (collectionId, data) => {
    const response = await axios.patch(`${API_BASE_URL}/api/collections/${collectionId}`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  /**
   * Delete a collection
   * @param {string} collectionId 
   * @returns {Promise<Object>} Result
   */
  delete: async (collectionId) => {
    const response = await axios.delete(`${API_BASE_URL}/api/collections/${collectionId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  /**
   * Move conversation to a collection
   * @param {string} conversationId 
   * @param {string|null} collectionId - null to uncategorize
   * @returns {Promise<Object>} Result
   */
  moveConversation: async (conversationId, collectionId) => {
    const response = await axios.patch(
      `${API_BASE_URL}/api/collections/conversation/${conversationId}/move`,
      { collection_id: collectionId },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    return response.data;
  },

  /**
   * Get conversations in a collection
   * @param {string} collectionId 
   * @returns {Promise<Array>} List of conversations
   */
  getConversations: async (collectionId) => {
    const response = await axios.get(`${API_BASE_URL}/api/collections/${collectionId}/conversations`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  /**
   * Reorder collections
   * @param {string} chatProfile 
   * @param {Array<string>} orderedIds 
   * @returns {Promise<Object>} Result
   */
  reorder: async (chatProfile, orderedIds) => {
    const response = await axios.patch(
      `${API_BASE_URL}/api/collections/reorder`,
      { chat_profile: chatProfile, ordered_ids: orderedIds },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    return response.data;
  },

  /**
   * Share a collection with another user
   * @param {string} collectionId 
   * @param {string} email - Email of user to share with
   * @param {string} permission - 'view' or 'edit'
   * @returns {Promise<Object>} Result
   */
  share: async (collectionId, email, permission = 'view') => {
    const response = await axios.post(
      `${API_BASE_URL}/api/collections/${collectionId}/share`,
      { email, permission },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    return response.data;
  },

  /**
   * Remove sharing from a collection
   * @param {string} collectionId 
   * @param {string} userId - User ID to remove
   * @returns {Promise<Object>} Result
   */
  unshare: async (collectionId, userId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/api/collections/${collectionId}/share/${userId}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    return response.data;
  },

  /**
   * Get shared collections (collections shared with the current user)
   * @param {string} chatProfile 
   * @returns {Promise<Array>} List of shared collections
   */
  getShared: async (chatProfile = null) => {
    const params = chatProfile ? { chat_profile: chatProfile } : {};
    const response = await axios.get(`${API_BASE_URL}/api/collections/shared`, {
      params,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
};

export default api;

