/**
 * AIModels - AI Model selector component
 * Allows users to select different AI models/modes
 */

import React, { useState } from 'react';
import Icon from '../ui/Icon';
import './AIModels.css';

/**
 * KGPedia AI Models (RAG-based)
 * 
 * Each "model" represents a different configuration of:
 * - LLM backbone (API)
 * - Retrieval strategy
 * - Response style
 * - Knowledge scope
 */
const AI_MODELS = [
  {
    id: 'kgpedia-standard',
    name: 'KGPedia Standard',
    description: 'Balanced speed & quality for everyday queries',
    icon: 'sparkles',
    badge: 'Default',
    color: '#3b82f6',
    config: { llm: 'gpt-4o-mini', retrieval: 'hybrid', style: 'balanced' },
  },
  {
    id: 'kgpedia-pro',
    name: 'KGPedia Pro',
    description: 'Premium LLM with deep knowledge search',
    icon: 'crown',
    badge: 'Pro',
    color: '#8b5cf6',
    config: { llm: 'gpt-4o', retrieval: 'dense+rerank', style: 'comprehensive' },
  },
  {
    id: 'kgpedia-lite',
    name: 'KGPedia Lite',
    description: 'Fast responses for quick lookups',
    icon: 'zap',
    badge: null,
    color: '#10b981',
    config: { llm: 'gpt-4o-mini', retrieval: 'sparse', style: 'concise' },
  },
  {
    id: 'kgpedia-deep',
    name: 'KGPedia Deep',
    description: 'Extended context with citations',
    icon: 'search',
    badge: 'Research',
    color: '#f59e0b',
    config: { llm: 'gpt-4o', retrieval: 'dense+rerank', style: 'academic' },
  },
  {
    id: 'kgpedia-fresh',
    name: 'KGPedia Fresh',
    description: 'Latest data priority for current events',
    icon: 'refresh',
    badge: 'New',
    color: '#ec4899',
    config: { llm: 'gpt-4o-mini', retrieval: 'realtime', style: 'news' },
  },
];

const AIModels = ({ selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(selectedModel || AI_MODELS[0].id);

  const currentModel = AI_MODELS.find(m => m.id === selected) || AI_MODELS[0];

  const handleSelect = (modelId) => {
    setSelected(modelId);
    setIsOpen(false);
    onModelChange?.(modelId);
  };

  return (
    <div className="ai-models">
      <div className="ai-models__header">
        <h3 className="ai-models__title">AI Model</h3>
      </div>

      <div className="ai-models__selector">
        <button 
          className={`model-trigger ${isOpen ? 'is-open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="model-trigger__icon" style={{ color: currentModel.color }}>
            <Icon name={currentModel.icon} size={16} />
          </div>
          <div className="model-trigger__info">
            <span className="model-trigger__name">{currentModel.name}</span>
            {currentModel.badge && (
              <span className="model-trigger__badge">{currentModel.badge}</span>
            )}
          </div>
          <Icon 
            name={isOpen ? 'chevronUp' : 'chevronDown'} 
            size={14} 
            className="model-trigger__chevron" 
          />
        </button>

        {isOpen && (
          <div className="model-dropdown">
            {AI_MODELS.map(model => (
              <button
                key={model.id}
                className={`model-option ${selected === model.id ? 'is-selected' : ''}`}
                onClick={() => handleSelect(model.id)}
              >
                <div className="model-option__icon" style={{ color: model.color }}>
                  <Icon name={model.icon} size={18} />
                </div>
                <div className="model-option__info">
                  <span className="model-option__name">
                    {model.name}
                    {model.badge && (
                      <span className="model-option__badge">{model.badge}</span>
                    )}
                  </span>
                  <span className="model-option__desc">{model.description}</span>
                </div>
                {selected === model.id && (
                  <Icon name="check" size={16} className="model-option__check" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIModels;

