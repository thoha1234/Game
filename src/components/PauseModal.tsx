import React from 'react';
import { Play, RotateCcw, Home, Sparkles } from 'lucide-react';
import { soundFX } from '../audio/soundFX';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onGoHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onGoHome
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-amber-300 max-w-sm w-full p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl mb-2">
          ⏸️
        </div>

        <h3 className="text-2xl font-black text-slate-800 mb-1 flex items-center gap-1.5">
          <span>Rehat Sebentar</span>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </h3>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-5">
          Tarik nafas, kemudian jom sambung terbang!
        </p>

        <div className="w-full space-y-2.5">
          <button
            onClick={() => {
              soundFX.playFlap();
              onResume();
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-black text-lg py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-emerald-400"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>TERUSKAN MAIN</span>
          </button>

          <button
            onClick={() => {
              soundFX.playFlap();
              onRestart();
            }}
            className="w-full bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-extrabold text-sm py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Mula Semula</span>
          </button>

          <button
            onClick={() => {
              soundFX.playFlap();
              onGoHome();
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold text-sm py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
