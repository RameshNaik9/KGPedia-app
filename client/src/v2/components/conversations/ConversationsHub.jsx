/**
 * ConversationsHub - Main conversations panel component
 * Features: Search, tabs (Recent/Starred/Archived), conversation list with actions
 * - Shows 5 items by default, expandable to full height
 * 
 * Props:
 * - filterByAssistant: Optional assistant type to filter (Career, Academics, etc.)
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import DropdownMenu, { DropdownSubmenu } from '../ui/DropdownMenu';
import { useConversations } from '../../context/ConversationsContext';
import { collectionApi } from '../../services/assistantApi';
import './ConversationsHub.css';
import '../collections/CollectionsList.css'; // For shared modal styles

const VISIBLE_ITEMS = 5; // Number of items visible by default (collapsed)
const MAX_EXPANDED_ITEMS = 10; // Max items visible when expanded (then scroll)

// Tab configuration
const TABS = [
  { id: 'recent', label: 'Recent' },
  { id: 'starred', label: 'Starred' },
  { id: 'archived', label: 'Archived' },
];

// Get relative time string
const getRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Assistant badge colors
const ASSISTANT_COLORS = {
  Career: { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' },
  Academics: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' },
  Gymkhana: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' },
  Bhaat: { bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' },
};

// Collection color options (same as CollectionsList)
const COLLECTION_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
];

// Collection icon options (same as CollectionsList)
const COLLECTION_ICONS = [
  'folder', 'briefcase', 'graduationCap', 'trophy',
  'lightbulb', 'target', 'star', 'archive'
];

const ConversationsHub = ({ filterByAssistant = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    filteredConversations,
    isLoading,
    searchQuery,
    setSearchQuery,
    activeConversationId,
    setActiveConversationId,
    renameConversation,
    toggleStar,
    archiveConversation,
    deleteConversation,
    // Collections
    collections,
    fetchCollections,
    moveConversationToCollection,
    selectedCollectionId,
    clearCollectionFilter,
  } = useConversations();

  const [activeTab, setActiveTab] = useState('recent');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showMoveMenu, setShowMoveMenu] = useState(null); // Track which conversation's move menu is open
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionColor, setNewCollectionColor] = useState(COLLECTION_COLORS[0]);
  const [newCollectionIcon, setNewCollectionIcon] = useState('folder');
  const [pendingMoveConversationId, setPendingMoveConversationId] = useState(null);
  const listRef = useRef(null);
  
  // Refs for menu triggers (for portal positioning)
  const menuButtonRefs = useRef({});
  const moveButtonRefs = useRef({});

  // Fetch collections when assistant type changes
  useEffect(() => {
    if (filterByAssistant) {
      fetchCollections(filterByAssistant);
    }
  }, [filterByAssistant, fetchCollections]);

  // Close menus when clicking outside or scrolling
  useEffect(() => {
    const closeMenus = () => {
      setOpenMenuId(null);
      setShowMoveMenu(null);
    };
    
    if (openMenuId || showMoveMenu) {
      const listElement = listRef.current;
      if (listElement) {
        listElement.addEventListener('scroll', closeMenus);
      }
      return () => {
        if (listElement) {
          listElement.removeEventListener('scroll', closeMenus);
        }
      };
    }
  }, [openMenuId, showMoveMenu]);

  // Get conversations for current tab, filtered by assistant type
  const getTabConversations = useCallback(() => {
    let tabConversations;
    switch (activeTab) {
      case 'starred':
        tabConversations = filteredConversations.starred;
        break;
      case 'archived':
        tabConversations = filteredConversations.archived;
        break;
      default:
        tabConversations = filteredConversations.recent;
    }
    
    // Filter by assistant type if specified
    if (filterByAssistant) {
      return tabConversations.filter(c => c.chat_profile === filterByAssistant);
    }
    return tabConversations;
  }, [activeTab, filteredConversations, filterByAssistant]);

  const conversations = getTabConversations();

  // Get count for starred tab (filtered by assistant if needed)
  const starredCount = useMemo(() => {
    if (filterByAssistant) {
      return filteredConversations.starred.filter(c => c.chat_profile === filterByAssistant).length;
    }
    return filteredConversations.starred.length;
  }, [filteredConversations.starred, filterByAssistant]);

  // Handle conversation click
  const handleConversationClick = (conversation) => {
    const profilePath = conversation.chat_profile.toLowerCase();
    const basePath = `/v2/${profilePath}-assistant`;
    const path = `${basePath}/${conversation._id}`;
    
    setActiveConversationId(conversation._id);
    navigate(path);
  };

  // Handle menu actions
  const handleMenuAction = async (action, conversation, e) => {
    e.stopPropagation();
    
    switch (action) {
      case 'rename':
        setOpenMenuId(null);
        setShowMoveMenu(null);
        setRenameId(conversation._id);
        setRenameValue(conversation.chat_title || '');
        break;
      case 'star':
        setOpenMenuId(null);
        setShowMoveMenu(null);
        await toggleStar(conversation._id);
        break;
      case 'archive':
        setOpenMenuId(null);
        setShowMoveMenu(null);
        await archiveConversation(conversation._id);
        break;
      case 'delete':
        setOpenMenuId(null);
        setShowMoveMenu(null);
        if (window.confirm('Are you sure you want to delete this conversation?')) {
          await deleteConversation(conversation._id);
        }
        break;
      case 'showMove':
        // Toggle move submenu
        setShowMoveMenu(showMoveMenu === conversation._id ? null : conversation._id);
        break;
      default:
        break;
    }
  };

  // Handle moving conversation to a collection
  const handleMoveToCollection = async (conversationId, collectionId, e) => {
    console.log('[Move] handleMoveToCollection called!', { conversationId, collectionId });
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setOpenMenuId(null);
    setShowMoveMenu(null);
    
    console.log('[Move] Moving conversation', conversationId, 'to collection', collectionId);
    
    const success = await moveConversationToCollection(conversationId, collectionId);
    if (success) {
      console.log('[Move] Successfully moved conversation');
    } else {
      console.error('[Move] Failed to move conversation');
    }
  };

  // Handle creating a new collection and moving conversation to it
  const handleNewCollectionClick = (conversationId, e) => {
    console.log('[Move] handleNewCollectionClick called!', { conversationId });
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setOpenMenuId(null);
    setShowMoveMenu(null);
    setPendingMoveConversationId(conversationId);
    setNewCollectionName('');
    setNewCollectionColor(COLLECTION_COLORS[0]);
    setNewCollectionIcon('folder');
    setShowNewCollectionModal(true);
    console.log('[Move] Modal should be showing now, showNewCollectionModal:', true);
  };

  // Create collection and move conversation
  const handleCreateCollectionAndMove = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim() || !pendingMoveConversationId) return;

    try {
      // Find the conversation to get its chat_profile
      const conversation = conversations.find(c => c._id === pendingMoveConversationId);
      if (!conversation) {
        console.error('[Move] Conversation not found');
        return;
      }

      // Create the new collection with color and icon
      console.log('[Move] Creating new collection:', newCollectionName);
      const newCollection = await collectionApi.create({
        name: newCollectionName.trim(),
        chat_profile: conversation.chat_profile,
        color: newCollectionColor,
        icon: newCollectionIcon,
      });

      console.log('[Move] Created collection:', newCollection);

      // Refresh collections first
      await fetchCollections(conversation.chat_profile);

      // Move conversation to the new collection
      console.log('[Move] Moving conversation to new collection');
      await moveConversationToCollection(pendingMoveConversationId, newCollection._id);

      // Close modal and reset
      setShowNewCollectionModal(false);
      setPendingMoveConversationId(null);
      setNewCollectionName('');
      setNewCollectionColor(COLLECTION_COLORS[0]);
      setNewCollectionIcon('folder');
    } catch (error) {
      console.error('[Move] Failed to create collection and move:', error);
    }
  };

  // Handle rename submit
  const handleRenameSubmit = async (conversationId) => {
    if (renameValue.trim()) {
      await renameConversation(conversationId, renameValue.trim());
    }
    setRenameId(null);
    setRenameValue('');
  };

  // Check if conversation is active
  const isActive = (conversationId) => {
    return location.pathname.includes(conversationId) || activeConversationId === conversationId;
  };

  // Check if there are more items than visible
  const hasMoreItems = conversations.length > VISIBLE_ITEMS;
  const hiddenCount = conversations.length - VISIBLE_ITEMS;
  
  // Items to display based on expanded state
  const visibleConversations = isExpanded 
    ? conversations 
    : conversations.slice(0, VISIBLE_ITEMS);
  
  // Check if internal scroll is needed when expanded
  const needsScroll = isExpanded && conversations.length > MAX_EXPANDED_ITEMS;

  // Handle header click to toggle expand/collapse
  const handleHeaderClick = () => {
    if (conversations.length > VISIBLE_ITEMS) {
      setIsExpanded(!isExpanded);
    }
  };

  // Handle expand button click
  const handleExpandClick = (e) => {
    e?.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Get selected collection name for display
  const selectedCollection = collections.find(c => c._id === selectedCollectionId);

  return (
    <div className={`conversations-hub ${isExpanded ? 'is-expanded' : ''} ${needsScroll ? 'has-scroll' : ''}`}>
      {/* Header - Click to expand/collapse */}
      <div 
        className={`hub-header ${hasMoreItems ? 'is-clickable' : ''}`}
        onClick={handleHeaderClick}
      >
        <h3 className="hub-title">
          {selectedCollection ? (
            <>
              <Icon name={selectedCollection.icon || 'folder'} size={14} style={{ color: selectedCollection.color }} />
              {selectedCollection.name}
            </>
          ) : (
            'Conversations'
          )}
          {conversations.length > 0 && (
            <span className="hub-count-badge">{conversations.length}</span>
          )}
          {hasMoreItems && (
            <Icon 
              name={isExpanded ? 'chevronUp' : 'chevronDown'} 
              size={12} 
              className="hub-chevron"
            />
          )}
        </h3>
        <div className="hub-header-actions">
          {selectedCollection && (
            <button 
              className="clear-filter-btn"
              onClick={(e) => { e.stopPropagation(); clearCollectionFilter(); }}
              title="Clear filter"
            >
              <Icon name="x" size={12} />
            </button>
          )}
          {/* Plus button for new conversation */}
          {filterByAssistant && (
            <button 
              className="hub-add-btn"
              onClick={(e) => { 
                e.stopPropagation(); 
                navigate(`/v2/${filterByAssistant.toLowerCase()}-assistant`);
              }}
              title="New conversation"
            >
              <Icon name="plus" size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="hub-search">
        <Icon name="search" size={14} className="search-icon" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button 
            className="search-clear" 
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <Icon name="x" size={12} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="hub-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`hub-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'starred' && starredCount > 0 && (
              <span className="tab-count">{starredCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      <div className="hub-list" data-tab={activeTab} ref={listRef}>
        {isLoading ? (
          <div className="hub-loading">
            <div className="loading-spinner" />
            <span>Loading...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="hub-empty">
            <Icon 
              name={activeTab === 'starred' ? 'star' : activeTab === 'archived' ? 'archive' : 'messageCircle'} 
              size={24} 
            />
            <p>
              {searchQuery 
                ? 'No conversations found' 
                : activeTab === 'starred' 
                  ? 'No starred conversations'
                  : activeTab === 'archived'
                    ? 'No archived conversations'
                    : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <ul className="conversation-list">
            {visibleConversations.map(conversation => (
              <li key={conversation._id} className="conversation-item-wrapper">
                <button
                  className={`conversation-item ${isActive(conversation._id) ? 'active' : ''}`}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="conversation-content">
                    {renameId === conversation._id ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameSubmit(conversation._id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit(conversation._id);
                          if (e.key === 'Escape') setRenameId(null);
                        }}
                        className="rename-input"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="conversation-title">
                        {conversation.chat_title || 'New Chat'}
                      </span>
                    )}
                    <div className="conversation-meta">
                      <span 
                        className="assistant-badge"
                        style={{
                          background: ASSISTANT_COLORS[conversation.chat_profile]?.bg,
                          color: ASSISTANT_COLORS[conversation.chat_profile]?.color,
                        }}
                      >
                        {conversation.chat_profile}
                      </span>
                      <span className="conversation-time">
                        {getRelativeTime(conversation.last_message_at || conversation.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Star indicator */}
                  {conversation.is_starred && (
                    <Icon name="star" size={12} className="star-indicator" />
                  )}

                  {/* Options menu button */}
                  <button
                    ref={(el) => { menuButtonRefs.current[conversation._id] = el; }}
                    className="conversation-menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMoveMenu(null);
                      setOpenMenuId(openMenuId === conversation._id ? null : conversation._id);
                    }}
                    aria-label="More options"
                  >
                    <Icon name="moreVertical" size={14} />
                  </button>
                </button>

                {/* Portal-based Options Menu */}
                <DropdownMenu
                  isOpen={openMenuId === conversation._id}
                  onClose={() => { setOpenMenuId(null); setShowMoveMenu(null); }}
                  triggerRef={{ current: menuButtonRefs.current[conversation._id] }}
                >
                  <button onClick={(e) => handleMenuAction('rename', conversation, e)}>
                    <Icon name="edit" size={14} />
                    Rename
                  </button>
                  <button onClick={(e) => handleMenuAction('star', conversation, e)}>
                    <Icon name={conversation.is_starred ? 'starOff' : 'star'} size={14} />
                    {conversation.is_starred ? 'Unstar' : 'Star'}
                  </button>
                  
                  {/* Move to Collection submenu trigger */}
                  {filterByAssistant && (
                    <button 
                      ref={(el) => { moveButtonRefs.current[conversation._id] = el; }}
                      className="submenu-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMoveMenu(showMoveMenu === conversation._id ? null : conversation._id);
                      }}
                      onMouseEnter={() => setShowMoveMenu(conversation._id)}
                    >
                      <Icon name="folder" size={14} />
                      Move to...
                      <Icon name="chevronRight" size={12} className="submenu-arrow" />
                    </button>
                  )}
                  
                  {conversation.status !== 'archived' && (
                    <button onClick={(e) => handleMenuAction('archive', conversation, e)}>
                      <Icon name="archive" size={14} />
                      Archive
                    </button>
                  )}
                  <button 
                    className="menu-delete"
                    onClick={(e) => handleMenuAction('delete', conversation, e)}
                  >
                    <Icon name="trash" size={14} />
                    Delete
                  </button>
                </DropdownMenu>

                {/* Portal-based Move Submenu */}
                {filterByAssistant && (
                  <DropdownSubmenu
                    isOpen={showMoveMenu === conversation._id && openMenuId === conversation._id}
                    onClose={() => setShowMoveMenu(null)}
                    triggerRef={{ current: moveButtonRefs.current[conversation._id] }}
                  >
                    {/* New Collection option - always first */}
                    <button 
                      onClick={(e) => handleNewCollectionClick(conversation._id, e)}
                      className="submenu-item submenu-item-new"
                    >
                      <Icon name="plus" size={12} />
                      New Collection
                    </button>
                    
                    {/* Divider */}
                    {(collections.length > 0 || conversation.collectionId) && (
                      <div className="menu-divider" />
                    )}
                    
                    {/* Option to remove from collection */}
                    {(conversation.collectionId || conversation.collectionId?._id) && (
                      <button 
                        onClick={(e) => handleMoveToCollection(conversation._id, null, e)}
                        className="submenu-item"
                      >
                        <Icon name="x" size={12} />
                        Uncategorize
                      </button>
                    )}
                    
                    {/* List collections */}
                    {collections.map(col => {
                      // Handle both string IDs and ObjectId objects
                      const convCollection = conversation.collectionId?._id || conversation.collectionId;
                      const isInCollection = convCollection && String(convCollection) === String(col._id);
                      
                      return (
                        <button
                          key={col._id}
                          onClick={(e) => handleMoveToCollection(conversation._id, col._id, e)}
                          className={`submenu-item ${isInCollection ? 'active' : ''}`}
                        >
                          <Icon name={col.icon || 'folder'} size={12} style={{ color: col.color }} />
                          {col.name}
                          {isInCollection && (
                            <Icon name="check" size={12} className="check-icon" />
                          )}
                        </button>
                      );
                    })}
                  </DropdownSubmenu>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Expand button - only show when collapsed and has more items */}
      {hasMoreItems && !isExpanded && (
        <button 
          className="hub-expand-btn"
          onClick={handleExpandClick}
          aria-label="Show more"
        >
          <span>+{hiddenCount} more</span>
        </button>
      )}
      
      {/* Collapse button - only show when expanded */}
      {hasMoreItems && isExpanded && (
        <button 
          className="hub-expand-btn is-expanded"
          onClick={handleExpandClick}
          aria-label="Collapse list"
        >
          <Icon name="chevronUp" size={12} />
          <span>Show less</span>
        </button>
      )}

      {/* New Collection Modal - matches CollectionsList modal */}
      {showNewCollectionModal && (
        <div className="collection-modal-overlay" onClick={() => setShowNewCollectionModal(false)}>
          <div className="collection-modal" onClick={(e) => e.stopPropagation()}>
            <h4>New Collection</h4>
            <form onSubmit={handleCreateCollectionAndMove}>
              {/* Name input */}
              <div className="form-field">
                <label>Name</label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
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
                      className={`color-option ${newCollectionColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCollectionColor(color)}
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
                      className={`icon-option ${newCollectionIcon === icon ? 'active' : ''}`}
                      onClick={() => setNewCollectionIcon(icon)}
                      style={{ color: newCollectionColor }}
                    >
                      <Icon name={icon} size={16} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button type="button" onClick={() => setShowNewCollectionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={!newCollectionName.trim()}>
                  Create & Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationsHub;

