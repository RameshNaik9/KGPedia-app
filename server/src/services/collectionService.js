/**
 * Collection Service
 * Business logic for collection operations
 */

const Collection = require('../models/collection');
const Conversation = require('../models/conversation');

/**
 * Create a new collection
 */
const createCollectionService = async (userId, collectionData) => {
  try {
    // Get the highest order for this user + profile
    const maxOrder = await Collection.findOne({
      user: userId,
      chat_profile: collectionData.chat_profile
    }).sort({ order: -1 }).select('order');

    const newCollection = new Collection({
      user: userId,
      name: collectionData.name,
      description: collectionData.description || '',
      chat_profile: collectionData.chat_profile,
      color: collectionData.color || '#6366f1',
      icon: collectionData.icon || 'folder',
      order: maxOrder ? maxOrder.order + 1 : 0
    });

    const savedCollection = await newCollection.save();
    return savedCollection;
  } catch (error) {
    console.error('Error creating collection:', error);
    throw new Error('Failed to create collection');
  }
};

/**
 * Get all collections for a user (optionally filtered by chat_profile)
 */
const getCollectionsService = async (userId, chatProfile = null) => {
  try {
    const query = { user: userId };
    if (chatProfile) {
      query.chat_profile = chatProfile;
    }

    const collections = await Collection.find(query)
      .populate('shared_with.user', 'email name')
      .sort({ order: 1, createdAt: -1 });

    // Get conversation counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const count = await Conversation.countDocuments({
          collectionId: collection._id,
          status: { $ne: 'closed' }
        });
        return {
          ...collection.toObject(),
          conversation_count: count
        };
      })
    );

    return collectionsWithCounts;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw new Error('Failed to fetch collections');
  }
};

/**
 * Get a single collection by ID
 */
const getCollectionByIdService = async (collectionId, userId) => {
  try {
    const collection = await Collection.findOne({
      _id: collectionId,
      $or: [
        { user: userId },
        { 'shared_with.user': userId }
      ]
    });

    if (!collection) {
      return null;
    }

    // Get conversation count
    const count = await Conversation.countDocuments({
      collectionId: collectionId,
      status: { $ne: 'closed' }
    });

    return {
      ...collection.toObject(),
      conversation_count: count
    };
  } catch (error) {
    console.error('Error fetching collection:', error);
    throw new Error('Failed to fetch collection');
  }
};

/**
 * Update a collection
 */
const updateCollectionService = async (collectionId, userId, updateData) => {
  try {
    const allowedUpdates = ['name', 'description', 'color', 'icon'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    const updatedCollection = await Collection.findOneAndUpdate(
      { _id: collectionId, user: userId },
      { $set: updates },
      { new: true }
    );

    return updatedCollection;
  } catch (error) {
    console.error('Error updating collection:', error);
    throw new Error('Failed to update collection');
  }
};

/**
 * Delete a collection (moves conversations to uncategorized)
 */
const deleteCollectionService = async (collectionId, userId) => {
  try {
    // First, remove collection reference from all conversations
    await Conversation.updateMany(
      { collectionId: collectionId },
      { $set: { collectionId: null } }
    );

    // Then delete the collection
    const deleted = await Collection.findOneAndDelete({
      _id: collectionId,
      user: userId
    });

    return deleted;
  } catch (error) {
    console.error('Error deleting collection:', error);
    throw new Error('Failed to delete collection');
  }
};

/**
 * Move a conversation to a collection
 */
const moveConversationToCollectionService = async (conversationId, collectionId, userId) => {
  try {
    console.log('[MoveService] Moving conversation:', conversationId, 'to collection:', collectionId, 'for user:', userId);
    
    // Verify the conversation belongs to the user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: userId
    });

    if (!conversation) {
      console.log('[MoveService] Conversation not found or does not belong to user');
      throw new Error('Conversation not found');
    }

    console.log('[MoveService] Found conversation:', conversation._id, 'chat_profile:', conversation.chat_profile);

    // If collectionId is null, just uncategorize
    if (!collectionId) {
      console.log('[MoveService] Uncategorizing conversation');
      conversation.collectionId = null;
      await conversation.save();
      console.log('[MoveService] Conversation uncategorized successfully');
      return conversation;
    }

    // Verify the collection belongs to the user and matches the chat profile
    const collection = await Collection.findOne({
      _id: collectionId,
      user: userId,
      chat_profile: conversation.chat_profile
    });

    if (!collection) {
      console.log('[MoveService] Collection not found. Query:', { _id: collectionId, user: userId, chat_profile: conversation.chat_profile });
      throw new Error('Collection not found or does not match chat profile');
    }

    console.log('[MoveService] Found collection:', collection._id, collection.name);

    conversation.collectionId = collectionId;
    await conversation.save();

    console.log('[MoveService] Conversation moved successfully. New collectionId:', conversation.collectionId);
    return conversation;
  } catch (error) {
    console.error('[MoveService] Error moving conversation:', error);
    throw error;
  }
};

