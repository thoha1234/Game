/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VowelChar, GameScreen } from './types';
import { soundFX } from './audio/soundFX';
import { FlappyGameCanvas } from './components/FlappyGameCanvas';
import { GameHUD } from './components/GameHUD';
import { StartScreen } from './components/StartScreen';
import { TutorialOverlay } from './components/TutorialOverlay';
import { RewardModal } from './components/RewardModal';
import { StickerBookModal } from './components/StickerBookModal';
import { PauseModal } from './components/PauseModal';
import { NameEntryModal } from './components/NameEntryModal';

export default function App() {
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem('flappy_vokal_player_name') || '';
    } catch {
      return '';
    }
  });

  // Start with NAME_ENTRY if name has not been set yet
  const [screen, setScreen] = useState<GameScreen>(() => {
    const savedName = localStorage.getItem('flappy_vokal_player_name');
    return savedName ? 'MENU' : 'NAME_ENTRY';
  });

  const [isChangingName, setIsChangingName] = useState<boolean>(false);
  const [targetVowel, setTargetVowel] = useState<VowelChar>('a');
  const [score, setScore] = useState<number>(0);
  const [starsCollected, setStarsCollected] = useState<number>(0);
  const [targetGoal] = useState<number>(5);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('flappy_vokal_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [unlockedVowels, setUnlockedVowels] = useState<VowelChar[]>(() => {
    try {
      const saved = localStorage.getItem('flappy_vokal_unlocked');
      return saved ? JSON.parse(saved) : ['a'];
    } catch {
      return ['a'];
    }
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync highscore
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('flappy_vokal_highscore', score.toString());
      } catch {
        // ignore
      }
    }
  }, [score, highScore]);

  // Sync unlocked vowels
  useEffect(() => {
    try {
      localStorage.setItem('flappy_vokal_unlocked', JSON.stringify(unlockedVowels));
    } catch {
      // ignore
    }
  }, [unlockedVowels]);

  // Handle Fullscreen state change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    soundFX.unlockAudio();
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const toggleMute = () => {
    soundFX.unlockAudio();
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
  };

  // Name confirmation handler
  const handleConfirmName = (name: string) => {
    setPlayerName(name);
    try {
      localStorage.setItem('flappy_vokal_player_name', name);
    } catch {
      // ignore
    }
    setIsChangingName(false);
    setScreen('MENU');
    soundFX.startBGM();
  };

  // Start game flow
  const handleStartGame = () => {
    soundFX.unlockAudio();
    const hasSeen = localStorage.getItem('flappy_vokal_tutorial_seen');
    if (!hasSeen) {
      setShowTutorial(true);
    } else {
      setStarsCollected(0);
      setScore(0);
      setIsPaused(false);
      setScreen('PLAYING');
      soundFX.startBGM();
    }
  };

  const handleTutorialComplete = () => {
    try {
      localStorage.setItem('flappy_vokal_tutorial_seen', 'true');
    } catch {
      // ignore
    }
    setShowTutorial(false);
    setStarsCollected(0);
    setScore(0);
    setIsPaused(false);
    setScreen('PLAYING');
    soundFX.startBGM();
  };

  // When child matches the target vowel correctly (+10 points)
  const handleCorrectMatch = useCallback((char: VowelChar) => {
    setScore((prev) => prev + 10);
    setStarsCollected((prev) => {
      const nextStars = prev + 1;
      if (nextStars >= targetGoal) {
        setUnlockedVowels((old) => {
          if (!old.includes(char)) {
            return [...old, char];
          }
          return old;
        });

        setTimeout(() => {
          setScreen('REWARD');
        }, 500);
      }
      return nextStars;
    });
  }, [targetGoal]);

  // When child hits the WRONG vowel: POTONG MARKAH (-2, minimum 0)
  const handleWrongMatch = useCallback((_char: VowelChar) => {
    setScore((prev) => Math.max(0, prev - 2));
  }, []);

  // Advance to next vowel
  const handleNextVowel = () => {
    const order: VowelChar[] = ['a', 'e', 'i', 'o', 'u'];
    const curIdx = order.indexOf(targetVowel);
    const nextChar = order[(curIdx + 1) % order.length];
    setTargetVowel(nextChar);
    setStarsCollected(0);
    setScreen('PLAYING');
    soundFX.startBGM();
  };

  // Replay current vowel
  const handleReplayCurrent = () => {
    setStarsCollected(0);
    setScreen('PLAYING');
    soundFX.startBGM();
  };

  // Pause toggle
  const handleTogglePause = () => {
    soundFX.unlockAudio();
    setIsPaused((prev) => !prev);
  };

  // Flap trigger from HUD button
  const handleHUDFlap = () => {
    soundFX.unlockAudio();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden select-none bg-sky-300 font-sans"
      style={{ touchAction: 'manipulation' }}
    >
      {/* 60fps Canvas Game View with Parallax Background */}
      <FlappyGameCanvas
        targetVowel={targetVowel}
        isPlaying={screen === 'PLAYING' && !isPaused}
        onCorrectMatch={handleCorrectMatch}
        onWrongMatch={handleWrongMatch}
      />

      {/* Main HUD during active play */}
      {screen === 'PLAYING' && (
        <GameHUD
          playerName={playerName || 'Adik'}
          targetVowel={targetVowel}
          score={score}
          starsCollected={starsCollected}
          targetGoal={targetGoal}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          isPaused={isPaused}
          onToggleMute={toggleMute}
          onToggleFullscreen={toggleFullscreen}
          onOpenTutorial={() => setShowTutorial(true)}
          onOpenStickerBook={() => setScreen('STICKER_BOOK')}
          onTogglePause={handleTogglePause}
          onFlapClick={handleHUDFlap}
        />
      )}

      {/* Name Entry Screen (Shown on first load or when changing name) */}
      {(screen === 'NAME_ENTRY' || isChangingName) && (
        <NameEntryModal
          initialName={playerName}
          onConfirmName={handleConfirmName}
          onCancel={isChangingName ? () => setIsChangingName(false) : undefined}
        />
      )}

      {/* Start Screen Menu */}
      {screen === 'MENU' && !isChangingName && (
        <StartScreen
          playerName={playerName || 'Adik'}
          selectedVowel={targetVowel}
          onSelectVowel={(char) => setTargetVowel(char)}
          onStartGame={handleStartGame}
          onOpenStickerBook={() => setScreen('STICKER_BOOK')}
          onChangeName={() => setIsChangingName(true)}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          onToggleMute={toggleMute}
          onToggleFullscreen={toggleFullscreen}
          highScore={highScore}
        />
      )}

      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay
          targetVowel={targetVowel}
          onStartGame={handleTutorialComplete}
        />
      )}

      {/* Celebratory Reward Modal */}
      {screen === 'REWARD' && (
        <RewardModal
          playerName={playerName || 'Adik'}
          completedVowel={targetVowel}
          score={score}
          starsEarned={starsCollected}
          onNextVowel={handleNextVowel}
          onReplayCurrent={handleReplayCurrent}
          onOpenStickerBook={() => setScreen('STICKER_BOOK')}
        />
      )}

      {/* Interactive Sticker Book Modal */}
      {screen === 'STICKER_BOOK' && (
        <StickerBookModal
          playerName={playerName || 'Adik'}
          unlockedVowels={unlockedVowels}
          activeVowel={targetVowel}
          onSelectVowel={(char) => {
            setTargetVowel(char);
            setStarsCollected(0);
            setScreen('PLAYING');
            soundFX.startBGM();
          }}
          onClose={() => {
            if (screen === 'STICKER_BOOK') {
              setScreen('MENU');
            }
          }}
        />
      )}

      {/* Pause Modal */}
      {isPaused && screen === 'PLAYING' && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestart={() => {
            setStarsCollected(0);
            setScore(0);
            setIsPaused(false);
          }}
          onGoHome={() => {
            setIsPaused(false);
            setScreen('MENU');
            soundFX.stopBGM();
          }}
        />
      )}
    </div>
  );
}
