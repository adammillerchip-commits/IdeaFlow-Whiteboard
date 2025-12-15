import React from 'react';
import { WhiteboardElement } from '../types';

interface ElementRendererProps {
  element: WhiteboardElement;
  isSelected: boolean;
  isEditing?: boolean;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({ element, isSelected, isEditing }) => {
  const { type, width, height, backgroundColor, strokeColor, strokeWidth, text, points } = element;
  
  const commonStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none', // Allow clicks to pass through to the container for selection
  };

  const selectionStyle = isSelected ? {
    outline: '2px solid #3b82f6',
    outlineOffset: '4px',
  } : {};

  switch (type) {
    case 'rectangle':
      return (
        <div style={{ ...commonStyle, backgroundColor, border: `${strokeWidth}px solid ${strokeColor}`, ...selectionStyle }} />
      );
    
    case 'circle':
      return (
        <div style={{ ...commonStyle, backgroundColor, borderRadius: '50%', border: `${strokeWidth}px solid ${strokeColor}`, ...selectionStyle }} />
      );

    case 'triangle':
      return (
        <div style={{ ...commonStyle, ...selectionStyle }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="50,5 95,95 5,95" fill={backgroundColor} stroke={strokeColor} strokeWidth={strokeWidth} />
          </svg>
        </div>
      );

    case 'arrow':
      // Basic arrow rendering logic assuming simple directional arrow for MVP
      return (
        <div style={{ ...commonStyle, ...selectionStyle }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
             <defs>
              <marker id={`arrowhead-${element.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} />
              </marker>
            </defs>
            <line 
              x1="10" y1="90" x2="90" y2="10" 
              stroke={strokeColor} 
              strokeWidth={Math.max(2, strokeWidth)} 
              markerEnd={`url(#arrowhead-${element.id})`} 
            />
          </svg>
        </div>
      );

    case 'cloud':
      return (
        <div style={{ ...commonStyle, ...selectionStyle }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M25,60 a20,20 0 0,1 0,-40 a20,20 0 0,1 50,0 a20,20 0 0,1 0,40 z" 
                  fill={backgroundColor} stroke={strokeColor} strokeWidth={strokeWidth} transform="scale(1.2 0.8) translate(-10 20)" />
          </svg>
        </div>
      );

    case 'note':
      return (
        <div 
          style={{ 
            ...commonStyle, 
            backgroundColor, 
            boxShadow: '4px 4px 10px rgba(0,0,0,0.1)',
            ...selectionStyle 
          }}
          className="flex flex-col p-4"
        >
          <div className="flex-1 font-handwriting text-lg leading-relaxed overflow-hidden text-gray-800 font-medium" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
            {!isEditing && (text || "Double click to edit")}
          </div>
        </div>
      );

    case 'text':
      return (
        <div 
          style={{ 
            ...commonStyle, 
            ...selectionStyle,
            backgroundColor: 'transparent'
          }}
          className="flex items-center justify-center p-2"
        >
          {!isEditing && (
            <span 
              className="text-xl font-bold text-gray-800 whitespace-pre-wrap text-center leading-tight w-full h-full flex items-center justify-center" 
              style={{ wordBreak: 'break-word' }}
            >
              {text || (isSelected ? "" : "Text")}
            </span>
          )}
        </div>
      );

    default:
      return null;
  }
};

export default ElementRenderer;