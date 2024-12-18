const Conversation = require('../models/conversation');
const Message = require('../models/message');
const axios = require('axios');

    const fastApiBaseUrl = process.env.REACT_APP_FASTAPI_BASE_URL || 'https://kgpedia-ai-app.azurewebsites.net';

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
    // Send request to FastAPI microservice
    const response = await axios.post(`${fastApiBaseUrl}/chat/conversation_id`, {
      conversation_id: conversationId,
      user_message: userMessage,
      chat_profile: chatProfile,
    });

    const { assistant_response, response_time, chat_title, tags_list, questions_list } = response.data;

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

    // Update the conversation with tags and recommended questions from the assistant response
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $set: {
          tags: tags_list,  // Update the tags in the conversation
          recommended_questions: questions_list  // Update the recommended questions
        }
      },
      { new: true }
    );

    // Return the updated message
    return {
      updatedMessage,
      tags: tags_list,
      recommended_questions: questions_list
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


module.exports = { createConversationInDB, saveUserMessageService, getAssistantResponseService, getConversationMessages, getAllConversationsForUserService, updateMessageFeedbackService, archiveConversationService };

