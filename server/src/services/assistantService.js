const Conversation = require('../models/conversation');
const Message = require('../models/message');
const axios = require('axios');

const fastApiBaseUrl = process.env.REACT_APP_FASTAPI_BASE_URL || 'https://www.kgpedia.com';

// Flag to use test mode (mock response without calling FastAPI)
// When true: returns hardcoded mock response (no API call, no LLM)
// When false: calls real FastAPI endpoint (production mode)
const useTestMode = process.env.USE_TEST_MODE === 'true'; // Default: false (production)

// Hardcoded mock response - same format as FastAPI returns
const MOCK_API_RESPONSE = {
  assistant_response: `Based on your question, here's what I can tell you about IIT Kharagpur:

The Training & Placement Cell at IIT KGP facilitates excellent career opportunities. Top companies like Google, Microsoft, Amazon, and Goldman Sachs regularly recruit from campus. The average package is around ₹20 LPA with the highest going up to ₹2.5 Cr for international roles.

For preparation, focus on Data Structures & Algorithms, system design, and your core domain knowledge. Would you like more specific guidance?`,
  chat_title: "Career Discussion",
  tags_list: ["Placements", "Career", "IIT KGP"],
  questions_list: [
    "What companies recruit from IIT KGP?",
    "How to prepare for technical interviews?",
    "Tell me about research opportunities"
  ],
  response_time: "0.5s"
};
// Create a new conversation in the database
const createConversationInDB = async (userId, chatProfile) => {
  try {
    // Create the new conversation object without tags
    const newConversation = new Conversation({
      user: userId,
      chat_profile: chatProfile,
      chat_title: 'New Chat'  // Default title
    });

    // Save the conversation to the database
    const savedConversation = await newConversation.save();

    // Return the saved conversation's _id as conversation_id
    return savedConversation._id;

  } catch (error) {
    console.error('Error saving conversation to the database:', error);
    throw new Error('Database operation failed');
  }
};

// Save user's message and prepare for assistant response
const saveUserMessageService = async (conversationId, userId, userMessageContent) => {
  try {
    // Create a new message document for the user's message
    const newMessage = new Message({
      conversation_id: conversationId,
      user: userId,
      user_message: {
        content: userMessageContent,
        timestamp: new Date(),
      },
      message_type: 'text',
      metadata: {
        is_read: false,
        is_deleted: false
      }
    });

    // Save the user message to the database
    const savedMessage = await newMessage.save();

    // Update conversation's last message timestamp and total messages count
    await Conversation.updateOne(
      { _id: conversationId },
      { $set: { last_message_at: new Date() }, $inc: { total_messages: 1 } }
    );

    return savedMessage;
  } catch (error) {
    console.error('Error saving user message:', error);
    throw new Error('Database operation failed');
  }
};

// Get the assistant's response, update the message, and save tags/recommended questions in the conversation
const getAssistantResponseService = async (conversationId, messageId, userMessage, chatProfile) => {
  try {
    let assistant_response, response_time, chat_title, tags_list, questions_list;

    if (useTestMode) {
      // TEST MODE: Return hardcoded mock response without calling FastAPI
      console.log(`[AssistantService] 🧪 TEST MODE - Returning mock response (no API call)`);
      
      ({ assistant_response, response_time, chat_title, tags_list, questions_list } = MOCK_API_RESPONSE);
    } else {
      // PRODUCTION MODE: Call real FastAPI endpoint
      const endpoint = `${fastApiBaseUrl}/chat/conversation_id`;
      console.log(`[AssistantService] Calling AI endpoint: ${endpoint}`);
      
      const response = await axios.post(endpoint, {
        conversation_id: conversationId,
        user_message: userMessage,
        chat_profile: chatProfile,
      });

      ({ assistant_response, response_time, chat_title, tags_list, questions_list } = response.data);
    }

    // Update the existing message document with the assistant's response
    const updatedMessage = await Message.findOneAndUpdate(
      { _id: messageId },
      {
        $set: {
          assistant_response: {
            content: assistant_response,
            timestamp: new Date(),
          },
          response_time: response_time
        }
      },
      { new: true }
    );

    // Check if chat_title is not null. If it is, retain the current chat_title in the database.
    if (chat_title) {
      await Conversation.findByIdAndUpdate(
        conversationId,
        { $set: { chat_title } },
        { new: true }
      );
    }

    // Handle recommended questions logic
    let finalQuestionsList = questions_list;
    if (!questions_list || questions_list.length === 0) {
      // Retrieve existing recommended_questions from the conversation document
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        finalQuestionsList = conversation.recommended_questions;
      }
    } else {
      // Update conversation with new recommended questions
      await Conversation.findByIdAndUpdate(
        conversationId,
        { $set: { recommended_questions: questions_list } },
        { new: true }
      );
    }

    // Update tags
    await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: { tags: tags_list } },
      { new: true }
    );

    // Return the updated message
    return {
      updatedMessage,
      tags: tags_list,
      recommended_questions: finalQuestionsList
    };
  } catch (error) {
    console.error('Error getting assistant response:', error);
    throw new Error('Failed to get assistant response');
  }
};


// Get all messages for a specific conversation
const getConversationMessages = async (conversationId) => {
  try {
    // Fetch all messages for the given conversation_id, sorted by timestamp
    const messages = await Message.find({ conversation_id: conversationId }).sort({ 'user_message.timestamp': 1 });
    return messages;
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    throw new Error('Database operation failed');
  }
};

// Service to fetch all conversations for a specific user
const getAllConversationsForUserService = async (userId) => {
    try {
        // Query the database for all conversations that match the userId and are not closed
        const conversations = await Conversation.find({ user: userId, status: { $ne: 'closed' } });
        return conversations;
    } catch (error) {
        console.error('Error fetching conversations from the database:', error);
        throw new Error('Database operation failed');
    }
};

const updateMessageFeedbackService = async (messageId, feedbackRating) => {
  try {
    const updatedMessage = await Message.findOneAndUpdate(
      { _id: messageId },
      { $set: { 'feedback.rating': feedbackRating } },
      { new: true } // Return updated document
    );

    if (!updatedMessage) {
      throw new Error('Message not found');
    }

    return updatedMessage;
  } catch (error) {
    console.error('Error updating message feedback:', error);
    throw new Error('Database operation failed');
  }
};

// Service to archive a conversation
const archiveConversationService = async (conversationId) => {
    try {
        const archivedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { status: 'archived' },
            { new: true }  // Return the updated document
        );

        return archivedConversation;
    } catch (error) {
        console.error('Error archiving conversation:', error);
        throw new Error('Database operation failed');
    }
};


// Service to rename a conversation
const renameConversationService = async (conversationId, newTitle) => {
    try {
        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { chat_title: newTitle },
            { new: true }
        );
        return updatedConversation;
    } catch (error) {
        console.error('Error renaming conversation:', error);
        throw new Error('Database operation failed');
    }
};

// Service to toggle star status
const toggleStarConversationService = async (conversationId) => {
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        
        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { is_starred: !conversation.is_starred },
            { new: true }
        );
        return updatedConversation;
    } catch (error) {
        console.error('Error toggling star:', error);
        throw new Error('Database operation failed');
    }
};

module.exports = { 
    createConversationInDB, 
    saveUserMessageService, 
    getAssistantResponseService, 
    getConversationMessages, 
    getAllConversationsForUserService, 
    updateMessageFeedbackService, 
    archiveConversationService,
    renameConversationService,
    toggleStarConversationService
};

