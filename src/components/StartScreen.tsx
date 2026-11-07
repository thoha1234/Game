import React from 'react';
import { VowelChar, VOWEL_LIST } from '../types';
import { Play, BookOpen, Volume2, VolumeX, Maximize, Minimize, Sparkles, Pencil } from 'lucide-react';
import { soundFX } from '../audio/soundFX';

interface StartScreenProps {
  playerName: string;
  selectedVowel: VowelChar;
  onSelectVowel: (char: VowelChar) => void;
  onStartGame: () => void;
  onOpenStickerBook: () => void;
  onChangeName: () => void;
  isMuted: boolean;
  isFullscreen: boolean;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  highScore: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  playerName,
  selectedVowel,
  onSelectVowel,
  onStartGame,
  onOpenStickerBook,
  onChangeName,
  isMuted,
  isFullscreen,
  onToggleMute,
  onToggleFullscreen,
  highScore
}) => {
  const handleStart = () => {
    soundFX.unlockAudio();
    soundFX.playFlap();
    onStartGame();
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-4 sm:p-8 select-none bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100 overflow-y-auto">
      {/* Top Bar Controls & Player Profile */}
      <div className="w-full max-w-2xl flex items-center justify-between gap-2">
        {/* Player Name Tag with Change Button */}
        <div className="flex items-center gap-2">
          <div className="bg-amber-400 text-amber-950 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-2xl shadow-md flex items-center gap-2 border border-amber-300">
            <span>🐥</span>
            <span>Adik: <strong className="text-white drop-shadow-sm">{playerName}</strong></span>
          </div>
          <button
            onClick={onChangeName}
            className="bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-sm border border-slate-200 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            title="Tukar Nama Pemain"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tukar</span>
          </button>
        </div>

        {/* High Score & Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-white/85 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-sm border border-white flex items-center gap-1.5">
            <span className="text-base sm:text-lg">🏆</span>
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              Rekod: <strong className="text-amber-600 font-black">{highScore}</strong>
            </span>
          </div>

          <button
            onClick={onToggleMute}
            className="w-10 h-10 rounded-xl bg-white/80 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-white cursor-pointer"
            title={isMuted ? 'Buka Bunyi' : 'Senyap'}
            aria-label="Kawalan Bunyi"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
          </button>

          <button
            onClick={onToggleFullscreen}
            className="hidden sm:flex w-10 h-10 rounded-xl bg-white/80 hover:bg-white text-slate-700 shadow-md items-center justify-center transition-all hover:scale-105 active:scale-95 border border-white cursor-pointer"
            title={isFullscreen ? 'Keluar Skrin Penuh' : 'Skrin Penuh'}
            aria-label="Skrin Penuh"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Center Content */}
      <div className="flex flex-col items-center text-center max-w-lg my-auto py-4">
        {/* Animated Flying Mascot */}
        <div className="relative mb-3 group cursor-pointer" onClick={() => soundFX.playFlap()}>
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-amber-200/90 rounded-full flex items-center justify-center text-6xl sm:text-7xl shadow-xl border-4 border-white animate-bounce">
            🐥
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full p-2 shadow-md flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight drop-shadow-sm mb-1">
          Flappy Vokal Cilik
        </h1>
        <p className="text-sm sm:text-base font-bold text-slate-600 mb-6 max-w-sm">
          Terbang bersama Si Pipit dan padankan huruf vokal kecil dengan betul!
        </p>

        {/* Vowel Letter Selector Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-3 sm:p-4 shadow-xl border-2 border-amber-300 w-full mb-6">
          <div className="text-xs sm:text-sm font-extrabold text-slate-600 mb-3 flex items-center justify-center gap-1.5 uppercase tracking-wide">
            <span>Pilih Huruf Sasaran:</span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {VOWEL_LIST.map((item) => {
              const isSelected = selectedVowel === item.char;
              return (
                <button
                  key={item.char}
                  onClick={() => {
                    soundFX.playFlap();
                    onSelectVowel(item.char);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'scale-110 shadow-lg ring-4 ring-offset-2'
                      : 'hover:scale-105 opacity-80 hover:opacity-100 bg-slate-50'
                  }`}
                  style={{
                    backgroundColor: isSelected ? item.color : undefined,
                    color: isSelected ? '#FFFFFF' : '#1E293B',
                    // @ts-expect-error custom ring color
                    '--tw-ring-color': item.color
                  }}
                >
                  <span className="font-vocal font-extrabold text-3xl sm:text-4xl leading-none">
                    {item.char}
                  </span>
                  <span className="text-base sm:text-lg mt-1">{item.emoji}</span>
                  <span className={`text-[10px] font-extrabold capitalize ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                    {item.word}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Start Button */}
        <button
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-black text-2xl py-4 sm:py-5 px-8 rounded-3xl shadow-2xl border-4 border-white flex items-center justify-center gap-3 transition-transform cursor-pointer"
        >
          <Play className="w-8 h-8 fill-white" />
          <span>MULA TERBANG! 🚀</span>
        </button>

        {/* Sticker Book Button */}
        <button
          onClick={() => {
            soundFX.playFlap();
            onOpenStickerBook();
          }}
          className="mt-3 bg-white/90 hover:bg-white active:scale-95 text-amber-900 font-extrabold text-base py-3 px-6 rounded-2xl shadow-md border-2 border-amber-300 flex items-center justify-center gap-2 transition-transform cursor-pointer"
        >
          <BookOpen className="w-5 h-5 text-amber-600" />
          <span>Buku Pelekat Ganjaran</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs font-semibold text-slate-500">
        Prasekolah Malaysia (KSPK) • Fon Huruf Kecil Mesra Kanak-kanak
      </div>
    </div>
  );
};
