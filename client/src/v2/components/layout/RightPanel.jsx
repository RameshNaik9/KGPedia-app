/**
 * RightPanel - Sidebar with AI Module, Conversations, Collections
 * Always rendered for smooth animations, CSS controls visibility
 */

import React, { useState } from 'react';
import Icon from '../ui/Icon';
import { useLayout } from '../../context/LayoutContext';
import './RightPanel.css';

const RightPanel = ({ 
  conversations = [], 
  collections = [],
  activeConversationId,
  onConversationSelect,
  onCollectionSelect
}) => {
  const { isRightPanelVisible } = useLayout();
  const [activeTab, setActiveTab] = useState('recent');
  const [expandedCollections, setExpandedCollections] = useState(['personal-assistant']);
  const [selectedModule] = useState('thinker');

  const modules = [
    { id: 'thinker', name: 'Thinker', icon: 'sparkles' },
    { id: 'creator', name: 'Creator', icon: 'sparkles' },
    { id: 'analyst', name: 'Analyst', icon: 'sparkles' },
  ];

  const toggleCollection = (collectionId) => {
    setExpandedCollections(prev => 
      prev.includes(collectionId) 
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  // Mock data
  const mockConversations = conversations.length > 0 ? conversations : [
    { id: '1', title: 'How do I reset my password?', timestamp: new Date() },
    { id: '2', title: "What's on my schedule today?", timestamp: new Date() },
    { id: '3', title: 'Remind me to submit the project...', timestamp: new Date() },
    { id: '4', title: 'Can you help me track my order?', timestamp: new Date() },
  ];

  const mockCollections = collections.length > 0 ? collections : [
    { 
      id: 'project-management', 
      name: 'Project Management', 
      icon: 'folder',
      items: []
    },
    { 
      id: 'personal-assistant', 
      name: 'Personal Assistant', 
      icon: 'folderOpen',
      items: [
        { id: 'pa-1', title: 'Schedule a dentist appointment...' },
        { id: 'pa-2', title: 'Remind me to call Sarah at 5 PM...' },
      ]
    },
    { 
      id: 'customer-support', 
      name: 'Customer Support', 
      icon: 'folder',
      items: []
    },
  ];

  // Always render for smooth animations
  return (
    <aside className={`right-panel ${!isRightPanelVisible ? 'is-hidden' : ''}`}>
      {/* AI Module Section */}
      <section className="panel-section">
        <h3 className="section-title">Ai Module</h3>
        <div className="module-selector">
          <button className="module-button">
            <Icon name="sparkles" size={14} className="module-icon" />
            <span>{modules.find(m => m.id === selectedModule)?.name}</span>
            <Icon name="chevronDown" size={14} className="chevron" />
          </button>
        </div>
      </section>

      {/* Conversations Section */}
      <section className="panel-section">
        <h3 className="section-title">Conversations</h3>
        
        <div className="tab-switcher">
          <button 
            className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recent
          </button>
          <button 
            className={`tab-button ${activeTab === 'favorite' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorite')}
          >
            Favorite
          </button>
        </div>

        <ul className="conversation-list">
          {mockConversations.map((convo) => (
            <li key={convo.id}>
              <button 
                className={`conversation-item ${activeConversationId === convo.id ? 'active' : ''}`}
                onClick={() => onConversationSelect?.(convo.id)}
              >
                <span className="conversation-title">{convo.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Collections Section */}
      <section className="panel-section">
        <div className="section-header">
          <h3 className="section-title">Collections</h3>
          <span className="badge badge--new">New</span>
        </div>

        <ul className="collection-list">
          {mockCollections.map((collection) => (
            <li key={collection.id} className="collection-item">
              <button 
                className={`collection-header ${expandedCollections.includes(collection.id) ? 'expanded' : ''}`}
                onClick={() => toggleCollection(collection.id)}
              >
                <Icon 
                  name={expandedCollections.includes(collection.id) ? 'folderOpen' : 'folder'} 
                  size={16} 
                  className="collection-icon"
                />
                <span className="collection-name">{collection.name}</span>
                {collection.items.length > 0 && (
                  <Icon 
                    name={expandedCollections.includes(collection.id) ? 'chevronUp' : 'chevronDown'} 
                    size={14} 
                    className="expand-icon"
                  />
                )}
              </button>
              
              {expandedCollections.includes(collection.id) && collection.items.length > 0 && (
                <ul className="collection-items">
                  {collection.items.map((item) => (
                    <li key={item.id}>
                      <button 
                        className="collection-subitem"
                        onClick={() => onCollectionSelect?.(collection.id, item.id)}
                      >
                        <span className="bullet">•</span>
                        <span className="subitem-title">{item.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
};

export default RightPanel;
