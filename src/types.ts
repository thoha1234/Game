/**
 * Game definitions and types for Flappy Vokal Cilik (Preschool Malay Vowels)
 */

export type VowelChar = 'a' | 'e' | 'i' | 'o' | 'u';

export interface VowelInfo {
  char: VowelChar;
  word: string;
  emoji: string;
  syllables: string; // e.g. "a - yam"
  color: string; // vibrant kid-friendly color
  lightColor: string;
  bubbleColor: string;
  soundPreviewNotes: number[]; // frequency preview
}

export const VOWEL_LIST: VowelInfo[] = [
  {
    char: 'a',
    word: 'ayam',
    emoji: '🐣',
    syllables: 'a - yam',
    color: '#EF4444', // Red / Coral
    lightColor: '#FEE2E2',
    bubbleColor: '#F87171',
    soundPreviewNotes: [523.25, 659.25]
  },
  {
    char: 'e',
    word: 'epal',
    emoji: '🍎',
    syllables: 'e - pal',
    color: '#10B981', // Emerald green
    lightColor: '#D1FAE5',
    bubbleColor: '#34D399',
    soundPreviewNotes: [587.33, 783.99]
  },
  {
    char: 'i',
    word: 'itik',
    emoji: '🦆',
    syllables: 'i - tik',
    color: '#3B82F6', // Sky blue
    lightColor: '#DBEAFE',
    bubbleColor: '#60A5FA',
    soundPreviewNotes: [659.25, 880.00]
  },
  {
    char: 'o',
    word: 'obor',
    emoji: '🔥',
    syllables: 'o - bor',
    color: '#F59E0B', // Bright Amber Orange
    lightColor: '#FEF3C7',
    bubbleColor: '#FBBF24',
    soundPreviewNotes: [783.99, 1046.50]
  },
  {
    char: 'u',
    word: 'udang',
    emoji: '🦐',
    syllables: 'u - dang',
    color: '#8B5CF6', // Purple
    lightColor: '#EDE9FE',
    bubbleColor: '#A78BFA',
    soundPreviewNotes: [880.00, 1174.66]
  }
];

export type GameMode = 'ALL_RANDOM' | VowelChar;

export type GameScreen = 
  | 'NAME_ENTRY'
  | 'MENU' 
  | 'TUTORIAL' 
  | 'PLAYING' 
  | 'REWARD' 
  | 'STICKER_BOOK' 
  | 'VOWEL_SELECT';

export interface FloatingBubble {
  id: number;
  x: number;
  y: number;
  radius: number;
  char: VowelChar;
  isTarget: boolean;
  collected: boolean;
  wobbleOffset: number;
  wobbleSpeed: number;
  ringHue: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  spin: number;
  shape: 'circle' | 'star' | 'feather' | 'question';
  life: number;
  maxLife: number;
}

export interface FloatingTextReward {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
  isNegative?: boolean;
}

export interface Cloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
  opacity: number;
}

export interface BirdState {
  x: number;
  y: number;
  radius: number;
  vy: number;
  rotation: number;
  flapFrame: number;
  isFlapping: boolean;
  blinkTimer: number;
  isBlinking: boolean;
  invincibleTimer: number;
  isDizzy: boolean;
  dizzyTimer: number;
}

export const PRAISE_PHRASES = [
  'Hebat! 🌟',
  'Pandai! ⭐',
  'Bagus! 🎈',
  'Bijak! 🎉',
  'Tahniah! 🏆',
  'Super! 🚀',
  'Bintang! ✨'
];

export const PRESET_NAMES = ['Adam', 'Aisyah', 'Ali', 'Hana', 'Umar', 'Zara', 'Rayyan', 'Maya'];
