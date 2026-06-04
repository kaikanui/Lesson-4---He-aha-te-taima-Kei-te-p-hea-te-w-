import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, RotateCcw, ArrowLeft, Hand, Clock, Info } from 'lucide-react';
import HandTracker from './HandTracker';
import AnalogueClock from './AnalogueClock';
import { 
  GameTime, 
  getMaoriTime, 
  formatDigitalTime, 
  getRandomTime, 
  generateQuizOptions 
} from '../utils/timeHelpers';

interface CameraGameProps {
  onExit: () => void;
}

const SELECTION_THRESHOLD_MS = 1000; // Snappy selection duration

export default function CameraGame({ onExit }: CameraGameProps) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [targetTime, setTargetTime] = useState<GameTime | null>(null);
  const [options, setOptions] = useState<GameTime[]>([]);
  const [targetIndex, setTargetIndex] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'feedback'>('playing');
  const [feedbackType, setFeedbackType] = useState<'success' | 'fail' | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverProgress, setHoverProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0.5, y: 0.5 });
  const [handDetected, setHandDetected] = useState(false);

  // References to the 4 corners for checking hand intersection
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize a new level
  const generateLevel = useCallback(() => {
    const correct = getRandomTime();
    setTargetTime(correct);
    
    const quizOptions = generateQuizOptions(correct);
    setOptions(quizOptions);
    
    // Find where the correct answer ended up in the shuffled list
    const correctIdx = quizOptions.findIndex(
      opt => opt.hour === correct.hour && opt.minute === correct.minute && opt.isAm === correct.isAm
    );
    setTargetIndex(correctIdx);
    
    setGameState('playing');
    setFeedbackType(null);
    setHoverProgress(0);
    setHoverIndex(null);
  }, []);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  // Handle hand coordinate updates from MediaPipe
  const handleHandUpdate = useCallback((landmarks: any[]) => {
    if (landmarks.length === 0) {
      setHandDetected(false);
      if (gameState === 'playing') {
        setHoverIndex(null);
        setHoverProgress(0);
      }
      return;
    }

    setHandDetected(true);
    const hand = landmarks[0];
    const indexFingerTip = hand[8]; // Index finger tip landmark
    
    // MediaPipe coordinates are 0-1 relative to the video feed.
    // Since video is mirrored visually via CSS, we mirror X to match physical screen coordinates.
    const x = 1 - indexFingerTip.x;
    const y = indexFingerTip.y;

    setCursorPos({ x, y });

    if (gameState !== 'playing') return;

    // Convert normalized coordinates to screen pixel coordinates
    const px = x * window.innerWidth;
    const py = y * window.innerHeight;

    let currentHover: number | null = null;

    // Check if the cursor is within any of the 4 box bounding rectangles
    boxRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      
      const padding = 20; // Expanded hit area to make tracking very forgivable
      if (
        px >= rect.left - padding && 
        px <= rect.right + padding && 
        py >= rect.top - padding && 
        py <= rect.bottom + padding
      ) {
        currentHover = idx;
      }
    });

    setHoverIndex(currentHover);
  }, [gameState]);

  // Handle selection timer
  useEffect(() => {
    let interval: number;
    if (hoverIndex !== null && gameState === 'playing') {
      const startTime = Date.now();
      interval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / SELECTION_THRESHOLD_MS, 1);
        setHoverProgress(progress);

        if (progress >= 1) {
          clearInterval(interval);
          checkAnswer(hoverIndex);
        }
      }, 30);
    } else {
      setHoverProgress(0);
    }
    return () => clearInterval(interval);
  }, [hoverIndex, gameState]);

  const checkAnswer = (index: number) => {
    if (index === targetIndex) {
      setScore(s => s + 1);
      setFeedbackType('success');
    } else {
      setFeedbackType('fail');
    }
    setGameState('feedback');
  };

  const nextLevel = useCallback(() => {
    generateLevel();
  }, [generateLevel]);

  // Auto-advance timer on feedback round
  useEffect(() => {
    let timeout: number;
    if (gameState === 'feedback') {
      timeout = window.setTimeout(() => {
        nextLevel();
      }, 4000); // 4 seconds to inspect the answer & translation
    }
    return () => clearTimeout(timeout);
  }, [gameState, nextLevel]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col font-sans overflow-hidden" id="camera-game-container">
      
      {/* Background Camera Layer */}
      <div className="absolute inset-0 opacity-60">
        <HandTracker onHandUpdate={handleHandUpdate} isPaused={gameState === 'feedback'} />
      </div>

      {/* Hand Cursor Overlay */}
      <AnimatePresence>
        {handDetected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              left: `${cursorPos.x * 100}%`,
              top: `${cursorPos.y * 100}%`
            }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"
            transition={{ type: "spring", damping: 20, stiffness: 300, mass: 0.5 }}
            id="cursor"
          >
            <div className="relative">
              {/* Outer Glow */}
              <div className="absolute inset-0 scale-150 blur-xl bg-orange-400/40 rounded-full animate-pulse" />
              {/* Main Dot */}
              <div className="w-9 h-9 bg-art-orange border-4 border-white rounded-full shadow-[0_0_25px_rgba(217,108,79,0.9)] flex items-center justify-center text-white" />
              {/* Rippling circle during active hover selection */}
              {hoverProgress > 0 && (
                <div 
                  className="absolute inset-[-12px] border-4 border-art-gold rounded-full animate-ping opacity-90"
                  style={{ animationDuration: '0.8s' }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main UI Overlay */}
      <div className="relative h-full flex flex-col z-10 pointer-events-none p-4 select-none justify-between">
        
        {/* Top Header */}
        <header className="flex items-center justify-between pointer-events-auto">
          <button 
            onClick={onExit}
            className="bg-white/90 hover:bg-white text-art-green hover:text-art-orange p-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
            id="exit-camera-btn"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="flex flex-col items-center max-w-[50%] md:max-w-[60%]">
            <div className="bg-white/95 backdrop-blur-md px-6 py-2 rounded-3xl border-2 border-art-green shadow-xl text-center">
              <span className="text-[10px] sm:text-xs font-bold text-art-orange tracking-wider uppercase block">
                KEI TE PĒHEA TE WĀ? • HE AHA TE TAIMA?
              </span>
              <h2 className="text-sm sm:text-lg font-black text-art-green leading-tight">
                Wave your hand over the correct digital time!
              </h2>
            </div>
          </div>

          <div className="bg-art-gold text-white px-6 py-2.5 rounded-full font-black text-base shadow-xl border-2 border-white/20 flex items-center gap-2">
            <Clock size={18} className="animate-spin [animation-duration:12s]" />
            <span>Kore (Score): {score}</span>
          </div>
        </header>

        {/* Mid Container: Layout holding Analogue clock in Center and 4 Answers in corners */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2 relative gap-4 sm:gap-6 md:gap-8 my-4">
          
          {/* Centered Analogue Clock Question Panel (Absolute middle of grid) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            {targetTime && (
              <motion.div 
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="bg-white/95 p-4 sm:p-6 rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.3)] border-4 border-art-green flex flex-col items-center"
              >
                <div className="text-[10px] font-black text-art-orange tracking-widest uppercase mb-2">
                  He aha tēnei taimā?
                </div>
                <AnalogueClock time={targetTime} size={window.innerHeight < 800 ? 180 : 210} />
              </motion.div>
            )}
          </div>

          {/* Render 4 Answer Corners */}
          {options.map((option, idx) => {
            const isHovered = hoverIndex === idx;
            const formattedTime = formatDigitalTime(option);
            const isTarget = idx === targetIndex;
            
            // Positioning orientations to help design grid alignment beautifully
            const placementClass = `
              flex items-center justify-center p-2 
              ${idx === 0 || idx === 2 ? 'justify-start' : 'justify-end'} 
              ${idx < 2 ? 'items-start' : 'items-end'}
            `;

            return (
              <div key={`${formattedTime}-${idx}`} className={placementClass}>
                <motion.button
                  ref={el => { boxRefs.current[idx] = el; }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => {
                    if (gameState === 'playing') setHoverIndex(idx);
                  }}
                  onMouseLeave={() => {
                    if (gameState === 'playing') {
                      setHoverIndex(null);
                      setHoverProgress(0);
                    }
                  }}
                  onClick={() => {
                    if (gameState === 'playing') checkAnswer(idx);
                  }}
                  className={`
                    w-[38vw] h-[32vw] sm:w-[30vw] sm:h-[26vw] md:w-64 md:h-40 xl:w-72 xl:h-48
                    bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border-4
                    flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300
                    pointer-events-auto cursor-pointer outline-none focus:ring-4 focus:ring-art-orange/40
                    ${isHovered ? 'border-art-orange scale-105 shadow-xl shadow-art-orange/25' : 'border-white'}
                  `}
                  id={`corner-option-${idx}`}
                >
                  {/* Dynamic Circular Progress bar surrounding the item on active selection */}
                  {isHovered && (
                    <div 
                      className="absolute bottom-0 left-0 h-2.5 bg-gradient-to-r from-art-orange to-art-gold transition-all duration-75"
                      style={{ width: `${hoverProgress * 100}%` }}
                    />
                  )}

                  {/* Top: Elegant AM/PM signifier pill */}
                  <div className={`absolute top-2.5 px-3 py-0.5 text-[8px] sm:text-[10px] font-black rounded-full select-none ${
                    option.isAm ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {option.isAm ? 'Ata • Morning' : 'Ahiahi • Afternoon'}
                  </div>

                  {/* Digital Clock digits */}
                  <div className="text-2xl sm:text-3.5xl font-mono font-bold tracking-wider text-slate-800 mt-2 flex items-center gap-1.5">
                    <span className="bg-slate-200/60 px-2 py-0.5 rounded-lg border border-slate-300/40">
                      {option.hour.toString().padStart(2, '0')}
                    </span>
                    <span className="animate-pulse text-art-orange">:</span>
                    <span className="bg-slate-200/60 px-2 py-0.5 rounded-lg border border-slate-300/40">
                      {option.minute.toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs font-sans font-black opacity-60 ml-1">
                      {option.isAm ? 'AM' : 'PM'}
                    </span>
                  </div>

                  {/* Written Te Reo Māori Answer */}
                  <div className="w-full px-3 text-center mt-3">
                    <p className="text-xs sm:text-sm font-black text-art-green leading-normal line-clamp-2" title={getMaoriTime(option.hour, option.minute)}>
                      {getMaoriTime(option.hour, option.minute)}
                    </p>
                  </div>
                </motion.button>
              </div>
            );
          })}

        </div>

        {/* Bottom instructions / Helper status */}
        <footer className="w-full flex justify-between items-center pointer-events-auto">
          {gameState === 'playing' ? (
            <div className="mx-auto bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full flex items-center gap-3 text-white border border-white/10 animate-pulse text-xs sm:text-sm">
              <Hand size={18} />
              <span className="font-bold">Hold your hand cursor over the matching Box to select!</span>
            </div>
          ) : (
            <div className="h-10" />
          )}
        </footer>

        {/* Results Feedback Overlay */}
        <AnimatePresence>
          {gameState === 'feedback' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto z-50"
              id="camera-feedback-overlay"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                className={`max-w-md w-full p-8 rounded-[3rem] text-center shadow-2xl border-4 ${
                  feedbackType === 'success' ? 'bg-white border-art-green' : 'bg-white border-art-orange'
                }`}
              >
                <div className="flex justify-center mb-5">
                  {feedbackType === 'success' ? (
                    <CheckCircle2 size={110} className="text-art-green fill-art-green/10 animate-bounce" />
                  ) : (
                    <XCircle size={110} className="text-art-orange fill-art-orange/10 animate-shake" />
                  )}
                </div>
                
                <h3 className="text-4xl sm:text-5xl font-black mb-1.5 text-art-text">
                  {feedbackType === 'success' ? 'Ka Rawe!' : 'Kia Mau!'}
                </h3>
                <p className="text-base sm:text-lg text-art-text/60 mb-6 italic leading-relaxed">
                  {feedbackType === 'success' 
                    ? `Excellent! You matched the analog clock's sunset/sunrise to digital ${formatDigitalTime(targetTime!)}!` 
                    : `That's incorrect. Try to read the hour and minute hands carefully!`}
                </p>

                {/* Show the correct Māori text for education */}
                <div className="bg-art-bg p-4 rounded-2xl border-2 border-slate-100 mb-6 text-center">
                  <p className="text-[10px] font-bold text-art-orange uppercase tracking-widest mb-1">Māori Translation:</p>
                  <p className="font-black text-art-green text-lg">
                    {getMaoriTime(targetTime!.hour, targetTime!.minute)}
                  </p>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    ({formatDigitalTime(targetTime!)})
                  </p>
                </div>

                <button 
                  onClick={nextLevel}
                  className="w-full bg-art-green hover:bg-art-green/90 text-white py-4.5 rounded-2xl font-black text-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 relative overflow-hidden"
                  id="camera-continue-btn"
                >
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 4, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1.5 bg-white/30"
                  />
                  <RotateCcw size={22} />
                  <span>Haere tonu (Continue)</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
