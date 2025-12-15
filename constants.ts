import { ToolType } from "./types";

export const COLORS = [
  { name: 'Yellow', value: '#fef3c7', border: '#d97706' },
  { name: 'Blue', value: '#bfdbfe', border: '#2563eb' },
  { name: 'Green', value: '#bbf7d0', border: '#16a34a' },
  { name: 'Red', value: '#fecaca', border: '#dc2626' },
  { name: 'Purple', value: '#e9d5ff', border: '#9333ea' },
  { name: 'White', value: '#ffffff', border: '#475569' },
  { name: 'Black', value: '#000000', border: '#000000' }, // Mostly for text/stroke
];

export const TOOL_LABELS: Record<ToolType, string> = {
  [ToolType.SELECT]: 'Select & Move',
  [ToolType.RECTANGLE]: 'Rectangle',
  [ToolType.CIRCLE]: 'Circle',
  [ToolType.TRIANGLE]: 'Triangle',
  [ToolType.ARROW]: 'Arrow',
  [ToolType.CLOUD]: 'Cloud',
  [ToolType.NOTE]: 'Sticky Note',
  [ToolType.TEXT]: 'Text Label',
  [ToolType.MAGIC]: 'AI Brainstorm',
};

export const DEFAULT_NOTE_SIZE = 200;
export const DEFAULT_SHAPE_SIZE = 100;
