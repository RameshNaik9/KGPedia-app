/**
 * Collection Routes
 * API endpoints for collection management
 */

const express = require('express');
const {
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
} = require('../controllers/collectionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Collection CRUD operations
router.post('/', createCollection);
router.get('/', getCollections);
router.get('/shared', getSharedCollections); // Get collections shared with user
router.patch('/reorder', reorderCollections);
router.get('/:id', getCollection);
router.patch('/:id', updateCollection);
router.delete('/:id', deleteCollection);

// Get conversations in a collection
router.get('/:id/conversations', getConversationsInCollection);

// Sharing routes
router.post('/:id/share', shareCollection);
router.delete('/:id/share/:userId', unshareCollection);

// Move conversation to collection (separate route under conversations)
// This will be mounted at /api/conversations/:conversationId/move
router.patch('/conversation/:conversationId/move', moveConversationToCollection);

module.exports = router;

