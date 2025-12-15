import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ElementType, ToolType, WhiteboardElement, DragInfo } from './types';
import { DEFAULT_NOTE_SIZE, COLORS } from './constants';
import Toolbar from './components/Toolbar';
import ElementRenderer from './components/ElementRenderer';
import { generateIdeas } from './services/geminiService';
import { exportCanvasAsImage } from './utils/export';
import { Sparkles, Trash2, X } from 'lucide-react';

const App: React.FC = () => {
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  // History State
  const [history, setHistory] = useState<WhiteboardElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [tool, setTool] = useState<ToolType>(ToolType.SELECT);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Text Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Keep a ref to elements to access latest state in async operations or event listeners if needed
  const elementsRef = useRef(elements);
  elementsRef.current = elements;

  // --- History Helpers ---

  const addToHistory = (newElements: WhiteboardElement[]) => {
    // If we are in the middle of history (undid some steps), slice off the future
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
      setSelectedId(null); // Clear selection to avoid issues
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
      setSelectedId(null);
    }
  };

  // --- Handlers ---

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    
    const ideas = await generateIdeas(aiPrompt);
    
    // Position new notes in a grid near the center
    const centerX = window.innerWidth / 2 - 300;
    const centerY = window.innerHeight / 2 - 200;
    
    const newElements: WhiteboardElement[] = ideas.map((idea, index) => ({
      id: uuidv4(),
      type: 'note',
      x: centerX + (index % 2) * (DEFAULT_NOTE_SIZE + 20),
      y: centerY + Math.floor(index / 2) * (DEFAULT_NOTE_SIZE + 20),
      width: DEFAULT_NOTE_SIZE,
      height: DEFAULT_NOTE_SIZE,
      backgroundColor: COLORS[index % COLORS.length].value,
      strokeColor: 'transparent',
      strokeWidth: 0,
      text: idea,
    }));

    // Use ref to get the absolute latest elements since this is async
    const currentElements = elementsRef.current;
    const updatedElements = [...currentElements, ...newElements];
    
    setElements(updatedElements);
    addToHistory(updatedElements);
    
    setIsAiLoading(false);
    setIsAiModalOpen(false);
    setAiPrompt('');
    setTool(ToolType.SELECT);
  };

  const handleMouseDown = (e: React.MouseEvent, id?: string) => {
    if (tool === ToolType.MAGIC) {
      setIsAiModalOpen(true);
      return;
    }

    // Drawing Logic
    if (tool !== ToolType.SELECT) {
      const type = tool.toLowerCase() as ElementType;
      // For click-to-place tools (text, note)
      if (type === 'note' || type === 'text') {
        const width = type === 'text' ? 150 : DEFAULT_NOTE_SIZE;
        const height = type === 'text' ? 50 : DEFAULT_NOTE_SIZE;
        
        const newEl: WhiteboardElement = {
          id: uuidv4(),
          type,
          // Center the element on the cursor
          x: e.clientX - width / 2,
          y: e.clientY - height / 2,
          width,
          height,
          backgroundColor: type === 'note' ? COLORS[0].value : 'transparent',
          strokeColor: '#000',
          strokeWidth: 0,
          text: '', // Start empty for both text and notes
        };
        const updatedElements = [...elements, newEl];
        setElements(updatedElements);
        addToHistory(updatedElements);
        
        setTool(ToolType.SELECT);
        setEditingId(newEl.id);
        setEditText('');
        return;
      }
      
      // For drag-to-create tools (shapes)
      setIsDrawing(true);
      const startX = e.clientX;
      const startY = e.clientY;
      
      const newEl: WhiteboardElement = {
        id: uuidv4(),
        type,
        x: startX,
        y: startY,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        strokeColor: '#1e293b',
        strokeWidth: 2,
      };
      // We don't save to history yet, only on mouse up
      setElements(prev => [...prev, newEl]);
      setSelectedId(newEl.id);
      return;
    }

    // Select/Drag Logic
    if (id) {
      setSelectedId(id);
      const el = elements.find(el => el.id === id);
      if (el) {
        setIsDragging(true);
        setDragInfo({
          startX: e.clientX,
          startY: e.clientY,
          initialElementX: el.x,
          initialElementY: el.y,
        });
      }
    } else {
      // Clicked on empty canvas
      setSelectedId(null);
      setEditingId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing && selectedId) {
       setElements(prev => prev.map(el => {
         if (el.id === selectedId) {
           const currentX = e.clientX;
           const currentY = e.clientY;
           const width = currentX - el.x;
           const height = currentY - el.y;
           // Handle negative width/height by adjusting x/y
           return {
             ...el,
             width: Math.abs(width),
             height: Math.abs(height),
             x: width < 0 ? currentX : el.x,
             y: height < 0 ? currentY : el.y,
           };
         }
         return el;
       }));
    } else if (isDragging && dragInfo && selectedId) {
      const dx = e.clientX - dragInfo.startX;
      const dy = e.clientY - dragInfo.startY;
      setElements(prev => prev.map(el => {
        if (el.id === selectedId) {
          return {
            ...el,
            x: dragInfo.initialElementX + dx,
            y: dragInfo.initialElementY + dy,
          };
        }
        return el;
      }));
    }
  };

  const handleMouseUp = () => {
    if (isDragging || isDrawing) {
      // Check if state actually changed before saving to history
      // Simple JSON comparison is sufficient for this app size
      const prevHistory = history[historyIndex];
      if (JSON.stringify(elements) !== JSON.stringify(prevHistory)) {
        addToHistory(elements);
      }
    }

    setIsDragging(false);
    setIsDrawing(false);
    setDragInfo(null);
    if(isDrawing) {
        setTool(ToolType.SELECT);
    }
  };

  const updateElementText = (id: string, text: string) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, text } : el));
  };

  const deleteElement = () => {
    if (selectedId) {
      const updatedElements = elements.filter(el => el.id !== selectedId);
      setElements(updatedElements);
      addToHistory(updatedElements);
      setSelectedId(null);
    }
  };

  const updateColor = (color: string) => {
    if (selectedId) {
      const updatedElements = elements.map(el => el.id === selectedId ? { ...el, backgroundColor: color } : el);
      setElements(updatedElements);
      addToHistory(updatedElements);
    }
  }

  // Keyboard shortcut for delete and undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !editingId) {
        deleteElement();
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
         redo();
         e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, editingId, historyIndex, history]); // Dependencies needed for closures

  return (
    <div 
      className="w-screen h-screen overflow-hidden relative dot-pattern font-sans select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Toolbar 
        currentTool={tool} 
        setTool={setTool} 
        onSave={() => exportCanvasAsImage(elements)}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      {/* Properties Panel (Simple) */}
      {selectedId && !isDrawing && !isDragging && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg p-2 flex gap-2 border border-gray-200 z-40">
           <div className="flex gap-1">
             {COLORS.map(c => (
               <button 
                key={c.name}
                onClick={() => updateColor(c.value)}
                className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: c.value }}
                title={c.name}
               />
             ))}
           </div>
           <div className="w-px h-6 bg-gray-200 mx-1"></div>
           <button onClick={deleteElement} className="text-red-500 hover:bg-red-50 p-1 rounded">
             <Trash2 size={16} />
           </button>
        </div>
      )}

      {/* Canvas Area */}
      <div 
        className="w-full h-full relative"
        onMouseDown={(e) => handleMouseDown(e)}
      >
        {elements.map(el => (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              cursor: tool === ToolType.SELECT ? 'move' : 'default',
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown(e, el.id);
            }}
            onDoubleClick={() => {
              if (el.type === 'note' || el.type === 'text') {
                setEditingId(el.id);
                setEditText(el.text || '');
              }
            }}
          >
            <ElementRenderer 
              element={el} 
              isSelected={selectedId === el.id} 
              isEditing={editingId === el.id} 
            />
            
            {/* Inline Editor */}
            {editingId === el.id && (
              <div className="absolute inset-0 z-50">
                <textarea
                  className={`w-full h-full resize-none outline-none bg-transparent ${
                    el.type === 'text' ? 'p-2 font-bold text-center' : 'p-4 font-handwriting'
                  }`}
                  style={{ 
                     fontFamily: el.type === 'note' ? '"Comic Sans MS", "Chalkboard SE", sans-serif' : undefined,
                     fontSize: el.type === 'text' ? '20px' : '18px'
                  }}
                  autoFocus
                  value={editText}
                  onChange={(e) => {
                    setEditText(e.target.value);
                    updateElementText(el.id, e.target.value);
                  }}
                  onBlur={() => {
                    setEditingId(null);
                    // Check if text changed from history
                    const prevHistory = history[historyIndex];
                    if (JSON.stringify(elements) !== JSON.stringify(prevHistory)) {
                      addToHistory(elements);
                    }
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-full animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="text-purple-500" />
                AI Brainstorm
              </h2>
              <button onClick={() => setIsAiModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">
              Enter a topic, and Gemini will generate sticky notes with ideas for you.
            </p>

            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px]"
              placeholder="e.g., Marketing strategies for a coffee shop..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleAiGenerate}
                disabled={isAiLoading || !aiPrompt.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2 transition-all"
              >
                {isAiLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                Generate Ideas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;