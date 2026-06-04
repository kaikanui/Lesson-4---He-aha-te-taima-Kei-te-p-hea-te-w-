import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Square, 
  Circle, 
  Star, 
  Triangle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  ArrowRight,
  HelpCircle,
  Award,
  Sparkles,
  Clock,
  PieChart,
  Grid
} from 'lucide-react';
import { 
  GameTime, 
  getMaoriTime, 
  formatDigitalTime, 
  getRandomTimeForMode, 
  generateQuizOptionsForMode 
} from '../utils/timeHelpers';

interface ShapesGameProps {
  onExit: () => void;
}

type ShapesSubMode = 'hours' | 'quarters' | 'all';

// Map each of the 4 card slots to a highly recognizable visual shape
const SHAPES_CONFIG = [
  {
    id: 'square',
    name: 'Te Tapawhā (Square)',
    icon: Square,
    colorClass: 'border-amber-500 text-amber-600 bg-amber-50/50',
    shapeElement: (
      <div className="w-12 h-12 border-[5px] border-amber-500 bg-amber-200/40 rounded-lg shadow-sm shrink-0" />
    )
  },
  {
    id: 'circle',
    name: 'Te Porohita (Circle)',
    icon: Circle,
    colorClass: 'border-sky-500 text-sky-600 bg-sky-50/50',
    shapeElement: (
      <div className="w-12 h-12 border-[5px] border-sky-500 bg-sky-200/40 rounded-full shadow-sm shrink-0" />
    )
  },
  {
    id: 'star',
    name: 'Te Whetū (Star)',
    icon: Star,
    colorClass: 'border-yellow-500 text-yellow-600 bg-yellow-50/50',
    shapeElement: (
      <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-yellow-500 fill-yellow-200/40 stroke-[2.5]" style={{ transform: 'scale(1.15)' }}>
          <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
        </svg>
      </div>
    )
  },
  {
    id: 'triangle',
    name: 'Te Tapatoru (Triangle)',
    icon: Triangle,
    colorClass: 'border-emerald-500 text-emerald-600 bg-emerald-50/50',
    shapeElement: (
      <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-emerald-500 fill-emerald-200/40 stroke-[2.5]">
          <polygon points="12,2 2,22 22,22" />
        </svg>
      </div>
    )
  }
];