/**
 * Get conversations in a collection
 */
const getConversationsInCollectionService = async (collectionId, userId) => {
  try {
    // Verify access to collection
    const collection = await Collection.findOne({
      _id: collectionId,
      $or: [
        { user: userId },
        { 'shared_with.user': userId }
      ]
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    const conversations = await Conversation.find({
      collectionId: collectionId,
      status: { $ne: 'closed' }
    }).sort({ last_message_at: -1 });

    return conversations;
  } catch (error) {
    console.error('Error fetching conversations in collection:', error);
    throw error;
  }
};

/**
 * Reorder collections
 */
const reorderCollectionsService = async (userId, chatProfile, orderedIds) => {
  try {
    const updates = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, user: userId, chat_profile: chatProfile },
        update: { $set: { order: index } }
      }
    }));

    await Collection.bulkWrite(updates);
    return true;
  } catch (error) {
    console.error('Error reordering collections:', error);
    throw new Error('Failed to reorder collections');
  }
};

/**
 * Share a collection with another user
 */
const shareCollectionService = async (collectionId, ownerId, targetUserId, permission) => {
  try {
    // Verify ownership
    const collection = await Collection.findOne({
      _id: collectionId,
      user: ownerId
    });

    if (!collection) {
      return null;
    }

    // Check if already shared
    const alreadyShared = collection.shared_with?.some(
      share => share.user.toString() === targetUserId.toString()
    );

    if (alreadyShared) {
      throw new Error('User already has access to this collection');
    }

    // Add to shared_with array
    collection.shared_with = collection.shared_with || [];
    collection.shared_with.push({
      user: targetUserId,
      permission: permission,
      shared_at: new Date()
    });

    await collection.save();

    // Populate user info for the response
    const populatedCollection = await Collection.findById(collectionId)
      .populate('shared_with.user', 'email name');

    return populatedCollection;
  } catch (error) {
    console.error('Error sharing collection:', error);
    throw error;
  }
};

/**
 * Remove sharing from a collection
 */
const unshareCollectionService = async (collectionId, ownerId, targetUserId) => {
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: collectionId, user: ownerId },
      { $pull: { shared_with: { user: targetUserId } } },
      { new: true }
    ).populate('shared_with.user', 'email name');

    return collection;
  } catch (error) {
    console.error('Error removing share:', error);
    throw error;
  }
};

/**
 * Get collections shared with a user
 */
const getSharedCollectionsService = async (userId, chatProfile = null) => {
  try {
    const query = {
      'shared_with.user': userId
    };

    if (chatProfile) {
      query.chat_profile = chatProfile;
    }

    const collections = await Collection.find(query)
      .populate('user', 'email name')
      .sort({ updatedAt: -1 });

    // Get conversation counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const count = await Conversation.countDocuments({
          collectionId: collection._id,
          status: { $ne: 'closed' }
        });
        
        // Find user's permission
        const userShare = collection.shared_with.find(
          share => share.user.toString() === userId.toString()
        );

        return {
          ...collection.toObject(),
          conversation_count: count,
          my_permission: userShare?.permission || 'view',
          is_shared: true // Mark as shared collection
        };
      })
    );

    return collectionsWithCounts;
  } catch (error) {
    console.error('Error fetching shared collections:', error);
    throw error;
  }
};

module.exports = {
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
};

