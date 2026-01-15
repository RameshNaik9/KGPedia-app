/**
 * TrendingTopics - Web3 styled trending topics component
 * Shows trending discussions and topics in the KGP community
 */

import React from 'react';
import Icon from '../ui/Icon';
import './TrendingTopics.css';

// Fake trending data for demonstration
const TRENDING_TOPICS = [
  {
    id: 1,
    title: 'Spring Fest 2024 Updates',
    category: 'Events',
    heat: 'hot',
    count: 234,
  },
  {
    id: 2,
    title: 'Google Summer Internship',
    category: 'Placements',
    heat: 'rising',
    count: 156,
  },
  {
    id: 3,
    title: 'Mid-sem Schedule Released',
    category: 'Academics',
    heat: 'new',
    count: 89,
  },
  {
    id: 4,
    title: 'Inter-IIT Tech Meet Prep',
    category: 'Gymkhana',
    heat: 'rising',
    count: 67,
  },
];

const TrendingTopics = () => {
  return (
    <div className="trending-topics">
      <div className="trending-topics__header">
        <h3 className="trending-topics__title">
          <Icon name="trendingUp" size={14} />
          Trending
        </h3>
      </div>

      <div className="trending-topics__list">
        {TRENDING_TOPICS.map((topic, index) => (
          <button key={topic.id} className="trending-item">
            <span className="trending-item__rank">{index + 1}</span>
            <div className="trending-item__content">
              <span className="trending-item__title">{topic.title}</span>
              <div className="trending-item__meta">
                <span className="trending-item__category">{topic.category}</span>
                <span className={`trending-item__heat trending-item__heat--${topic.heat}`}>
                  {topic.heat === 'hot' && <Icon name="fire" size={10} />}
                  {topic.heat === 'rising' && <Icon name="trendingUp" size={10} />}
                  {topic.heat === 'new' && <Icon name="sparkles" size={10} />}
                  {topic.count}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics;

