
export enum AIAppMode {
  CHAT = 'chat',
  IMAGE = 'image',
  LIVE = 'live',
  VIDEO = 'video',
  SEARCH = 'search'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'video';
  metadata?: any;
}

export interface GenerationState {
  isGenerating: boolean;
  progress?: number;
  statusMessage?: string;
}
