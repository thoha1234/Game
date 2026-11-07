import React, { useState } from 'react';
import { PRESET_NAMES } from '../types';
import { Sparkles, ArrowRight, User } from 'lucide-react';
import { soundFX } from '../audio/soundFX';

interface NameEntryModalProps {
  initialName: string;
  onConfirmName: (name: string) => void;
  onCancel?: () => void;
}

export const NameEntryModal: React.FC<NameEntryModalProps> = ({
  initialName,
  onConfirmName,
  onCancel
}) => {
  const [name, setName] = useState<string>(initialName || '');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    soundFX.unlockAudio();
    soundFX.playFlap();
    const finalName = name.trim() || 'Adik Bijak';
    onConfirmName(finalName);
  };

  const handleSelectPreset = (preset: string) => {
    soundFX.unlockAudio();
    soundFX.playStarPickup();
    setName(preset);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/55 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-amber-300 max-w-md w-full p-6 sm:p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        {/* Animated Friendly Mascot */}
        <div className="relative mb-3">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-5xl shadow-inner border-2 border-amber-300 animate-bounce">
            🐥
          </div>
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full p-1.5 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-1">
          Siapa Nama Adik?
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-5">
          Masukkan nama adik untuk memulakan pengembaraan huruf vokal!
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-500">
              <User className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Taip nama adik..."
              maxLength={15}
              autoFocus
              className="w-full pl-12 pr-4 py-3.5 bg-amber-50/70 border-3 border-amber-300 focus:border-amber-500 focus:bg-white rounded-2xl text-xl sm:text-2xl font-black text-slate-800 placeholder-slate-400 outline-none transition-all shadow-inner text-center"
            />
          </div>

          {/* Quick Preset Names for 1-Tap Preschooler Selection */}
          <div className="w-full">
            <div className="text-xs font-extrabold text-slate-500 mb-2 uppercase tracking-wider text-left">
              Pilihan Pantas Nama:
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {PRESET_NAMES.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-sm transition-all cursor-pointer ${
                    name.toLowerCase() === preset.toLowerCase()
                      ? 'bg-amber-400 text-amber-950 shadow-md scale-105 border-2 border-amber-500'
                      : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-black text-xl py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform cursor-pointer border-2 border-emerald-300 mt-2"
          >
            <span>JOM MULA!</span>
            <ArrowRight className="w-6 h-6" />
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 py-1"
            >
              Batal
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
