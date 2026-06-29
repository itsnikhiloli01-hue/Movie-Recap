export interface Scene {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  description: string;
  visualSummary: string;
  detectedObjects: string[];
  emotion: string;
  thumbnailUrl: string;
}

export interface Character {
  name: string;
  role: string;
  confidence: number;
  appearancesCount: number;
  avatarUrl: string;
}

export interface EmotionDataPoint {
  timestamp: number;
  score: number; // -1 (very negative) to 1 (very positive)
  dominantEmotion: string;
}

export interface ActionSequence {
  startTime: number;
  endTime: number;
  intensity: 'low' | 'medium' | 'high';
  description: string;
}

export interface DialogueLine {
  timestamp: number;
  character: string;
  text: string;
}

export interface MovieAnalysis {
  scenes: Scene[];
  characters: Character[];
  emotions: EmotionDataPoint[];
  actions: ActionSequence[];
  dialogues: DialogueLine[];
}

export interface ScriptLine {
  id: string;
  timestamp: number;
  duration: number;
  text: string;
  sceneId: string;
  audioUrl?: string; // WAV base64 data URI
  isGeneratingVoice?: boolean;
}

export interface NarrationScript {
  id: string;
  tone: 'suspenseful' | 'action' | 'analytical' | 'dramatic' | 'humorous';
  lengthMinutes: number; // 10, 15, 20, 25, 30
  storyline: string;
  narrator: string; // prebuiltVoiceConfig Name (Kore, Puck, Fenrir, Zephyr, etc.)
  lines: ScriptLine[];
}

export interface AudioSettings {
  bgMusicGenre: 'suspense' | 'action' | 'drama' | 'horror' | 'romance' | 'scifi' | 'none';
  bgMusicVolume: number; // 0 to 1
  voiceVolume: number; // 0 to 1
  autoDucking: boolean;
}

export interface Timeline {
  captionStyle: 'tiktok' | 'netflix' | 'cinematic' | 'neon';
  wordHighlight: boolean;
  zoomEffectsEnabled: boolean;
  transitionsEnabled: boolean;
}

export interface ExportSettings {
  format: 'mp4' | 'mov' | 'mkv';
  aspectRatio: 'landscape' | 'vertical' | 'square';
  resolution: '720p' | '1080p' | '4K';
  subtitleLanguage: 'en' | 'es' | 'fr' | 'de' | 'ja';
}

export interface MovieProject {
  id: string;
  title: string;
  videoUrl: string;
  duration: number; // in seconds
  status: 'created' | 'analyzed' | 'scripted' | 'voiced' | 'rendered';
  createdAt: string;
  analysis: MovieAnalysis;
  script: NarrationScript;
  audioSettings: AudioSettings;
  timeline: Timeline;
  exportSettings: ExportSettings;
}

// Pre-indexed movie configurations for our template library
export interface MovieTemplate {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  thumbnailUrl: string;
  year: number;
  genre: string;
}
