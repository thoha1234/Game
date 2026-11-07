import React, { useEffect } from 'react';
import { VowelChar, VOWEL_LIST } from '../types';
import { soundFX } from '../audio/soundFX';
import { Award, ArrowRight, RotateCcw, BookOpen, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RewardModalProps {
  playerName: string;
  completedVowel: VowelChar;
  score: number;
  starsEarned: number;
  onNextVowel: () => void;
  onReplayCurrent: () => void;
  onOpenStickerBook: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  playerName,
  completedVowel,
  score,
  starsEarned,
  onNextVowel,
  onReplayCurrent,
  onOpenStickerBook
}) => {
  const vowelInfo = VOWEL_LIST.find(v => v.char === completedVowel) || VOWEL_LIST[0];

  useEffect(() => {
    soundFX.playVictoryFanfare();

    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#EF4444', '#10B981', '#3B82F6'] });
    fire(0.2, { spread: 60, colors: ['#F59E0B', '#8B5CF6', '#FBBF24'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ['#FFFFFF', '#FCD34D'] });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return (
    <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-gradient-to-b from-white to-amber-50 rounded-3xl shadow-2xl border-4 border-amber-300 max-w-md w-full p-6 sm:p-8 flex flex-col items-center text-center animate-in zoom-in-90 duration-300">
        {/* Crown Badge */}
        <div className="relative mb-2">
          <div 
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg border-4 border-white transition-transform transform hover:scale-110"
            style={{ backgroundColor: vowelInfo.color }}
          >
            <span className="text-white font-extrabold text-5xl font-vocal">
              {vowelInfo.char}
            </span>
          </div>
          <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-950 p-2 rounded-full shadow-md animate-bounce">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Positive Praise Banner */}
        <div className="flex items-center gap-1.5 text-amber-600 font-black text-sm tracking-widest uppercase mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Tahniah Adik {playerName}!</span>
          <Sparkles className="w-4 h-4" />
        </div>

        <h2 className="text-3xl font-black text-slate-800 mb-2">
          Hebat Sekali! 🎉
        </h2>

        <p className="text-sm sm:text-base font-semibold text-slate-600 mb-4">
          Adik <strong className="text-amber-600">{playerName}</strong> berjaya menguasai huruf vokal <strong className="text-rose-600 font-vocal text-lg font-bold">"{vowelInfo.char}"</strong> untuk <span className="font-extrabold text-slate-800">{vowelInfo.word} {vowelInfo.emoji}</span>!
        </p>

        {/* Sticker Unlocked Card */}
        <div 
          className="w-full rounded-2xl border-2 p-4 mb-5 flex items-center justify-between shadow-inner"
          style={{ backgroundColor: vowelInfo.lightColor, borderColor: vowelInfo.color }}
        >
          <div className="flex items-center gap-3">
            <div className="text-4xl bg-white/80 p-2 rounded-2xl shadow-sm">
              {vowelInfo.emoji}
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-500 block">Pelekat Dibuka!</span>
              <span className="text-lg font-black text-slate-800">
                {vowelInfo.word} ({vowelInfo.syllables})
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end text-xl">
              {'⭐'.repeat(starsEarned)}
            </div>
            <span className="text-xs font-bold text-amber-700">+{score} Markah</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={() => {
              soundFX.playFlap();
              onNextVowel();
            }}
            className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-black text-lg py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform cursor-pointer border-2 border-emerald-300"
          >
            <span>TERBANG SETERUSNYA</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              onClick={() => {
                soundFX.playFlap();
                onReplayCurrent();
              }}
              className="bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-bold text-sm py-3 px-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Main Semula</span>
            </button>

            <button
              onClick={() => {
                soundFX.playFlap();
                onOpenStickerBook();
              }}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-bold text-sm py-3 px-3 rounded-xl border border-amber-500 shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-900" />
              <span>Buku Pelekat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
