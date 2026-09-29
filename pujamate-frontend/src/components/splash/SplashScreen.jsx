'use client';

/**
 * src/components/splash/SplashScreen.jsx
 */

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '@/context/AudioContext';

const SESSION_KEY = 'pujamate_splash_seen';

// Diya (lamp) angular positions around the orbit ring. 8 lamps, evenly spaced.
const DIYA_ANGLES = Array.from({ length: 8 }, (_, i) => i * 45);

export default function SplashScreen() {
  const [visible, setVisible] = useState(null);
  const [closing, setClosing] = useState(false);
  const { playAudio } = useAudio(); // Global Audio trigger

  useEffect(() => {
    try {
      const alreadySeen = sessionStorage.getItem(SESSION_KEY) === 'true';
      setVisible(!alreadySeen);
    } catch {
      setVisible(true);
    }
  }, []);

  function handleEnter() {
    playAudio(); 
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // ignore
    }
    setClosing(true);
    setTimeout(() => setVisible(false), 700);
  }

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#140103] transition-opacity duration-700 ease-in-out select-none ${
        closing ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to PujaMate"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 40%, rgba(168, 19, 26, 0.45) 0%, transparent 60%),
          radial-gradient(circle at 50% 90%, rgba(226, 177, 60, 0.15) 0%, transparent 50%)
        `,
      }}
    >
      {/* Shiuli Flower Falling Animation Canvas */}
      <ShiuliFlowersCanvas />

      {/* Background Radial Light Rays Effect */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg at 50% 40%, #E2B13C 0deg, transparent 20deg, #E2B13C 40deg, transparent 60deg, #E2B13C 80deg, transparent 100deg, #E2B13C 120deg, transparent 140deg, #E2B13C 160deg, transparent 180deg, #E2B13C 200deg, transparent 220deg, #E2B13C 240deg, transparent 260deg, #E2B13C 280deg, transparent 300deg, #E2B13C 320deg, transparent 340deg, #E2B13C 360deg)',
          filter: 'blur(30px)'
        }}
      />

      {/* Ambient festive aura pulsing behind Maa Durga */}
      <div
        aria-hidden="true"
        className="absolute h-80 w-80 animate-aura-pulse rounded-full blur-3xl sm:h-[400px] sm:w-[400px]"
        style={{
          background:
            'radial-gradient(circle, rgba(226,177,60,0.5) 0%, rgba(139,0,0,0.3) 55%, transparent 75%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center gap-7 px-6 text-center z-20"
      >
        {/* Durga Maa Image Container with Orbiting Diyas */}
        <div className="relative h-64 w-64 sm:h-80 sm:w-80 flex items-center justify-center">
          
          {/* Subtle Golden Orbit Rings */}
          <div className="absolute h-[236px] w-[236px] sm:h-[300px] sm:w-[300px] rounded-full border border-[#E2B13C]/30 shadow-[0_0_15px_rgba(226,177,60,0.15)]" />
          <div className="absolute h-[210px] w-[210px] sm:h-[270px] sm:w-[270px] rounded-full border border-dashed border-[#E2B13C]/20" />

          {/* Rotating Diya Ring */}
          <div
            className="absolute inset-0 animate-orbit-slow [--orbit-radius:118px] sm:[--orbit-radius:150px]"
            aria-hidden="true"
          >
            {DIYA_ANGLES.map((angle, index) => (
              <div
                key={angle}
                className="absolute left-1/2 top-1/2"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div
                  className="absolute"
                  style={{
                    transform: 'translate(-50%, calc(-50% - var(--orbit-radius)))',
                  }}
                >
                  <div className="animate-orbit-slow-reverse">
                    <Diya flickerDelay={index * 0.18} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Durga Maa Image */}
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex items-center justify-center"
          >
            {/* Outer Golden Halo Glow */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-[#E2B13C] to-[#FF4500] opacity-40 blur-lg" />
            
            <img
              src="/images/durga-ma.jpg"
              alt="Durga Maa"
              className="relative h-36 w-36 rounded-full object-cover shadow-[0_0_35px_rgba(226,177,60,0.6)] sm:h-44 sm:w-44 border-2 border-[#FFE89C]"
            />
          </motion.div>
        </div>

        {/* Title & Subtitle */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-[#FFF0C2] via-[#E2B13C] to-[#C89218] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] sm:text-4xl">
            শুভ শারদীয়া
          </h1>
          <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[#E2B13C]/60 to-transparent my-1" />
          <p className="font-body text-xs tracking-widest uppercase text-[#FFF8F0]/75 sm:text-sm font-medium">
            Welcome to your Durga Puja companion
          </p>
        </div>

        {/* Royal Agamoni Glassmorphic Button */}
        <button
          type="button"
          onClick={handleEnter}
          className="group relative focus-ring overflow-hidden rounded-full p-[1px] shadow-[0_0_30px_rgba(226,177,60,0.35)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_45px_rgba(226,177,60,0.6)] active:scale-[0.98]"
        >
          {/* Border Gradient Container */}
          <div className="rounded-full bg-gradient-to-r from-[#FFE89C] via-[#E2B13C] to-[#A8131A] p-[1.5px]">
            <div className="flex flex-col items-center justify-center rounded-full bg-gradient-to-r from-[#70050B] via-[#940C13] to-[#590207] px-9 py-3 sm:px-10 sm:py-3.5 transition-all group-hover:bg-gradient-to-r group-hover:from-[#82070E] group-hover:via-[#A61018] group-hover:to-[#6B040A]">
              <span className="font-heading text-base font-bold text-[#FFF8F0] group-hover:text-[#FFE89C] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] sm:text-lg">
                শুভ শারদীয়া - প্রবেশ করুন
              </span>
              <span className="text-[10px] tracking-wider font-body font-normal text-[#FFF8F0]/75 uppercase sm:text-[11px]">
                Start Experience
              </span>
            </div>
          </div>
        </button>
      </motion.div>
    </div>
  );
}

/* Enhanced Realistic Diya Flame Component */
function Diya({ flickerDelay = 0 }) {
  return (
    <div className="flex flex-col items-center" aria-hidden="true">
      {/* Outer Flame Glow Layer */}
      <div className="relative flex items-center justify-center">
        {/* Glow Aura */}
        <div 
          className="absolute h-6 w-4 animate-flicker rounded-full bg-[#FF4500]/60 blur-sm"
          style={{ animationDelay: `${flickerDelay}s` }}
        />
        
        {/* Main Organic Flame Shape */}
        <div
          className="relative h-5 w-2.5 animate-flicker rounded-t-full rounded-b-[40%] bg-gradient-to-t from-[#FF3300] via-[#FFA500] via-60% to-[#FFFFE0] shadow-[0_-2px_10px_rgba(255,165,0,0.9),0_0_15px_rgba(255,69,0,0.8)]"
          style={{ 
            animationDelay: `${flickerDelay}s`,
            transformOrigin: 'bottom center'
          }}
        >
          {/* Inner Blue Core of the Flame */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1.5 w-1 rounded-full bg-[#4169E1]/80 blur-[0.5px]" />
        </div>
      </div>

      {/* Clay Diya Base */}
      <div className="-mt-0.5 h-2.5 w-6 rounded-b-full bg-gradient-to-b from-[#A0522D] via-[#8B4513] to-[#2B0E00] border-t border-[#E2B13C]/60 shadow-md" />
    </div>
  );
}

/* Shiuli Flower Falling Canvas Animation */
function ShiuliFlowersCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Shiuli Flowers
    const numFlowers = 32;
    const flowers = Array.from({ length: numFlowers }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 5 + 6,
      speedY: Math.random() * 1.1 + 0.5,
      speedX: Math.random() * 0.6 - 0.3,
      rotation: Math.random() * 360,
      spinSpeed: Math.random() * 1.2 - 0.6,
      opacity: Math.random() * 0.5 + 0.5,
    }));

    function drawFlower(x, y, size, rotation, opacity) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;

      // Draw 6 White Petals
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.rotate((60 * Math.PI) / 180);
        ctx.ellipse(0, size / 1.5, size / 3.2, size / 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center Stem (Orange)
      ctx.beginPath();
      ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FF4500';
      ctx.fill();

      ctx.restore();
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      flowers.forEach((flower) => {
        flower.y += flower.speedY;
        flower.x += Math.sin(flower.y * 0.008) * 0.7;
        flower.rotation += flower.spinSpeed;

        if (flower.y > height + 20) {
          flower.y = -20;
          flower.x = Math.random() * width;
        }

        drawFlower(flower.x, flower.y, flower.size, flower.rotation, flower.opacity);
      });

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10"
    />
  );
}