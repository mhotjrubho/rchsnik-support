export interface Coordinate {
  x: number;
  y: number;
}

export type SimulatorMode = 'create' | 'reply' | 'follow' | 'user-info';

export interface StepDefinition {
  id: number;
  title: string;
  instruction: string;
  tip?: string;
  targetKey: string;
}

export interface SimulationState {
  step: number;
  instruction: string;
  tip?: string;
  isComposerOpen: boolean;
  title: string;
  body: string;
  category: string;
  isSubmitted: boolean;
  cursorPos: Coordinate;
  isClicking: boolean;
  activeTool: string | null;
  targetRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export interface MarkdownPreviewProps {
  text: string;
}
