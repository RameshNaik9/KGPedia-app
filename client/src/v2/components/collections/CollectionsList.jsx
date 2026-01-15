/**
 * CollectionsList - Collections panel component
 * Shows user's collections for the current assistant
 * - 3-4 items visible by default, expandable
 * - Click to filter conversations by collection
 * - Share collections with other users
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../ui/Icon';
import DropdownMenu from '../ui/DropdownMenu';
import { collectionApi } from '../../services/assistantApi';
import { useConversations } from '../../context/ConversationsContext';
import './CollectionsList.css';

const VISIBLE_ITEMS = 3; // Number of items visible by default (collapsed)
const MAX_EXPANDED_ITEMS = 6; // Max items visible when expanded (then scroll)

// Collection color options
const COLLECTION_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
];

// Collection icon options
const COLLECTION_ICONS = [
  'folder', 'briefcase', 'graduationCap', 'trophy',
  'lightbulb', 'target', 'star', 'archive'
];

const CollectionsList = ({ 
  chatProfile = null, // Filter by assistant type
}) => {
  // Use context for collections and filtering
  const { 
    collections, 
    collectionsLoading, 
    fetchCollections,
    selectCollection,
    selectedCollectionId 
  } = useConversations();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(null); // Collection ID being shared
  const [editingCollection, setEditingCollection] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Create/Edit form state
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(COLLECTION_COLORS[0]);
  const [formIcon, setFormIcon] = useState('folder');
  
  // Share form state
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState('');
  
  const listRef = useRef(null);
  const menuButtonRefs = useRef({});

  // Fetch collections when chat profile changes
  useEffect(() => {
    if (chatProfile) {
      fetchCollections(chatProfile);
    }
  }, [chatProfile, fetchCollections]);

  // Close menu on scroll
  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    
    if (openMenuId) {
      const listElement = listRef.current;
      if (listElement) {
        listElement.addEventListener('scroll', closeMenu);
      }
      return () => {
        if (listElement) {
          listElement.removeEventListener('scroll', closeMenu);
        }
      };
    }
  }, [openMenuId]);

  // Check if there are more items than visible
  const hasMoreItems = collections.length > VISIBLE_ITEMS;
  const hiddenCount = collections.length - VISIBLE_ITEMS;
  
  // Items to display based on expanded state
  const visibleCollections = isExpanded 
    ? collections 
    : collections.slice(0, VISIBLE_ITEMS);
  
  // Check if internal scroll is needed when expanded
  const needsScroll = isExpanded && collections.length > MAX_EXPANDED_ITEMS;

  // Handle expand/collapse (click header)
  const handleHeaderClick = () => {
    if (collections.length > 0) {
      setIsExpanded(!isExpanded);
    }
  };

  // Handle expand button click
  const handleExpandClick = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Open create modal
  const handleCreateClick = () => {
    setFormName('');
    setFormColor(COLLECTION_COLORS[0]);
    setFormIcon('folder');
    setEditingCollection(null);
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleEditClick = (collection, e) => {
    e.stopPropagation();
    setFormName(collection.name);
    setFormColor(collection.color || COLLECTION_COLORS[0]);
    setFormIcon(collection.icon || 'folder');
    setEditingCollection(collection);
    setShowCreateModal(true);
    setOpenMenuId(null);
  };

  // Submit create/edit form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      if (editingCollection) {
        // Update existing
        await collectionApi.update(editingCollection._id, {
          name: formName.trim(),
          color: formColor,
          icon: formIcon
        });
      } else {
        // Create new
        await collectionApi.create({
          name: formName.trim(),
          chat_profile: chatProfile,
          color: formColor,
          icon: formIcon
        });
      }
      
      setShowCreateModal(false);
      setEditingCollection(null);
      fetchCollections(chatProfile);
    } catch (error) {
      console.error('Failed to save collection:', error);
    }
  };

  // Delete collection
  const handleDeleteClick = async (collectionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this collection? Conversations will be uncategorized.')) {
      return;
    }

    try {
      await collectionApi.delete(collectionId);
      setOpenMenuId(null);
      fetchCollections(chatProfile);
    } catch (error) {
      console.error('Failed to delete collection:', error);
    }
  };

  // Handle collection click - filter conversations
  const handleCollectionClick = (collection) => {
    selectCollection(collection._id);
  };

  // Open share modal
  const handleShareClick = (collection, e) => {
    e.stopPropagation();
    setShowShareModal(collection._id);
    setShareEmail('');
    setSharePermission('view');
    setShareError('');
    setOpenMenuId(null);
  };

  // Submit share form
  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) {
      setShareError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareEmail)) {
      setShareError('Invalid email format');
      return;
    }

    setShareLoading(true);
    setShareError('');

    try {
      await collectionApi.share(showShareModal, shareEmail.trim(), sharePermission);
      setShowShareModal(null);
      setShareEmail('');
      fetchCollections(chatProfile);
    } catch (error) {
      console.error('Failed to share collection:', error);
      setShareError(error.response?.data?.message || 'Failed to share collection');
    } finally {
      setShareLoading(false);
    }
  };

  // Remove shared user
  const handleRemoveSharedUser = async (collectionId, userId, e) => {
    e.stopPropagation();
    try {
      await collectionApi.unshare(collectionId, userId);
      fetchCollections(chatProfile);
    } catch (error) {
      console.error('Failed to remove shared user:', error);
    }
  };

  if (!chatProfile) {
    return null;
  }

  // Get current collection for share modal
  const collectionToShare = collections.find(c => c._id === showShareModal);

  return (
    <div className={`collections-list ${isExpanded ? 'is-expanded' : ''} ${needsScroll ? 'has-scroll' : ''}`}>
      {/* Header - Click to expand/collapse */}
      <div 
        className={`collections-header ${collections.length > VISIBLE_ITEMS ? 'is-clickable' : ''}`}
        onClick={handleHeaderClick}
      >
        <h3 className="collections-title">
          Collections
          {collections.length > 0 && (
            <span className="collections-count">{collections.length}</span>
          )}
          {hasMoreItems && (
            <Icon 
              name={isExpanded ? 'chevronUp' : 'chevronDown'} 
              size={12} 
              className="collections-chevron"
            />
          )}
        </h3>
        <button 
          className="collections-add-btn"
          onClick={(e) => { e.stopPropagation(); handleCreateClick(); }}
          aria-label="Create collection"
        >
          <Icon name="plus" size={12} />
        </button>
      </div>

      {/* List */}
      <div className={`collections-content ${needsScroll ? 'is-scrollable' : ''}`} ref={listRef}>
        {collectionsLoading ? (
          <div className="collections-loading">
            <div className="loading-spinner" />
          </div>
        ) : collections.length === 0 ? (
          <div className="collections-empty">
            <Icon name="folder" size={18} />
            <p>No collections yet</p>
            <button onClick={handleCreateClick}>Create one</button>
          </div>
        ) : (
          <ul className="collection-items">
            {visibleCollections.map((collection) => (
              <li key={collection._id} className="collection-item-wrapper">
                <button
                  className={`collection-item ${selectedCollectionId === collection._id ? 'active' : ''}`}
                  onClick={() => handleCollectionClick(collection)}
                >
                  <span 
                    className="collection-icon" 
                    style={{ color: collection.color }}
                  >
                    <Icon name={collection.icon || 'folder'} size={14} />
                  </span>
                  <span className="collection-name">{collection.name}</span>
                  
                  {/* Shared indicator */}
                  {collection.shared_with?.length > 0 && (
                    <span className="shared-indicator" title={`Shared with ${collection.shared_with.length} user(s)`}>
                      <Icon name="users" size={10} />
                    </span>
                  )}
                  
                  <span className="collection-count">{collection.conversation_count || 0}</span>
                  
                  {/* Menu button */}
                  <button
                    ref={(el) => { menuButtonRefs.current[collection._id] = el; }}
                    className="collection-menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === collection._id ? null : collection._id);
                    }}
                  >
                    <Icon name="moreVertical" size={12} />
                  </button>
                </button>

                {/* Portal-based Dropdown menu */}
                <DropdownMenu
                  isOpen={openMenuId === collection._id}
                  onClose={() => setOpenMenuId(null)}
                  triggerRef={{ current: menuButtonRefs.current[collection._id] }}
                >
                  <button onClick={(e) => handleEditClick(collection, e)}>
                    <Icon name="edit" size={12} />
                    Edit
                  </button>
                  <button onClick={(e) => handleShareClick(collection, e)}>
                    <Icon name="share" size={12} />
                    Share
                  </button>
                  <button 
                    className="menu-delete"
                    onClick={(e) => handleDeleteClick(collection._id, e)}
                  >
                    <Icon name="trash" size={12} />
                    Delete
                  </button>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Expand button - only show when collapsed and has more items */}
      {hasMoreItems && !isExpanded && (
        <button 
          className="collections-expand-btn"
          onClick={handleExpandClick}
        >
          <span>+{hiddenCount} more</span>
        </button>
      )}
      
      {/* Collapse button - only show when expanded */}
      {hasMoreItems && isExpanded && (
        <button 
          className="collections-expand-btn is-expanded"
          onClick={handleExpandClick}
        >
          <Icon name="chevronUp" size={12} />
          <span>Show less</span>
        </button>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="collection-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="collection-modal" onClick={(e) => e.stopPropagation()}>
            <h4>{editingCollection ? 'Edit Collection' : 'New Collection'}</h4>
            <form onSubmit={handleFormSubmit}>
              {/* Name input */}
              <div className="form-field">
                <label>Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Collection name"
                  maxLength={50}
                  autoFocus
                />
              </div>

              {/* Color picker */}
              <div className="form-field">
                <label>Color</label>
                <div className="color-picker">
                  {COLLECTION_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormColor(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Icon picker */}
              <div className="form-field">
                <label>Icon</label>
                <div className="icon-picker">
                  {COLLECTION_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${formIcon === icon ? 'active' : ''}`}
                      onClick={() => setFormIcon(icon)}
                      style={{ color: formColor }}
                    >
                      <Icon name={icon} size={16} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={!formName.trim()}>
                  {editingCollection ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && collectionToShare && (
        <div className="collection-modal-overlay" onClick={() => setShowShareModal(null)}>
          <div className="collection-modal share-modal" onClick={(e) => e.stopPropagation()}>
            <h4>
              <Icon name="share" size={16} />
              Share Collection
            </h4>
            <p className="share-collection-name">
              <Icon name={collectionToShare.icon || 'folder'} size={14} style={{ color: collectionToShare.color }} />
              {collectionToShare.name}
            </p>

            {/* Share form */}
            <form onSubmit={handleShareSubmit}>
              <div className="form-field">
                <label>Email address</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="friend@example.com"
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label>Permission</label>
                <div className="permission-options">
                  <button
                    type="button"
                    className={`permission-option ${sharePermission === 'view' ? 'active' : ''}`}
                    onClick={() => setSharePermission('view')}
                  >
                    <Icon name="eye" size={14} />
                    <span>View only</span>
                  </button>
                  <button
                    type="button"
                    className={`permission-option ${sharePermission === 'edit' ? 'active' : ''}`}
                    onClick={() => setSharePermission('edit')}
                  >
                    <Icon name="edit" size={14} />
                    <span>Can edit</span>
                  </button>
                </div>
              </div>

              {shareError && (
                <p className="share-error">{shareError}</p>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => setShowShareModal(null)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary" 
                  disabled={!shareEmail.trim() || shareLoading}
                >
                  {shareLoading ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </form>

            {/* Current shared users */}
            {collectionToShare.shared_with?.length > 0 && (
              <div className="shared-users">
                <h5>Shared with</h5>
                <ul>
                  {collectionToShare.shared_with.map((share) => (
                    <li key={share.user?._id || share.user}>
                      <span className="shared-user-email">
                        {share.user?.email || share.user}
                      </span>
                      <span className={`shared-user-permission ${share.permission}`}>
                        {share.permission}
                      </span>
                      <button
                        className="remove-share-btn"
                        onClick={(e) => handleRemoveSharedUser(collectionToShare._id, share.user?._id || share.user, e)}
                        title="Remove access"
                      >
                        <Icon name="x" size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsList;

