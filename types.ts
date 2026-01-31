
export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  GLASS = 'GLASS',
  ONE_UI_DARK = 'ONE_UI_DARK',
  RETRO_3D = 'RETRO_3D',
}

export enum AnimationStyle {
  FLUID_BLUR = 'FLUID_BLUR',
  FADEOUT_OVERLAY = 'FADEOUT_OVERLAY',
  FREE_FALL = 'FREE_FALL',
  ELASTIC_SLIDE = 'ELASTIC_SLIDE',
}

export enum AppView {
  HOME = 'HOME',
  STUDIO = 'STUDIO',
  USER = 'USER',
}

export enum ToolMode {
  NONE = 'NONE',
  SYNOPSIS = 'SYNOPSIS',
  HASHTAGS = 'HASHTAGS',
}

export enum SynopsisMode {
  DESCRIPTIVE = 'Descriptive',
  SUSPENSE = 'Suspense',
  ENGAGING = 'Engaging',
  DEFAULT = 'Default',
}

export interface GenerationHistory {
  id: string;
  type: 'synopsis' | 'hashtags';
  content: string;
  timestamp: number;
  params: any;
  isFavorite: boolean;
}

export interface AppSettings {
  theme: Theme;
  slideEnabled: boolean;
  animationStyle: AnimationStyle;
  bouncingAnimation: boolean;
  audioEnabled: boolean;
  enable3DMode: boolean;
  enableNeon: boolean;
  experimentalFeatures: boolean;
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
  isLoggedIn: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type AIModelId = 'gemini-3-pro-preview' | 'gemini-2.5-flash' | 'gemini-2.0-flash';

export const AI_MODELS: {id: AIModelId; name: string; description: string}[] = [
    { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', description: 'Complex reasoning & creativity' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'High speed & efficiency' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Reliable standard performance' },
];