export default function ShapesGame({ onExit }: ShapesGameProps) {
  const [subMode, setSubMode] = useState<ShapesSubMode | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0); // 0 to 19 (total 20 questions)
  const [score, setScore] = useState(0);
  const [targetTime, setTargetTime] = useState<GameTime | null>(null);
  const [options, setOptions] = useState<GameTime[]>([]);
  const [targetOptionIdx, setTargetOptionIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Generate a new question
  const generateNewQuestion = useCallback((selectedMode: ShapesSubMode) => {
    const correct = getRandomTimeForMode(selectedMode);
    setTargetTime(correct);
    
    const quizOptions = generateQuizOptionsForMode(correct, selectedMode);
    setOptions(quizOptions);
    
    // Find where the correct answer lies
    const idx = quizOptions.findIndex(
      opt => opt.hour === correct.hour && opt.minute === correct.minute && opt.isAm === correct.isAm
    );
    setTargetOptionIdx(idx);
    
    setSelectedIdx(null);
    setAnswered(false);
  }, []);

  // Initialize first question when sub-mode is chosen
  useEffect(() => {
    if (subMode) {
      setQuestionIndex(0);
      setScore(0);
      setIsFinished(false);
      generateNewQuestion(subMode);
    }
  }, [subMode, generateNewQuestion]);

  const handleSelectOption = (index: number) => {
    if (answered) return;
    
    setSelectedIdx(index);
    setAnswered(true);
    
    const isCorrect = index === targetOptionIdx;
    if (isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (questionIndex >= 19) {
      setIsFinished(true);
    } else {
      setQuestionIndex(q => q + 1);
      if (subMode) {
        generateNewQuestion(subMode);
      }
    }
  };

  const handleReset = () => {
    setQuestionIndex(0);
    setScore(0);
    setIsFinished(false);
    if (subMode) {
      generateNewQuestion(subMode);
    }
  };

  const handleChangeMode = () => {
    setSubMode(null);
    setQuestionIndex(0);
    setScore(0);
    setIsFinished(false);
  };

  // Badge grading based on final school scoreboard
  const getBadgeDetails = () => {
    const accuracy = (score / 20) * 100;
    if (accuracy === 100) {
      return {
        title: 'Tumuaki (Super Gold Badge)',
        desc: 'Flawless score! You have completely mastered telling the time in Te Reo Māori!',
        color: 'text-amber-500 bg-amber-50 border-amber-300',
        emoji: '👑'
      };
    } else if (accuracy >= 80) {
      return {
        title: 'Ka Rawe (Gold Scholar Badge)',
        desc: 'Fantastic job! Excellent understanding of times, hours, and minutes!',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        emoji: '⭐'
      };
    } else if (accuracy >= 50) {
      return {
        title: 'Kia Kaha (Polished Silver Badge)',
        desc: 'Good effort! You read several digital times and matched their Māori grammar perfectly.',
        color: 'text-slate-600 bg-slate-50 border-slate-200',
        emoji: '🛡️'
      };
    } else {
      return {
        title: 'Kia Mau (Bronze Learner Shield)',
        desc: 'Keep training! Match more sunset/sunrise cues and the "mai te" grammar markers to improve.',
        color: 'text-bronze-600 bg-orange-50/50 border-orange-200',
        emoji: '💪'
      };
    }
  };

  // Mode Selection Landing Page
  if (!subMode) {
    return (
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-art-green/15 shadow-xl max-w-4xl mx-auto my-4 lg:my-5 space-y-6" id="shapes-submode-select">
        <div className="text-center space-y-2">
          <span className="bg-art-green/10 text-art-green px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block">
            Lesson 4 • Kēmu Māpere Progress Hub
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-art-green tracking-tight">
            Whiriwhiria Tō Kēmu
          </h2>
          <p className="text-sm text-art-text/70 max-w-2xl mx-auto leading-relaxed">
            Choose a lesson difficulty to practice matching digital displays with Te Reo Māori time descriptions across 20 fun questions!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          
          {/* Card 1: Hours Only */}
          <button
            onClick={() => setSubMode('hours')}
            className="p-5 rounded-3xl border-4 border-amber-100 hover:border-amber-400 bg-amber-50/30 text-left flex flex-col justify-between h-64 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer outline-none group"
            id="submode-hours-card"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-black text-lg text-art-green group-hover:text-amber-600 transition-colors">
                  Hāora Anake
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Hours Only
                </p>
              </div>
              <p className="text-xs text-art-text/70 leading-relaxed">
                Practice whole clock hours only. Simple phrases like <strong>"Kotahi karaka"</strong> (1:00) and <strong>"E rima karaka"</strong> (5:00).
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-amber-600 pt-2">
              <span>Begin Lesson</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Hours, Quarters & Halves */}
          <button
            onClick={() => setSubMode('quarters')}
            className="p-5 rounded-3xl border-4 border-sky-100 hover:border-sky-400 bg-sky-50/30 text-left flex flex-col justify-between h-64 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer outline-none group"
            id="submode-quarters-card"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                <PieChart size={20} />
              </div>
              <div>
                <h3 className="font-black text-lg text-art-green group-hover:text-sky-600 transition-colors">
                  Hāora Tautoko
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Quarters & Halves
                </p>
              </div>
              <p className="text-xs text-art-text/70 leading-relaxed">
                Includes whole hours, quarter-past (15 mins), half-past (30 mins), and quarter-to (45 mins) intervals.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-sky-600 pt-2">
              <span>Begin Lesson</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: All Times */}
          <button
            onClick={() => setSubMode('all')}
            className="p-5 rounded-3xl border-4 border-emerald-100 hover:border-emerald-400 bg-emerald-50/30 text-left flex flex-col justify-between h-64 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer outline-none group"
            id="submode-all-card"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-black text-lg text-art-green group-hover:text-emerald-600 transition-colors">
                  Ngā Wā Katoa
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  All Time Intervals
                </p>
              </div>
              <p className="text-xs text-art-text/70 leading-relaxed">
                The ultimate test! Practice all 5-minute intervals, past and future, matching the full Te Reo Māori vocabulary.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-emerald-600 pt-2">
              <span>Begin Lesson</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={onExit}
            className="bg-white hover:bg-slate-50 text-art-green border border-art-green/20 font-black text-sm px-8 py-3 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
            id="submode-exit-btn"
          >
            Return to Clock Hub
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const badge = getBadgeDetails();
    return (
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-art-green/15 shadow-xl max-w-2xl mx-auto my-4 text-center space-y-6" id="shapes-finished-view">
        <div className="space-y-1">
          <span className="bg-art-gold/15 text-art-gold-dark px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block">
            Māpere Kēmu Whakakapi • Activity Complete
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-art-green leading-tight">
            Ioti te Mahi!
          </h2>
          <p className="text-sm text-art-text/60 font-medium italic">
            You finished all 20 time questions in the{' '}
            <span className="text-art-orange uppercase font-bold not-italic">
              {subMode === 'hours' ? 'Hours Only' : subMode === 'quarters' ? 'Quarters & Halves' : 'All Times'}
            </span>{' '}
            lesson!
          </p>
        </div>

        {/* Big Score circle */}
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-art-green/5 border-8 border-dotted border-art-green/20 rounded-full animate-spin [animation-duration:40s]" />
          <div className="absolute inset-2 bg-white rounded-full shadow-lg border-4 border-art-green flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold text-art-orange uppercase tracking-wider">Tō Kōre (Your Score)</span>
            <span className="text-5xl font-black text-art-green font-mono">{score}</span>
            <span className="text-xs font-bold text-slate-400">/ 20 Pātai</span>
          </div>
          {score >= 15 && (
            <div className="absolute -top-1 -right-1 bg-art-gold text-white p-2.5 rounded-full shadow-lg border-2 border-white animate-bounce">
              <Sparkles size={16} />
            </div>
          )}
        </div>

        {/* Badge Card */}
        <div className={`p-4 rounded-2xl border-2 text-left space-y-1 max-w-sm mx-auto ${badge.color}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{badge.emoji}</span>
            <div>
              <h4 className="font-black text-sm text-art-green">{badge.title}</h4>
              <p className="text-[11px] text-opacity-90">{badge.desc}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={handleReset}
            className="bg-art-green hover:bg-art-green/90 text-white font-black text-sm px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            id="btn-shapes-restart"
          >
            <RotateCcw size={16} />
            <span>Tākaro Anō (Play Again)</span>
          </button>

          <button
            onClick={handleChangeMode}
            className="bg-amber-550 hover:bg-amber-600 text-white font-black text-sm px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: '#ED8936' }}
            id="btn-shapes-change-lesson"
          >
            <Clock size={16} />
            <span>Change Lesson Mode</span>
          </button>
          
          <button
            onClick={onExit}
            className="bg-white hover:bg-slate-50 text-art-green border border-art-green/20 font-black text-sm px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            id="btn-shapes-exit"
          >
            <span>Exit to Main Hub</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5" id="shapes-game-root">
      
      {/* Top Banner & Stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 lg:p-5 rounded-2xl border border-art-green/10">
        <div>
          <span className="bg-art-green/10 text-art-green px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase inline-block mb-1">
            Lesson 4 • Kēmu Māpere ({subMode === 'hours' ? 'Hours Only' : subMode === 'quarters' ? 'Quarters & Halves' : 'All Times'})
          </span>
          <h2 className="text-lg md:text-xl font-black text-art-green">
            Match the Digital Time to the written Te Reo Māori!
          </h2>
        </div>

        {/* Progress Metrics and Back to Mode Selection */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleChangeMode}
            className="text-xs font-bold text-slate-500 hover:text-art-green bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer mr-1"
          >
            ← Change Mode
          </button>

          <div className="bg-slate-100 border border-slate-200 text-slate-700 font-mono px-4 py-2 rounded-xl text-center">
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Question</span>
            <span className="font-black text-md">{questionIndex + 1} <span className="opacity-40">/ 20</span></span>
          </div>

          <div className="bg-art-gold border border-art-gold-dark/20 text-white font-mono px-5 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[9px] text-yellow-105/90 font-black uppercase tracking-wider block">Score</span>
            <span className="font-black text-md">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Digital Time, Right Shape Buttons - 2 Columns on iPad Landscape/LG */}
      <div className="grid grid-cols-12 gap-5 lg:gap-6 items-stretch">
        
        {/* Left Column: Digital Display (Digital clock + Sky and explanations) */}
        <div className="col-span-12 lg:col-span-5 flex" id="shapes-digital-display-panel">
          {targetTime ? (
            <div className="w-full bg-slate-900 text-white rounded-[2.5rem] border-4 border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between relative">
              
              {/* Sky Background Backdrop Header inside the Digital Clock Box */}
              <div className={`p-4 transition-all duration-1000 flex items-center justify-between border-b border-white/10 ${
                targetTime.isAm 
                  ? 'bg-gradient-to-r from-[#4A7D9D] to-[#fcddb0]' 
                  : 'bg-gradient-to-r from-[#1E114D] to-[#993441]'
              }`}>
                <div>
                  <span className="text-[10px] font-black text-white/90 uppercase tracking-widest bg-black/20 px-2.5 py-0.5 rounded-full backdrop-blur-[2px]">
                    {targetTime.isAm ? 'ATA • AM SKY' : 'AHIAHI • PM SKY'}
                  </span>
                  <div className="text-white font-semibold text-[11px] mt-1">
                    {targetTime.isAm ? 'Sunrise Golden Rays' : 'Sunset Purplish Horizon'}
                  </div>
                </div>
                <div>
                  {targetTime.isAm ? (
                    <div className="w-8 h-8 rounded-full bg-yellow-200/30 flex items-center justify-center animate-pulse border border-yellow-300/35">
                      <span className="text-yellow-100 font-black text-sm">☀️</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-950/40 flex items-center justify-center animate-pulse border border-orange-400/25">
                      <span className="text-orange-200 font-black text-sm">🌙</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Central Large Digital Glow Face - Sized for iPad landscape */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center bg-[#070B19]/90">
                <p className="text-[10px] font-black text-art-orange uppercase tracking-widest mb-2">READ THE DIGITAL CLOCK:</p>
                
                <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-wider text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center justify-center gap-1.5">
                  <span className="bg-white/5 border border-white/10 px-3.5 py-1 rounded-2xl">
                    {targetTime.hour.toString().padStart(2, '0')}
                  </span>
                  <span className="text-art-orange animate-pulse">:</span>
                  <span className="bg-white/5 border border-white/10 px-3.5 py-1 rounded-2xl">
                    {targetTime.minute.toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="mt-3 bg-white/10 px-4 py-1 rounded-full border border-white/5 font-black text-yellow-100 text-xs tracking-widest inline-block">
                  {targetTime.isAm ? 'MORNING (AM)' : 'AFTERNOON/EVENING (PM)'}
                </div>
              </div>

              {/* Bottom Instructions Info */}
              <div className="p-4 bg-[#030611] text-[11px] text-white/50 leading-relaxed border-t border-white/5">
                <p className="flex items-center gap-1.5 font-bold text-white/70 mb-1">
                  <HelpCircle size={12} className="text-art-orange" />
                  How to Match:
                </p>
                Study the hours, minutes, and AM/PM time. Seek the written Te Reo Māori card on the right containing the correct formula! Look for "mai te" for minutes past.
              </div>

            </div>
          ) : (
            <div className="w-full bg-slate-900 rounded-3xl min-h-[250px] flex items-center justify-center">
              <span className="text-white/60 font-medium text-xs">Whakarite ana (Loading question...)</span>
            </div>
          )}
        </div>

        {/* Right Column: 4 options side-by-side with left on iPad landscape (lg) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-between gap-3 lg:gap-4" id="shapes-options-grid">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            {options.map((option, idx) => {
              const shape = SHAPES_CONFIG[idx];
              const isSelected = selectedIdx === idx;
              const isCorrectAnswer = idx === targetOptionIdx;
              
              let cardStyle = "bg-white border-2 border-slate-100 hover:border-art-green/30";
              if (answered) {
                if (isCorrectAnswer) {
                  // highlight correct answer in green
                  cardStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-md shadow-emerald-50";
                } else if (isSelected) {
                  // highlight wrong selection in red
                  cardStyle = "bg-red-50 border-red-500 text-red-950";
                } else {
                  // mute remaining options
                  cardStyle = "bg-white border-slate-100 opacity-60";
                }
              } else {
                // active states before selection
                if (isSelected) {
                  cardStyle = "bg-slate-50 border-art-orange ring-4 ring-art-orange/20 scale-[1.01]";
                }
              }

              return (
                <button
                  key={`${option.hour}-${option.minute}-${idx}`}
                  disabled={answered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl border-4 transition-all flex flex-col justify-between relative overflow-hidden h-36 outline-none ${
                    !answered ? 'cursor-pointer hover:bg-slate-50/50 hover:scale-[1.02] active:scale-[0.98]' : 'cursor-default'
                  } ${cardStyle}`}
                  id={`shape-option-${shape.id}`}
                >
                  
                  {/* Top area showing shape configured */}
                  <div className="w-full flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="scale-75 shrink-0 origin-left">
                        {shape.shapeElement}
                      </div>
                      <span className="font-black text-[10px] text-slate-500 tracking-wide uppercase font-sans">
                        {shape.name}
                      </span>
                    </div>

                    {/* Checkmark icon for correct / wrong answers on completion */}
                    {answered && isCorrectAnswer && (
                      <span className="text-emerald-500 fill-emerald-100 shrink-0">
                        <CheckCircle2 size={20} />
                      </span>
                    )}
                    {answered && isSelected && !isCorrectAnswer && (
                      <span className="text-red-500 fill-red-100 shrink-0">
                        <XCircle size={20} />
                      </span>
                    )}
                  </div>

                  {/* Written Te Reo Māori Option text, optimized size */}
                  <div className="mt-2 flex-1 flex flex-col justify-end">
                    <p className={`font-black text-sm leading-snug tracking-tight text-art-green line-clamp-2 ${
                      answered && isCorrectAnswer ? 'text-emerald-800' : ''
                    }`}>
                      {getMaoriTime(option.hour, option.minute)}
                    </p>
                    
                    {/* Small english translation revealed after selection */}
                    {answered && (
                      <p className="text-[9px] text-slate-400 font-bold italic mt-0.5">
                        ({formatDigitalTime(option)})
                      </p>
                    )}
                  </div>

                </button>
              );
            })}
          </div>

          {/* Feedback & Proceed Block */}
          <div className="h-20 lg:h-22 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {answered && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 shadow-md rounded-2xl"
                  id="shape-feedback-panel"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {selectedIdx === targetOptionIdx ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={18} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <XCircle size={18} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-black text-xs text-art-text truncate">
                        {selectedIdx === targetOptionIdx ? 'Ka Rawe! You got it!' : 'Kia Mau! Keep trying!'}
                      </p>
                      <p className="text-[10px] text-art-text/60 truncate" title={getMaoriTime(targetTime!.hour, targetTime!.minute)}>
                        {selectedIdx === targetOptionIdx 
                          ? `The digital time is ${getMaoriTime(targetTime!.hour, targetTime!.minute)}!` 
                          : `The correct shape was ${SHAPES_CONFIG[targetOptionIdx].name}.`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto bg-art-green hover:bg-art-green/90 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    id="btn-shape-next"
                  >
                    <span>{questionIndex >= 19 ? 'Finish Activity' : 'Next Question'}</span>
                    <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
