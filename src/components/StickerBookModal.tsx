import React from 'react';
import { VowelChar, VOWEL_LIST } from '../types';
import { X, Volume2, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundFX } from '../audio/soundFX';

interface StickerBookModalProps {
  playerName: string;
  unlockedVowels: VowelChar[];
  activeVowel: VowelChar;
  onSelectVowel: (char: VowelChar) => void;
  onClose: () => void;
}

export const StickerBookModal: React.FC<StickerBookModalProps> = ({
  playerName,
  unlockedVowels,
  activeVowel,
  onSelectVowel,
  onClose
}) => {
  const handlePlaySound = (char: VowelChar) => {
    soundFX.unlockAudio();
    soundFX.playCorrectMatch();
  };

  return (
    <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-amber-300 max-w-2xl w-full p-5 sm:p-7 flex flex-col my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl">
              📖
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-1.5">
                <span>Buku Pelekat Adik {playerName}</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Koleksi huruf vokal & perkataan comel milik {playerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vowel Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-5">
          {VOWEL_LIST.map((item) => {
            const isUnlocked = unlockedVowels.includes(item.char);
            const isSelected = activeVowel === item.char;

            return (
              <div
                key={item.char}
                className={`relative rounded-2xl p-4 border-2 transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'ring-4 ring-amber-400 ring-offset-2' 
                    : ''
                }`}
                style={{
                  backgroundColor: isUnlocked ? item.lightColor : '#F8FAFC',
                  borderColor: isUnlocked ? item.color : '#E2E8F0',
                  opacity: isUnlocked ? 1 : 0.8
                }}
              >
                {/* Left side: Letter Badge & Word */}
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl font-vocal shadow-md shrink-0"
                    style={{ backgroundColor: isUnlocked ? item.color : '#94A3B8' }}
                  >
                    {item.char}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="text-lg font-black text-slate-800 capitalize">
                        {item.word}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-500">
                      Sebutan: <span className="font-extrabold text-slate-700">{item.syllables}</span>
                    </div>
                    {isUnlocked && (
                      <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Telah Dibuka! ⭐⭐⭐⭐⭐</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Sound & Select Action */}
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => handlePlaySound(item.char)}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                    title="Dengar Bunyi"
                  >
                    <Volume2 className="w-4 h-4 text-slate-600" />
                  </button>

                  <button
                    onClick={() => {
                      soundFX.playFlap();
                      onSelectVowel(item.char);
                      onClose();
                    }}
                    className="w-9 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-amber-950 shadow-sm flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                    title="Pilih & Main"
                  >
                    <Play className="w-4 h-4 fill-amber-950" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            <span className="text-xs sm:text-sm font-bold text-amber-900">
              Kumpul semua pelekat dengan memadankan huruf semasa terbang!
            </span>
          </div>
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-sm py-2 px-4 rounded-xl shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            Terus Main
          </button>
        </div>
      </div>
    </div>
  );
};
