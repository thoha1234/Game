import React from 'react';
import { VowelChar, VOWEL_LIST } from '../types';
import { Volume2, VolumeX, Maximize, Minimize, HelpCircle, BookOpen, Pause, Play, Sparkles } from 'lucide-react';

interface GameHUDProps {
  playerName: string;
  targetVowel: VowelChar;
  score: number;
  starsCollected: number;
  targetGoal: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onOpenTutorial: () => void;
  onOpenStickerBook: () => void;
  onTogglePause: () => void;
  onFlapClick: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  playerName,
  targetVowel,
  score,
  starsCollected,
  targetGoal,
  isMuted,
  isFullscreen,
  isPaused,
  onToggleMute,
  onToggleFullscreen,
  onOpenTutorial,
  onOpenStickerBook,
  onTogglePause,
  onFlapClick
}) => {
  const currentVowelInfo = VOWEL_LIST.find(v => v.char === targetVowel) || VOWEL_LIST[0];

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5 select-none z-20">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2 sm:gap-4 w-full">
        {/* Left: Target Vowel Indicator with Player Name Tag */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Player Name Badge */}
          <div className="bg-amber-400 text-amber-950 font-black text-xs sm:text-sm px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 w-fit border border-amber-300">
            <span>🐥</span>
            <span>Adik: <strong className="text-white drop-shadow-sm">{playerName}</strong></span>
          </div>

          <div 
            className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border-2 p-2 sm:px-4 sm:py-2 flex items-center gap-2.5 sm:gap-3 transition-transform hover:scale-105"
            style={{ borderColor: currentVowelInfo.color }}
          >
            <div 
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-inner font-vocal animate-pulse"
              style={{ backgroundColor: currentVowelInfo.color }}
            >
              {targetVowel}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cari Huruf
              </span>
              <span className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-1">
                <span>{currentVowelInfo.word}</span>
                <span className="text-base sm:text-lg">{currentVowelInfo.emoji}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Star Progress Goal (5 stars to win round) & Score */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200 px-3 sm:px-5 py-2 flex flex-col items-center">
          <div className="flex items-center gap-1 sm:gap-1.5">
            {Array.from({ length: targetGoal }).map((_, idx) => (
              <span
                key={idx}
                className={`text-xl sm:text-2xl transition-all duration-300 ${
                  idx < starsCollected 
                    ? 'scale-110 filter drop-shadow animate-bounce' 
                    : 'opacity-25 grayscale'
                }`}
              >
                ⭐
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Markah: <span className="text-amber-600 font-black tabular-nums text-sm sm:text-base">{score}</span></span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-slate-200 cursor-pointer"
            title={isMuted ? 'Buka Bunyi' : 'Senyap'}
            aria-label={isMuted ? 'Buka Bunyi' : 'Senyap'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
          </button>

          {/* Sticker Book Button */}
          <button
            onClick={onOpenStickerBook}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-amber-500 cursor-pointer"
            title="Buku Pelekat Ganjaran"
            aria-label="Buku Pelekat Ganjaran"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          {/* Tutorial / Help Button */}
          <button
            onClick={onOpenTutorial}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sky-400 hover:bg-sky-300 text-sky-950 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-sky-500 cursor-pointer"
            title="Panduan Main"
            aria-label="Panduan Main"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Pause Button */}
          <button
            onClick={onTogglePause}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-slate-200 cursor-pointer"
            title={isPaused ? 'Teruskan' : 'Rehat Sebentar'}
            aria-label={isPaused ? 'Teruskan' : 'Rehat Sebentar'}
          >
            {isPaused ? <Play className="w-5 h-5 text-emerald-600 fill-emerald-600" /> : <Pause className="w-5 h-5" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="hidden sm:flex w-11 h-11 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md items-center justify-center transition-all hover:scale-105 active:scale-95 border border-slate-200 cursor-pointer"
            title={isFullscreen ? 'Keluar Skrin Penuh' : 'Skrin Penuh'}
            aria-label="Skrin Penuh"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Flap Button */}
      <div className="flex items-end justify-between w-full mb-1 sm:mb-3">
        {/* Left helper tip */}
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 shadow-sm border border-slate-100 flex items-center gap-1.5">
          <span>💡 Ketik di mana-mana untuk terbang</span>
        </div>

        {/* Large Prominent Flap Button */}
        <button
          onClick={onFlapClick}
          className="pointer-events-auto bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 active:scale-90 text-white font-extrabold text-lg sm:text-xl px-6 py-4 rounded-3xl shadow-xl border-4 border-white flex items-center gap-2.5 transition-transform cursor-pointer"
          style={{ touchAction: 'manipulation' }}
          aria-label="Ketik Untuk Terbang"
        >
          <span className="text-2xl animate-bounce">🪽</span>
          <span className="tracking-wide drop-shadow-sm">TERBANG!</span>
        </button>
      </div>
    </div>
  );
};
