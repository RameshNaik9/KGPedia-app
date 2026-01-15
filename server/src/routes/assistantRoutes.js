const express = require('express');
const { 
    createNewConversation, 
    sendMessage, 
    getConversation, 
    getAllConversationsForUser, 
    deleteConversation, 
    submitFeedback, 
    archiveConversation,
    renameConversation,
    toggleStarConversation
} = require('../controllers/assistantController');
const { streamAssistantResponse } = require('../controllers/assistantSSEController'); // Import SSE controller
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Add route for submitting feedback
router.post('/feedback', authMiddleware, submitFeedback);

// POST route to create a new conversation
router.post('/new-conversation', authMiddleware, createNewConversation);

// POST route to send a message in a conversation
router.post('/:conversation_id', authMiddleware, sendMessage);

// New route to get a conversation by conversation_id
router.get('/conversation/:conversation_id', authMiddleware, getConversation);

// GET route to fetch all conversations for a specific user
router.get('/conversations', authMiddleware, getAllConversationsForUser);

// SSE route to stream the assistant's response (uses the updated auth middleware)
router.get('/stream-response/:conversation_id', authMiddleware, streamAssistantResponse);

// DELETE route to delete a conversation
router.delete('/conversation/:conversation_id', authMiddleware, deleteConversation);

// Add route for archiving a conversation
router.patch('/conversation/:conversation_id', authMiddleware, archiveConversation);

// Route to rename a conversation
router.patch('/conversation/:conversation_id/rename', authMiddleware, renameConversation);

// Route to toggle star status
router.patch('/conversation/:conversation_id/star', authMiddleware, toggleStarConversation);

module.exports = router;
