import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { GameTime } from '../utils/timeHelpers';

interface AnalogueClockProps {
  time: GameTime;
  size?: number; // width and height in px
  showAmPmGraphic?: boolean;
}

export default function AnalogueClock({ time, size = 260, showAmPmGraphic = true }: AnalogueClockProps) {
  const { hour, minute, isAm } = time;

  // Rotation angles for clock hands
  const minuteAngle = minute * 6; // 360 / 60
  const hourAngle = (hour % 12) * 30 + minute * 0.5; // 360 / 12 = 30; plus 0.5 deg per minute

  // Trigonometry to place number indices on clock face
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div 
      className="relative flex items-center justify-center select-none" 
      style={{ width: size, height: size }}
      id={`analogue-clock-${hour}-${minute}`}
    >
      
      {/* 1. Sky/AM PM Background Frame */}
      <div 
        className={`absolute inset-0 rounded-full border-[10px] shadow-2xl transition-all duration-1000 overflow-hidden ${
          isAm 
            ? 'bg-gradient-to-b from-[#7ec0ee] via-[#aed8f2] to-[#fcddb0] border-[#5C7E92]' 
            : 'bg-gradient-to-b from-[#181145] via-[#332267] to-[#d65f5f] border-[#2C1F4D]'
        }`}
      >
        {/* Sky features based on AM/PM (Sunrise vs Sunset) */}
        {isAm ? (
          // Sunrise theme
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Sun Rays */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-200/20 rounded-full blur-xl"
            />
            
            {/* Glowing Sun rising */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-art-gold drop-shadow-[0_0_12px_rgba(232,176,91,0.8)]"
            >
              <Sun size={48} className="fill-yellow-100/40 text-yellow-300" />
            </motion.div>

            {/* Clouds */}
            <motion.div 
              animate={{ x: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
              className="absolute top-10 left-6 w-16 h-5 bg-white/60 rounded-full blur-[1px]"
            />
            <motion.div 
              animate={{ x: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
              className="absolute top-16 right-10 w-12 h-4 bg-white/40 rounded-full blur-[1px]"
            />

            <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-slate-700/60 bg-white/40 px-3 py-0.5 rounded-full backdrop-blur-[2px]">
              TĀKIRI TE ATA • SUNRISE (AM)
            </div>
          </div>
        ) : (
          // Sunset theme
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Stars */}
            <div className="absolute top-4 left-8 w-1 h-1 bg-white rounded-full animate-pulse" />
            <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-white/80 rounded-full animate-ping [animation-duration:3s]" />
            <div className="absolute top-8 right-24 w-1 h-1 bg-white/50 rounded-full" />
            <div className="absolute top-20 left-16 w-1 h-1 bg-white/70 rounded-full" />

            {/* Glowing Moon or Sunset Sun */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-orange-200 drop-shadow-[0_0_15px_rgba(254,215,170,0.6)]"
            >
              <Moon size={40} className="fill-orange-100/20 text-orange-200 rotate-12" />
            </motion.div>

            {/* Dark Sunset Silhouettes */}
            <div className="absolute -bottom-2 -left-4 w-28 h-10 bg-indigo-950/40 rounded-full blur-sm" />
            <div className="absolute -bottom-2 -right-4 w-24 h-8 bg-indigo-950/50 rounded-full blur-sm" />

            <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-yellow-100/70 bg-black/30 px-3 py-0.5 rounded-full backdrop-blur-[2px]">
              TŌ TE RĀ • SUNSET (PM)
            </div>
          </div>
        )}

        {/* Ambient Overlay for Clock readability */}
        <div className={`absolute inset-3 rounded-full backdrop-blur-[1px] ${
          isAm ? 'bg-white/65' : 'bg-slate-900/65'
        }`} />
      </div>

      {/* 2. Clock Face Dial (Numbers) */}
      <div className="absolute inset-0">
        {numbers.map((num) => {
          const angle = (num * 30 - 90) * (Math.PI / 180);
          const radius = size * 0.36; // Place values slightly within the rim
          const x = size / 2 + radius * Math.cos(angle);
          const y = size / 2 + radius * Math.sin(angle);

          return (
            <div
              key={num}
              className={`absolute -translate-x-1/2 -translate-y-1/2 font-display font-semibold transition-colors duration-500 select-none ${
                isAm 
                  ? 'text-slate-800 text-lg sm:text-xl' 
                  : 'text-orange-500/90 text-lg sm:text-xl font-bold'
              }`}
              style={{ left: x, top: y }}
            >
              {num}
            </div>
          );
        })}

        {/* Hour markers (ticks for non-number spaces) */}
        {Array.from({ length: 60 }).map((_, i) => {
          if (i % 5 === 0) return null; // Already covered by number
          const angle = i * 6; // 360 / 60
          return (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `rotate(${angle}deg) translateY(-${size * 0.42}px)`,
                backgroundColor: isAm ? 'rgba(71, 85, 105, 0.25)' : 'rgba(254, 215, 170, 0.25)'
              }}
            />
          );
        })}
      </div>

      {/* 3. Hands Layer via SVG for absolute mathematical precision */}
      <svg 
        className="absolute inset-0 pointer-events-none" 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
      >
        <g transform={`rotate(${hourAngle}, ${size / 2}, ${size / 2})`}>
          {/* Hour hand */}
          <rect 
            x={size / 2 - 4} 
            y={size / 2 - size * 0.26} 
            width={8} 
            height={size * 0.26} 
            rx={4} 
            fill={isAm ? '#2D3748' : '#FBD38D'} 
            style={{ filter: "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))" }}
          />
        </g>
        <g transform={`rotate(${minuteAngle}, ${size / 2}, ${size / 2})`}>
          {/* Minute hand */}
          <rect 
            x={size / 2 - 2.5} 
            y={size / 2 - size * 0.38} 
            width={5} 
            height={size * 0.38} 
            rx={2.5} 
            fill={isAm ? '#4A5568' : '#FEFCBF'} 
            style={{ filter: "drop-shadow(0px 2px 3px rgba(0,0,0,0.25))" }}
          />
        </g>
        {/* Center pin overlay */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={9} 
          fill={isAm ? '#1A202C' : '#ED8936'} 
          stroke="#FFFFFF" 
          strokeWidth={3} 
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))" }}
        />
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={3} 
          fill={isAm ? '#FFFFFF' : '#FFE0B2'} 
        />
      </svg>



    </div>
  );
}
