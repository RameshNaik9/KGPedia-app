/**
 * Collection Controller
 * API endpoints for collection management
 */

const {
  createCollectionService,
  getCollectionsService,
  getCollectionByIdService,
  updateCollectionService,
  deleteCollectionService,
  moveConversationToCollectionService,
  getConversationsInCollectionService,
  reorderCollectionsService,
  shareCollectionService,
  unshareCollectionService,
  getSharedCollectionsService
} = require('../services/collectionService');
const User = require('../models/user');

/**
 * Create a new collection
 * POST /api/collections
 */
const createCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, chat_profile, color, icon } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Collection name is required' });
    }

    if (!chat_profile) {
      return res.status(400).json({ message: 'Chat profile is required' });
    }

    const validProfiles = ['Career', 'Academics', 'Gymkhana', 'Bhaat', 'General'];
    if (!validProfiles.includes(chat_profile)) {
      return res.status(400).json({ 
        message: `Invalid chat profile. Use one of: ${validProfiles.join(', ')}` 
      });
    }

    const collection = await createCollectionService(userId, {
      name: name.trim(),
      description: description?.trim(),
      chat_profile,
      color,
      icon
    });

    return res.status(201).json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all collections for user (optionally filtered by chat_profile)
 * GET /api/collections?chat_profile=Career
 */
const getCollections = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chat_profile } = req.query;

    const collections = await getCollectionsService(userId, chat_profile);
    return res.status(200).json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a single collection
 * GET /api/collections/:id
 */
const getCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const collection = await getCollectionByIdService(id, userId);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    return res.status(200).json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update a collection
 * PATCH /api/collections/:id
 */
const updateCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, color, icon } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ message: 'Collection name cannot be empty' });
    }

    const updatedCollection = await updateCollectionService(id, userId, {
      name: name?.trim(),
      description: description?.trim(),
      color,
      icon
    });

    if (!updatedCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    return res.status(200).json(updatedCollection);
  } catch (error) {
    console.error('Error updating collection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a collection
 * DELETE /api/collections/:id
 */
const deleteCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await deleteCollectionService(id, userId);

    if (!deleted) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    return res.status(200).json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Move a conversation to a collection
 * PATCH /api/collections/conversation/:conversationId/move
 */
const moveConversationToCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { collection_id } = req.body; // null to uncategorize

    console.log('[MoveController] Request to move conversation:', conversationId, 'to collection:', collection_id);

    const conversation = await moveConversationToCollectionService(
      conversationId, 
      collection_id, 
      userId
    );

    console.log('[MoveController] Move successful, returning conversation');
    return res.status(200).json({
      message: collection_id ? 'Conversation moved to collection' : 'Conversation uncategorized',
      conversation
    });
  } catch (error) {
    console.error('[MoveController] Error moving conversation:', error.message);
    if (error.message === 'Conversation not found') {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (error.message === 'Collection not found or does not match chat profile') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get conversations in a collection
 * GET /api/collections/:id/conversations
 */
const getConversationsInCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const conversations = await getConversationsInCollectionService(id, userId);
    return res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations in collection:', error);
    if (error.message === 'Collection not found') {
      return res.status(404).json({ message: 'Collection not found' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Reorder collections
 * PATCH /api/collections/reorder
 */
const reorderCollections = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chat_profile, ordered_ids } = req.body;

    if (!chat_profile || !ordered_ids || !Array.isArray(ordered_ids)) {
      return res.status(400).json({ message: 'chat_profile and ordered_ids array are required' });
    }

    await reorderCollectionsService(userId, chat_profile, ordered_ids);
    return res.status(200).json({ message: 'Collections reordered successfully' });
  } catch (error) {
    console.error('Error reordering collections:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Share a collection with another user
 * POST /api/collections/:id/share
 */
const shareCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { email, permission = 'view' } = req.body;

    // Validate inputs
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!['view', 'edit'].includes(permission)) {
      return res.status(400).json({ message: 'Invalid permission. Use "view" or "edit"' });
    }

    // Find the user to share with
    const targetUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Don't allow sharing with yourself
    if (targetUser._id.toString() === userId) {
      return res.status(400).json({ message: 'Cannot share with yourself' });
    }

    const updatedCollection = await shareCollectionService(id, userId, targetUser._id, permission);

    if (!updatedCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    return res.status(200).json({
      message: 'Collection shared successfully',
      collection: updatedCollection
    });
  } catch (error) {
    console.error('Error sharing collection:', error);
    if (error.message === 'User already has access to this collection') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Remove sharing from a collection
 * DELETE /api/collections/:id/share/:userId
 */
const unshareCollection = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id, userId: targetUserId } = req.params;

    const updatedCollection = await unshareCollectionService(id, ownerId, targetUserId);

    if (!updatedCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    return res.status(200).json({
      message: 'Access removed successfully',
      collection: updatedCollection
    });
  } catch (error) {
    console.error('Error removing share:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get collections shared with the current user
 * GET /api/collections/shared
 */
const getSharedCollections = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chat_profile } = req.query;

    const collections = await getSharedCollectionsService(userId, chat_profile);
    return res.status(200).json(collections);
  } catch (error) {
    console.error('Error fetching shared collections:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createCollection,
  getCollections,
  getCollection,
  updateCollection,
  deleteCollection,
  moveConversationToCollection,
  getConversationsInCollection,
  reorderCollections,
  shareCollection,
  unshareCollection,
  getSharedCollections
};

