export interface Coordinate {
    x: number;
    y: number;
  }
  
  export interface SimulationState {
    step: number;
    instruction: string;
    isComposerOpen: boolean;
    title: string;
    body: string;
    isSubmitted: boolean;
    cursorPos: Coordinate;
    isClicking: boolean;
    activeTool: string | null;
    selectionRange: { start: number; end: number } | null;
  }
  
  export interface MarkdownPreviewProps {
    text: string;
  }

  export type SimulatorMode = 'create' | 'reply' | 'follow' | 'user-info';
