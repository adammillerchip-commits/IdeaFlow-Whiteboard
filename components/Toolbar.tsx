import React from 'react';
import { 
  MousePointer2, Square, Circle, Triangle, MoveUpRight, 
  Cloud, StickyNote, Type, Sparkles, Download, Undo2, Redo2
} from 'lucide-react';
import { ToolType } from '../types';
import { TOOL_LABELS } from '../constants';

interface ToolbarProps {
  currentTool: ToolType;
  setTool: (tool: ToolType) => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  currentTool, setTool, onSave, onUndo, onRedo, canUndo, canRedo 
}) => {
  const tools = [
    { type: ToolType.SELECT, icon: <MousePointer2 size={20} /> },
    { type: ToolType.NOTE, icon: <StickyNote size={20} /> },
    { type: ToolType.TEXT, icon: <Type size={20} /> },
    { type: ToolType.RECTANGLE, icon: <Square size={20} /> },
    { type: ToolType.CIRCLE, icon: <Circle size={20} /> },
    { type: ToolType.TRIANGLE, icon: <Triangle size={20} /> },
    { type: ToolType.ARROW, icon: <MoveUpRight size={20} /> },
    { type: ToolType.CLOUD, icon: <Cloud size={20} /> },
    { type: ToolType.MAGIC, icon: <Sparkles size={20} /> },
  ];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-xl p-2 flex items-center gap-2 border border-slate-200 z-50">
      <div className="flex gap-1 mr-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-2 rounded-lg transition-colors ${
            canUndo ? 'hover:bg-slate-100 text-slate-700' : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={20} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-2 rounded-lg transition-colors ${
            canRedo ? 'hover:bg-slate-100 text-slate-700' : 'text-slate-300 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={20} />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1"></div>

      {tools.map((tool) => (
        <button
          key={tool.type}
          onClick={() => setTool(tool.type)}
          className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center group relative
            ${currentTool === tool.type 
              ? 'bg-blue-100 text-blue-600 shadow-inner' 
              : 'hover:bg-slate-100 text-slate-600'
            }`}
          title={TOOL_LABELS[tool.type]}
        >
          {tool.icon}
          {tool.type === ToolType.MAGIC && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
          )}
        </button>
      ))}
      <div className="w-px h-6 bg-slate-200 mx-2"></div>
      <button
        onClick={onSave}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        title="Save as Image"
      >
        <Download size={20} />
      </button>
    </div>
  );
};

export default Toolbar;