import React from 'react';
import { VowelChar, VOWEL_LIST } from '../types';
import { Play, Sparkles } from 'lucide-react';
import { soundFX } from '../audio/soundFX';

interface TutorialOverlayProps {
  targetVowel: VowelChar;
  onStartGame: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  targetVowel,
  onStartGame
}) => {
  const targetInfo = VOWEL_LIST.find(v => v.char === targetVowel) || VOWEL_LIST[0];

  const handleStart = () => {
    soundFX.unlockAudio();
    soundFX.playFlap();
    onStartGame();
  };

  return (
    <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-amber-300 max-w-md w-full p-6 sm:p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Cute Mascot Header */}
        <div className="relative mb-2">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-4xl shadow-inner border-2 border-amber-200 animate-bounce">
            🐥
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1">
          Jom Main Flappy Vokal!
        </h2>
        <p className="text-sm sm:text-base font-semibold text-slate-500 mb-5">
          Panduan mudah untuk adik-adik prasekolah
        </p>

        {/* Visual Steps */}
        <div className="w-full space-y-3 mb-6">
          {/* Step 1: Tap to Fly */}
          <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-3 flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-sky-200 flex items-center justify-center text-2xl shrink-0">
              👆
            </div>
            <div>
              <div className="font-extrabold text-sky-900 text-sm sm:text-base">
                1. Ketik Untuk Terbang
              </div>
              <div className="text-xs sm:text-sm text-sky-700">
                Ketik di mana-mana skrin atau papan kekunci (Space / Atas).
              </div>
            </div>
          </div>

          {/* Step 2: Match Target Vowel */}
          <div 
            className="border-2 rounded-2xl p-3 flex items-center gap-3 text-left"
            style={{ backgroundColor: targetInfo.lightColor, borderColor: targetInfo.color }}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-3xl shrink-0 font-vocal shadow"
              style={{ backgroundColor: targetInfo.color }}
            >
              {targetInfo.char}
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm sm:text-base">
                2. Cari Huruf: {targetInfo.char} ({targetInfo.word} {targetInfo.emoji})
              </div>
              <div className="text-xs sm:text-sm text-slate-700">
                Terbangkan burung comel ke bulatan huruf yang betul!
              </div>
            </div>
          </div>

          {/* Step 3: Collect Stars & Rewards */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-200 flex items-center justify-center text-2xl shrink-0">
              ⭐
            </div>
            <div>
              <div className="font-extrabold text-amber-900 text-sm sm:text-base">
                3. Kumpul 5 Bintang Ganjaran
              </div>
              <div className="text-xs sm:text-sm text-amber-700">
                Setiap padanan betul memberi ganjaran pelekat istimewa!
              </div>
            </div>
          </div>
        </div>

        {/* Start Flying Button */}
        <button
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-black text-xl py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform cursor-pointer border-2 border-emerald-300"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>MULA TERBANG! 🚀</span>
        </button>
      </div>
    </div>
  );
};
