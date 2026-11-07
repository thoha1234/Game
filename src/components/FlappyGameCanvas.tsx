import React, { useEffect, useRef, useCallback } from 'react';
import { 
  VowelChar, 
  VOWEL_LIST, 
  FloatingBubble, 
  Particle, 
  FloatingTextReward, 
  Cloud, 
  BirdState, 
  PRAISE_PHRASES 
} from '../types';
import { soundFX } from '../audio/soundFX';
import confetti from 'canvas-confetti';

interface FlappyGameCanvasProps {
  targetVowel: VowelChar;
  isPlaying: boolean;
  onCorrectMatch: (char: VowelChar) => void;
  onWrongMatch: (char: VowelChar) => void;
  onStreakUpdate?: (streak: number) => void;
  onTapToFlap?: () => void;
}

export const FlappyGameCanvas: React.FC<FlappyGameCanvasProps> = ({
  targetVowel,
  isPlaying,
  onCorrectMatch,
  onWrongMatch,
  onStreakUpdate,
  onTapToFlap
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // References to keep mutable game loop variables without re-triggering React renders
  const stateRef = useRef({
    bird: {
      x: 140,
      y: 260,
      radius: 28,
      vy: 0,
      rotation: 0,
      flapFrame: 0,
      isFlapping: false,
      blinkTimer: 0,
      isBlinking: false,
      invincibleTimer: 0,
      isDizzy: false,
      dizzyTimer: 0
    } as BirdState,
    bubbles: [] as FloatingBubble[],
    particles: [] as Particle[],
    rewards: [] as FloatingTextReward[],
    clouds: [] as Cloud[],
    nextBubbleTimer: 0,
    bubbleIdCounter: 1,
    groundOffset: 0,
    sunRayAngle: 0,
    windmillAngle: 0,
    balloonX: 200,
    balloonY: 100,
    balloonSpeed: 0.35,
    screenShake: 0,
    mistakeFlashAlpha: 0,
    streak: 0,
    lastTime: performance.now(),
    width: window.innerWidth,
    height: window.innerHeight,
    activeTarget: targetVowel
  });

  // Keep target vowel in sync
  useEffect(() => {
    stateRef.current.activeTarget = targetVowel;
  }, [targetVowel]);

  // Spawn initial background clouds
  useEffect(() => {
    const clouds: Cloud[] = [];
    const count = 7;
    for (let i = 0; i < count; i++) {
      clouds.push({
        x: Math.random() * window.innerWidth,
        y: 40 + Math.random() * (window.innerHeight * 0.35),
        speed: 0.3 + Math.random() * 0.45,
        scale: 0.8 + Math.random() * 0.6,
        opacity: 0.6 + Math.random() * 0.35
      });
    }
    stateRef.current.clouds = clouds;
  }, []);

  // Flap trigger function
  const triggerFlap = useCallback(() => {
    soundFX.unlockAudio();
    const { bird } = stateRef.current;
    
    // Can still flap gently even if slightly dizzy
    bird.vy = -7.8;
    bird.rotation = -0.32;
    bird.isFlapping = true;
    bird.flapFrame = 12;

    soundFX.playFlap();
    if (onTapToFlap) onTapToFlap();

    // Spawn cute feather / sparkle puff on flap
    for (let i = 0; i < 4; i++) {
      stateRef.current.particles.push({
        x: bird.x - 18,
        y: bird.y + 10 + (Math.random() * 10 - 5),
        vx: -1.5 - Math.random() * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 5 + Math.random() * 4,
        color: ['#FEF08A', '#FDE047', '#BAE6FD', '#FBCFE8'][Math.floor(Math.random() * 4)],
        alpha: 0.9,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.1,
        shape: Math.random() > 0.5 ? 'star' : 'circle',
        life: 0,
        maxLife: 25 + Math.random() * 15
      });
    }
  }, [onTapToFlap]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      stateRef.current.width = w;
      stateRef.current.height = h;

      canvasRef.current.width = w * dpr;
      canvasRef.current.height = h * dpr;
      canvasRef.current.style.width = `${w}px`;
      canvasRef.current.style.height = `${h}px`;

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard and touch controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Enter') {
        e.preventDefault();
        triggerFlap();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Don't trigger if clicked on an interactive UI button
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, [data-interactive="true"]')) {
        return;
      }
      triggerFlap();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [triggerFlap]);

  // Main 60fps Game Loop
  useEffect(() => {
    let animationId: number;

    const spawnBubble = (w: number, h: number, curTarget: VowelChar) => {
      const state = stateRef.current;
      const id = state.bubbleIdCounter++;
      
      const hasTargetOnScreen = state.bubbles.some(b => b.isTarget && !b.collected && b.x > 0);
      const isTarget = !hasTargetOnScreen || Math.random() < 0.58;

      let char: VowelChar;
      if (isTarget) {
        char = curTarget;
      } else {
        const distractors = VOWEL_LIST.filter(v => v.char !== curTarget);
        char = distractors[Math.floor(Math.random() * distractors.length)].char;
      }

      const minY = 120;
      const maxY = h - 180;
      const spawnY = minY + Math.random() * (maxY - minY);

      state.bubbles.push({
        id,
        x: w + 60,
        y: spawnY,
        radius: 38,
        char,
        isTarget,
        collected: false,
        wobbleOffset: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.02,
        ringHue: Math.floor(Math.random() * 360)
      });
    };

    const loop = (currentTime: number) => {
      const state = stateRef.current;
      const dt = Math.min((currentTime - state.lastTime) / 1000, 0.1);
      state.lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationId = requestAnimationFrame(loop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationId = requestAnimationFrame(loop);
        return;
      }

      const w = state.width;
      const h = state.height;
      const bird = state.bird;
      const groundY = h - 90;

      // ==========================================
      // 1. UPDATE PHYSICS & TIMERS
      // ==========================================
      // Screen shake decay
      if (state.screenShake > 0) {
        state.screenShake = Math.max(0, state.screenShake - 35 * dt);
      }
      // Mistake red flash decay
      if (state.mistakeFlashAlpha > 0) {
        state.mistakeFlashAlpha = Math.max(0, state.mistakeFlashAlpha - 1.2 * dt);
      }

      // Windmill & Balloon & Sun animations
      state.windmillAngle += 0.02;
      state.sunRayAngle += 0.005;
      state.balloonX -= state.balloonSpeed;
      if (state.balloonX < -150) {
        state.balloonX = w + 120;
        state.balloonY = 60 + Math.random() * 80;
      }

      if (isPlaying) {
        // Gentle gravity
        bird.vy += 16.5 * dt;
        if (bird.vy > 9) bird.vy = 9;

        bird.y += bird.vy;

        // Angle tilt smoothing
        if (bird.vy < 0) {
          bird.rotation = Math.max(-0.4, bird.rotation - 3.5 * dt);
        } else {
          bird.rotation = Math.min(0.35, bird.rotation + 2.0 * dt);
        }

        // Flap animation decay
        if (bird.flapFrame > 0) {
          bird.flapFrame--;
        } else {
          bird.isFlapping = false;
        }

        // Dizzy reaction timer
        if (bird.isDizzy) {
          bird.dizzyTimer -= dt;
          if (bird.dizzyTimer <= 0) {
            bird.isDizzy = false;
          }
        }

        // Blinking logic
        bird.blinkTimer += dt;
        if (bird.blinkTimer > 3.0) {
          bird.isBlinking = true;
          if (bird.blinkTimer > 3.18) {
            bird.isBlinking = false;
            bird.blinkTimer = 0;
          }
        }

        // Ground collision (trampoline bounce)
        if (bird.y + bird.radius >= groundY) {
          bird.y = groundY - bird.radius;
          bird.vy = -7.5;
          soundFX.playSoftBounce();

          for (let i = 0; i < 5; i++) {
            state.particles.push({
              x: bird.x + (Math.random() * 20 - 10),
              y: groundY - 5,
              vx: (Math.random() - 0.5) * 3,
              vy: -2 - Math.random() * 2,
              size: 4 + Math.random() * 3,
              color: '#86EFAC',
              alpha: 0.8,
              rotation: 0,
              spin: 0,
              shape: 'circle',
              life: 0,
              maxLife: 20
            });
          }
        }

        // Ceiling collision
        if (bird.y - bird.radius <= 30) {
          bird.y = 30 + bird.radius;
          bird.vy = 2.0;
        }

        // Move Ground parallax
        state.groundOffset = (state.groundOffset + 1.8) % 40;

        // Spawn bubbles
        state.nextBubbleTimer -= dt;
        if (state.nextBubbleTimer <= 0) {
          spawnBubble(w, h, state.activeTarget);
          state.nextBubbleTimer = 1.8 + Math.random() * 0.8;
        }

        // Update Bubbles & Collisions
        const bubbleSpeed = 2.4;
        for (let i = state.bubbles.length - 1; i >= 0; i--) {
          const b = state.bubbles[i];
          b.x -= bubbleSpeed;
          b.wobbleOffset += b.wobbleSpeed;

          const distSq = (bird.x - b.x) * (bird.x - b.x) + (bird.y - (b.y + Math.sin(b.wobbleOffset) * 8)) ** 2;
          const hitDist = bird.radius + b.radius;

          if (!b.collected && distSq <= hitDist * hitDist) {
            b.collected = true;

            if (b.char === state.activeTarget) {
              // ==========================================
              // CORRECT MATCH! CELEBRATE!
              // ==========================================
              state.streak++;
              if (onStreakUpdate) onStreakUpdate(state.streak);
              onCorrectMatch(b.char);

              soundFX.playCorrectMatch();

              const info = VOWEL_LIST.find(v => v.char === b.char);
              const mainCol = info ? info.color : '#FBBF24';

              for (let p = 0; p < 24; p++) {
                const angle = (p / 24) * Math.PI * 2;
                const speed = 2.5 + Math.random() * 4.5;
                state.particles.push({
                  x: b.x,
                  y: b.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  size: 6 + Math.random() * 6,
                  color: [mainCol, '#FDE047', '#FFFFFF', '#6EE7B7', '#F472B6'][Math.floor(Math.random() * 5)],
                  alpha: 1.0,
                  rotation: Math.random() * Math.PI,
                  spin: (Math.random() - 0.5) * 0.2,
                  shape: Math.random() > 0.4 ? 'star' : 'circle',
                  life: 0,
                  maxLife: 35 + Math.random() * 20
                });
              }

              const randomPraise = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
              state.rewards.push({
                id: Math.random(),
                x: b.x - 20,
                y: b.y - 30,
                text: `${randomPraise}`,
                color: mainCol,
                alpha: 1.0,
                scale: 1.3,
                vy: -1.6
              });

              confetti({
                particleCount: 22,
                spread: 60,
                origin: { x: Math.max(0.1, Math.min(0.9, b.x / w)), y: Math.max(0.1, Math.min(0.9, b.y / h)) },
                colors: ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#FBBF24'],
                disableForReducedMotion: true
              });
            } else {
              // ==========================================
              // WRONG MATCH! POTONG MARKAH, ANIMASI, & BUNYI
              // ==========================================
              onWrongMatch(b.char);
              soundFX.playWrongMatch();

              state.streak = 0;
              if (onStreakUpdate) onStreakUpdate(0);

              // 1. Screen Shake & Red Flash
              state.screenShake = 14;
              state.mistakeFlashAlpha = 0.35;

              // 2. Bird Dizzy State & Recoil
              bird.isDizzy = true;
              bird.dizzyTimer = 0.85;
              bird.vy = 2.5; // slight drop
              bird.rotation = 0.25;

              // 3. Smoke Puff & Question Mark Particles
              for (let p = 0; p < 14; p++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 1.5 + Math.random() * 3.0;
                state.particles.push({
                  x: b.x,
                  y: b.y,
                  vx: Math.cos(angle) * spd,
                  vy: Math.sin(angle) * spd,
                  size: 5 + Math.random() * 6,
                  color: ['#FCA5A5', '#EF4444', '#94A3B8', '#CBD5E1'][Math.floor(Math.random() * 4)],
                  alpha: 1.0,
                  rotation: Math.random() * Math.PI,
                  spin: (Math.random() - 0.5) * 0.2,
                  shape: p % 3 === 0 ? 'question' : 'circle',
                  life: 0,
                  maxLife: 30 + Math.random() * 15
                });
              }

              // 4. Floating Negative Mark & Prompt
              state.rewards.push({
                id: Math.random(),
                x: b.x - 30,
                y: b.y - 25,
                text: '-2 Markah! ❌',
                color: '#EF4444',
                alpha: 1.0,
                scale: 1.25,
                vy: -1.4,
                isNegative: true
              });

              state.rewards.push({
                id: Math.random(),
                x: b.x - 35,
                y: b.y + 10,
                text: `Cari [ ${state.activeTarget} ]! 🐣`,
                color: '#475569',
                alpha: 0.95,
                scale: 0.95,
                vy: -1.0
              });
            }
          }

          if (b.x < -100 || (b.collected && distSq > hitDist * hitDist)) {
            state.bubbles.splice(i, 1);
          }
        }
      }

      // Update Clouds
      state.clouds.forEach(c => {
        c.x -= c.speed;
        if (c.x < -200) {
          c.x = w + 100;
          c.y = 40 + Math.random() * (h * 0.35);
        }
      });

      // Update Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.rotation += p.spin;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife) {
          state.particles.splice(i, 1);
        }
      }

      // Update Floating Rewards
      for (let i = state.rewards.length - 1; i >= 0; i--) {
        const r = state.rewards[i];
        r.y += r.vy;
        r.alpha -= 0.018;
        if (r.alpha <= 0) {
          state.rewards.splice(i, 1);
        }
      }

      // ==========================================
      // 2. RENDER GRAPHICS & ENHANCED LATAR
      // ==========================================
      ctx.save();

      // Apply screen shake offset if mistake occurred
      if (state.screenShake > 0) {
        const sx = (Math.random() - 0.5) * state.screenShake;
        const sy = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(sx, sy);
      }

      ctx.clearRect(0, 0, w, h);

      // A. Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#7DD3FC');
      skyGrad.addColorStop(0.5, '#BAE6FD');
      skyGrad.addColorStop(0.85, '#FEF08A');
      skyGrad.addColorStop(1, '#FDE68A');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // B. Rainbow Arch in Distance
      ctx.save();
      const rainbowColors = ['rgba(244, 63, 94, 0.22)', 'rgba(251, 146, 60, 0.22)', 'rgba(250, 204, 21, 0.22)', 'rgba(74, 222, 128, 0.22)', 'rgba(96, 165, 250, 0.22)', 'rgba(168, 85, 247, 0.22)'];
      const rCenterX = w * 0.35;
      const rCenterY = groundY + 100;
      const baseRadius = 240;
      rainbowColors.forEach((color, idx) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(rCenterX, rCenterY, baseRadius + idx * 9, Math.PI, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();

      // C. Cheerful Smiling Sun
      const sunX = w - 90;
      const sunY = 90;
      const sunRadius = 45;

      ctx.save();
      ctx.translate(sunX, sunY);
      ctx.rotate(state.sunRayAngle);
      for (let ray = 0; ray < 8; ray++) {
        ctx.save();
        ctx.rotate((ray * Math.PI) / 4);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.beginPath();
        ctx.roundRect(-8, -sunRadius - 22, 16, 18, 8);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // Sun Core
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Sun Face
      ctx.fillStyle = '#854D0E';
      ctx.beginPath();
      ctx.arc(sunX - 12, sunY - 6, 4, 0, Math.PI * 2);
      ctx.arc(sunX + 12, sunY - 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(251, 113, 133, 0.6)';
      ctx.beginPath();
      ctx.arc(sunX - 18, sunY + 5, 6, 0, Math.PI * 2);
      ctx.arc(sunX + 18, sunY + 5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#854D0E';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(sunX, sunY + 2, 12, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      // D. Drifting Hot Air Balloon in Upper Sky
      ctx.save();
      ctx.translate(state.balloonX, state.balloonY + Math.sin(currentTime * 0.002) * 8);
      // Balloon envelope
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      // Stripe
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      // Basket
      ctx.fillStyle = '#B45309';
      ctx.fillRect(-6, 32, 12, 9);
      // Ropes
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-10, 22);
      ctx.lineTo(-4, 32);
      ctx.moveTo(10, 22);
      ctx.lineTo(4, 32);
      ctx.stroke();
      ctx.restore();

      // E. Fluffy Drifting Clouds
      state.clouds.forEach(cloud => {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
        ctx.translate(cloud.x, cloud.y);
        ctx.scale(cloud.scale, cloud.scale);

        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.arc(28, -12, 26, 0, Math.PI * 2);
        ctx.arc(56, 2, 24, 0, Math.PI * 2);
        ctx.arc(26, 12, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // F. Distant Rolling Hills
      ctx.fillStyle = '#86EFAC';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (let x = 0; x <= w; x += 50) {
        const hillY = groundY - 45 + Math.sin(x * 0.005 + 1) * 30 + Math.cos(x * 0.01) * 15;
        ctx.lineTo(x, hillY);
      }
      ctx.lineTo(w, groundY);
      ctx.closePath();
      ctx.fill();

      // Animated Windmill on Hill
      const millX = Math.min(w - 180, Math.max(120, w * 0.72));
      const millBaseY = groundY - 32;
      ctx.save();
      // Tower
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(millX - 14, millBaseY);
      ctx.lineTo(millX - 8, millBaseY - 45);
      ctx.lineTo(millX + 8, millBaseY - 45);
      ctx.lineTo(millX + 14, millBaseY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Roof
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(millX - 11, millBaseY - 45);
      ctx.lineTo(millX, millBaseY - 58);
      ctx.lineTo(millX + 11, millBaseY - 45);
      ctx.closePath();
      ctx.fill();
      // Rotor hub & turning sails
      ctx.save();
      ctx.translate(millX, millBaseY - 44);
      ctx.rotate(state.windmillAngle);
      for (let blade = 0; blade < 4; blade++) {
        ctx.save();
        ctx.rotate((blade * Math.PI) / 2);
        ctx.fillStyle = '#CBD5E1';
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-2.5, 0, 5, 26);
        ctx.strokeRect(-2.5, 0, 5, 26);
        ctx.restore();
      }
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();

      // Middle Rolling Hills
      ctx.fillStyle = '#4ADE80';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (let x = 0; x <= w; x += 40) {
        const hillY = groundY - 25 + Math.sin(x * 0.008 + 2.5) * 20;
        ctx.lineTo(x, hillY);
      }
      ctx.lineTo(w, groundY);
      ctx.closePath();
      ctx.fill();

      // G. Lowercase Vowel Bubbles
      state.bubbles.forEach(b => {
        if (b.collected) return;
        const info = VOWEL_LIST.find(v => v.char === b.char);
        const col = info ? info.color : '#3B82F6';
        const lightCol = info ? info.lightColor : '#DBEAFE';
        const currY = b.y + Math.sin(b.wobbleOffset) * 8;

        ctx.save();
        ctx.translate(b.x, currY);

        if (b.isTarget) {
          const pulse = (Math.sin(currentTime * 0.008) + 1) * 0.5;
          ctx.strokeStyle = col;
          ctx.lineWidth = 3 + pulse * 4;
          ctx.beginPath();
          ctx.arc(0, 0, b.radius + 6 + pulse * 6, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#FBBF24';
          ctx.font = 'bold 18px "Fredoka", "Quicksand", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⭐', 0, -b.radius - 14);
        }

        // Bubble Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 6;

        // Bubble background
        const bubbleGrad = ctx.createRadialGradient(-10, -10, 5, 0, 0, b.radius);
        bubbleGrad.addColorStop(0, '#FFFFFF');
        bubbleGrad.addColorStop(0.5, lightCol);
        bubbleGrad.addColorStop(1, '#FFFFFF');
        ctx.fillStyle = bubbleGrad;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';

        // Outer Ring
        ctx.strokeStyle = col;
        ctx.lineWidth = b.isTarget ? 5 : 3.5;
        ctx.stroke();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.ellipse(-14, -14, 10, 6, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // LOWERCASE VOWEL LETTER
        ctx.fillStyle = col;
        ctx.font = '700 46px "Fredoka", "Quicksand", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.char, 0, 3);

        ctx.restore();
      });

      // H. The Bird Protagonist ("Si Pipit")
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(bird.rotation);

      // Bird Body
      const birdGrad = ctx.createRadialGradient(-6, -6, 4, 0, 0, bird.radius);
      birdGrad.addColorStop(0, '#FEF08A');
      birdGrad.addColorStop(0.7, '#FACC15');
      birdGrad.addColorStop(1, '#EAB308');

      ctx.fillStyle = birdGrad;
      ctx.beginPath();
      ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#CA8A04';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Wing
      ctx.save();
      ctx.translate(-8, 3);
      const wingAngle = bird.isFlapping 
        ? -0.6 + (bird.flapFrame / 12) * 1.2 
        : Math.sin(currentTime * 0.007) * 0.2;
      ctx.rotate(wingAngle);

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.ellipse(-4, 0, 16, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // Rosy Cheeks
      ctx.fillStyle = 'rgba(244, 114, 182, 0.7)';
      ctx.beginPath();
      ctx.arc(8, 9, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Eyes: Normal or Dizzy Eyes
      const eyeX = 12;
      const eyeY = -6;

      if (bird.isDizzy) {
        // Dizzy Spiral / Cross Eyes
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 2.5;
        // Left eye spiral '@'
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 6, 0, Math.PI * 2);
        ctx.moveTo(eyeX - 3, eyeY);
        ctx.lineTo(eyeX + 3, eyeY);
        ctx.stroke();

        // Dizzy blue sweat drop
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(-bird.radius + 2, -12, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (bird.isBlinking) {
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 6, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(eyeX + 2, eyeY, 5.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(eyeX + 1, eyeY - 2.5, 2.5, 0, Math.PI * 2);
        ctx.arc(eyeX + 4, eyeY + 1.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Orange Beak
      ctx.fillStyle = '#FB923C';
      ctx.beginPath();
      ctx.moveTo(bird.radius - 4, -4);
      ctx.lineTo(bird.radius + 14, 2);
      ctx.lineTo(bird.radius - 4, 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#EA580C';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Forehead Feather
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(-4, -bird.radius + 2);
      ctx.quadraticCurveTo(0, -bird.radius - 12, 8, -bird.radius - 8);
      ctx.quadraticCurveTo(2, -bird.radius - 2, 2, -bird.radius + 2);
      ctx.fill();

      // Dizzy Orbiting Stars above bird head if in mistake state
      if (bird.isDizzy) {
        ctx.save();
        const spinTime = currentTime * 0.01;
        const starX1 = Math.cos(spinTime) * 16;
        const starY1 = -bird.radius - 14 + Math.sin(spinTime) * 5;
        const starX2 = Math.cos(spinTime + Math.PI) * 16;
        const starY2 = -bird.radius - 14 + Math.sin(spinTime + Math.PI) * 5;

        ctx.font = '14px sans-serif';
        ctx.fillText('💫', starX1, starY1);
        ctx.fillText('⭐', starX2, starY2);
        ctx.restore();
      }

      ctx.restore();

      // I. Foreground Grass & Swaying Flowers
      ctx.fillStyle = '#22C55E';
      ctx.fillRect(0, groundY, w, h - groundY);

      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (let x = -state.groundOffset; x <= w + 40; x += 20) {
        ctx.lineTo(x + 10, groundY - 8);
        ctx.lineTo(x + 20, groundY);
      }
      ctx.lineTo(w, groundY);
      ctx.closePath();
      ctx.fill();

      // Animated daisies & sunflowers along the meadow
      for (let x = 20; x < w; x += 75) {
        const flowerX = (x - state.groundOffset * 0.8 + w) % w;
        const flowerY = groundY + 18;
        const sway = Math.sin(currentTime * 0.003 + x) * 2;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(flowerX - 4 + sway, flowerY, 4, 0, Math.PI * 2);
        ctx.arc(flowerX + 4 + sway, flowerY, 4, 0, Math.PI * 2);
        ctx.arc(flowerX + sway, flowerY - 4, 4, 0, Math.PI * 2);
        ctx.arc(flowerX + sway, flowerY + 4, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(flowerX + sway, flowerY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // J. Particles (Stars, Confetti, and Mistake Question Marks)
      state.particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.shape === 'star') {
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            ctx.lineTo(Math.cos(((18 + s * 72) * Math.PI) / 180) * p.size, -Math.sin(((18 + s * 72) * Math.PI) / 180) * p.size);
            ctx.lineTo(Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.size * 0.45), -Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.size * 0.45));
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'question') {
          ctx.font = 'bold 16px "Fredoka", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('❓', 0, 0);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // K. Floating Rewards & Deductions Text
      state.rewards.forEach(r => {
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.scale(r.scale, r.scale);
        ctx.globalAlpha = r.alpha;

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 6;
        ctx.font = '700 24px "Fredoka", "Quicksand", sans-serif';
        ctx.strokeText(r.text, 0, 0);

        ctx.fillStyle = r.color;
        ctx.fillText(r.text, 0, 0);
        ctx.restore();
      });

      // L. Mistake Red Vignette Flash
      if (state.mistakeFlashAlpha > 0) {
        ctx.fillStyle = `rgba(239, 68, 68, ${state.mistakeFlashAlpha})`;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore(); // Restore shake transform

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, onCorrectMatch, onWrongMatch, onStreakUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-pointer touch-none block"
      style={{ touchAction: 'none' }}
    />
  );
};
