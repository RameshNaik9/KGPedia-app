/**
 * Collection Model
 * Organizes conversations into user-defined collections per assistant type
 * 
 * Features:
 * - Per-assistant collections (each assistant has its own collections)
 * - Custom colors and icons for visual distinction
 * - Future: Sharing collections with other users
 */

const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  // Owner of the collection
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // Collection name (user-defined)
  name: { 
    type: String, 
    required: true, 
    maxlength: 50,
    trim: true
  },
  
  // Optional description
  description: { 
    type: String, 
    maxlength: 200,
    trim: true,
    default: ''
  },
  
  // Assistant type this collection belongs to
  // Collections are separate per assistant
  chat_profile: { 
    type: String, 
    required: true,
    enum: ['Career', 'Academics', 'Gymkhana', 'Bhaat', 'General']
  },
  
  // Visual customization
  color: { 
    type: String, 
    default: '#6366f1' // Indigo default
  },
  
  icon: { 
    type: String, 
    default: 'folder'
  },
  
  // Display order (for custom ordering)
  order: { 
    type: Number, 
    default: 0 
  },
  
  // Sharing feature (future)
  shared_with: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['view', 'edit'], default: 'view' },
    shared_at: { type: Date, default: Date.now }
  }],
  
  // Metadata
  conversation_count: {
    type: Number,
    default: 0
  }
  
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Compound index for efficient queries
collectionSchema.index({ user: 1, chat_profile: 1 });
collectionSchema.index({ user: 1, chat_profile: 1, order: 1 });

// Virtual for getting conversations in this collection
collectionSchema.virtual('conversations', {
  ref: 'Conversation',
  localField: '_id',
  foreignField: 'collection'
});

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;

