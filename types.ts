export enum ToolType {
  SELECT = 'SELECT',
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE',
  TRIANGLE = 'TRIANGLE',
  ARROW = 'ARROW',
  CLOUD = 'CLOUD',
  NOTE = 'NOTE',
  TEXT = 'TEXT',
  MAGIC = 'MAGIC', // Gemini AI tool
}

export type ElementType = 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'cloud' | 'note' | 'text';

export interface Point {
  x: number;
  y: number;
}

export interface WhiteboardElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  backgroundColor: string;
  strokeColor: string;
  strokeWidth: number;
  // For arrows
  points?: Point[]; 
}

export interface DragInfo {
  startX: number;
  startY: number;
  initialElementX: number;
  initialElementY: number;
}
