//server/src/models/conversation.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeedbackSchema = new Schema({
  rating: { type: Number, min: 1, max: 5 },
  comments: { type: String }
}, { _id: false });

const ConversationSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  last_message_at: {
    type: Date,
    default: Date.now
  },
  total_messages: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  is_starred: {
    type: Boolean,
    default: false
  },
  // Collection this conversation belongs to (null = uncategorized)
  // Note: Named 'collectionId' to avoid Mongoose reserved 'collection' keyword
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    default: null
  },
  tags: [String],
  chat_profile: {
    type: String,
    enum: ['Career', 'Academics', 'Gymkhana', 'Bhaat', 'General'],
    default: 'Career'
  },
  chat_title: {
    type: String,
    default: 'New Chat',
    required: false
  },
  feedback: FeedbackSchema,
  recommended_questions: [String]
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
