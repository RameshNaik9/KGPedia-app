/**
 * MarkdownRenderer - Renders markdown content with proper formatting
 * Supports headings, lists, code blocks, links, etc.
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import './MarkdownRenderer.css';

const MarkdownRenderer = ({ content, isStreaming = false }) => {
  if (!content) return null;

  return (
    <div className={`markdown-content ${isStreaming ? 'is-streaming' : ''}`}>
      <ReactMarkdown
        components={{
          // Headings
          h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
          h4: ({ children }) => <h4 className="md-h4">{children}</h4>,
          
          // Paragraphs
          p: ({ children }) => <p className="md-paragraph">{children}</p>,
          
          // Lists
          ul: ({ children }) => <ul className="md-ul">{children}</ul>,
          ol: ({ children }) => <ol className="md-ol">{children}</ol>,
          li: ({ children }) => <li className="md-li">{children}</li>,
          
          // Code
          code: ({ inline, children, ...props }) => {
            if (inline) {
              return <code className="md-inline-code" {...props}>{children}</code>;
            }
            return (
              <div className="md-code-block">
                <pre>
                  <code {...props}>{children}</code>
                </pre>
              </div>
            );
          },
          
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="md-blockquote">{children}</blockquote>
          ),
          
          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="md-link"
            >
              {children}
            </a>
          ),
          
          // Strong/Bold
          strong: ({ children }) => <strong className="md-strong">{children}</strong>,
          
          // Emphasis/Italic
          em: ({ children }) => <em className="md-em">{children}</em>,
          
          // Horizontal Rule
          hr: () => <hr className="md-hr" />,
          
          // Tables
          table: ({ children }) => (
            <div className="md-table-wrapper">
              <table className="md-table">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="md-thead">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="md-tr">{children}</tr>,
          th: ({ children }) => <th className="md-th">{children}</th>,
          td: ({ children }) => <td className="md-td">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
      
      {/* Streaming cursor */}
      {isStreaming && <span className="streaming-cursor" />}
    </div>
  );
};

export default MarkdownRenderer;

