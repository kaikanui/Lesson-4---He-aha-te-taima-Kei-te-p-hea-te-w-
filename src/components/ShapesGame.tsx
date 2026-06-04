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
  Sparkles
} from 'lucide-react';
import { 
  GameTime, 
  getMaoriTime, 
  formatDigitalTime, 
  getRandomTime, 
  generateQuizOptions 
} from '../utils/timeHelpers';

interface ShapesGameProps {
  onExit: () => void;
}

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
  const [questionIndex, setQuestionIndex] = useState(0); // 0 to 19 (total 20 questions)
  const [score, setScore] = useState(0);
  const [targetTime, setTargetTime] = useState<GameTime | null>(null);
  const [options, setOptions] = useState<GameTime[]>([]);
  const [targetOptionIdx, setTargetOptionIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Generate a new question
  const generateNewQuestion = useCallback(() => {
    const correct = getRandomTime();
    setTargetTime(correct);
    
    const quizOptions = generateQuizOptions(correct);
    setOptions(quizOptions);
    
    // Find where the correct answer lies
    const idx = quizOptions.findIndex(
      opt => opt.hour === correct.hour && opt.minute === correct.minute && opt.isAm === correct.isAm
    );
    setTargetOptionIdx(idx);
    
    setSelectedIdx(null);
    setAnswered(false);
  }, []);

  // Initialize first question
  useEffect(() => {
    generateNewQuestion();
  }, [generateNewQuestion]);

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
      generateNewQuestion();
    }
  };

  const handleReset = () => {
    setQuestionIndex(0);
    setScore(0);
    setIsFinished(false);
    generateNewQuestion();
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

  if (isFinished) {
    const badge = getBadgeDetails();
    return (
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-art-green/15 shadow-xl max-w-2xl mx-auto my-8 text-center space-y-8" id="shapes-finished-view">
        <div className="space-y-2">
          <span className="bg-art-gold/15 text-art-gold-dark px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block">
            Māpere Kēmu Whakakapi • Activity Complete
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-art-green leading-tight">
            Ioti te Mahi!
          </h2>
          <p className="text-md text-art-text/60 font-medium italic">You finished all 20 time questions!</p>
        </div>

        {/* Big Score circle */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-art-green/5 border-8 border-dotted border-art-green/20 rounded-full animate-spin [animation-duration:40s]" />
          <div className="absolute inset-3 bg-white rounded-full shadow-lg border-4 border-art-green flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-art-orange uppercase tracking-wider">Tō Kōre (Your Score)</span>
            <span className="text-6xl font-black text-art-green font-mono">{score}</span>
            <span className="text-xs font-bold text-slate-400">/ 20 Pātai</span>
          </div>
          {score >= 15 && (
            <div className="absolute -top-1 -right-1 bg-art-gold text-white p-2.5 rounded-full shadow-lg border-2 border-white animate-bounce">
              <Sparkles size={20} />
            </div>
          )}
        </div>

        {/* Badge Card */}
        <div className={`p-6 rounded-2xl border-2 text-left space-y-2 max-w-md mx-auto ${badge.color}`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{badge.emoji}</span>
            <div>
              <h4 className="font-black text-lg text-art-green">{badge.title}</h4>
              <p className="text-xs text-opacity-90">{badge.desc}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={handleReset}
            className="bg-art-green hover:bg-art-green/90 text-white font-black text-base px-8 py-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            id="btn-shapes-restart"
          >
            <RotateCcw size={18} />
            <span>Tākaro Anō (Play Again)</span>
          </button>
          
          <button
            onClick={onExit}
            className="bg-white hover:bg-slate-50 text-art-green border border-art-green/20 font-black text-base px-8 py-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            id="btn-shapes-exit"
          >
            <span>Exit to Main Hub</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="shapes-game-root">
      
      {/* Top Banner & Stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-art-green/10">
        <div>
          <span className="bg-art-green/10 text-art-green px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase inline-block mb-1">
            Lesson 4 • Kēmu Māpere (Shapes Game)
          </span>
          <h2 className="text-xl md:text-2xl font-black text-art-green">
            Match the Digital Time to the written Te Reo Māori!
          </h2>
        </div>

        {/* Progress Metrics */}
        <div className="flex items-center gap-4">
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

      {/* Main Grid: Left Digital Time, Right Shape Buttons */}
      <div className="grid grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Digital Display (Digital clock + Sky and explanations) */}
        <div className="col-span-12 lg:col-span-5 flex" id="shapes-digital-display-panel">
          {targetTime ? (
            <div className="w-full bg-slate-900 text-white rounded-[2.5rem] border-4 border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between relative">
              
              {/* Sky Background Backdrop Header inside the Digital Clock Box */}
              <div className={`p-6 transition-all duration-1000 flex items-center justify-between border-b border-white/10 ${
                targetTime.isAm 
                  ? 'bg-gradient-to-r from-[#4A7D9D] to-[#fcddb0]' 
                  : 'bg-gradient-to-r from-[#1E114D] to-[#993441]'
              }`}>
                <div>
                  <span className="text-[10px] font-black text-white/90 uppercase tracking-widest bg-black/20 px-2.5 py-0.5 rounded-full backdrop-blur-[2px]">
                    {targetTime.isAm ? 'ATA • AM SKY' : 'AHIAHI • PM SKY'}
                  </span>
                  <div className="text-white font-semibold text-xs mt-1">
                    {targetTime.isAm ? 'Sunrise Golden Rays' : 'Sunset Purplish Horizon'}
                  </div>
                </div>
                <div>
                  {targetTime.isAm ? (
                    <div className="w-10 h-10 rounded-full bg-yellow-200/30 flex items-center justify-center animate-pulse border border-yellow-300/35">
                      <span className="text-yellow-100 font-black">☀️</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-950/40 flex items-center justify-center animate-pulse border border-orange-400/25">
                      <span className="text-orange-200 font-black">🌙</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Central Large Digital Glow Face */}
              <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-[#070B19]/90">
                <p className="text-[10px] font-black text-art-orange uppercase tracking-widest mb-3">READ THE DIGITAL CLOCK:</p>
                
                <div className="font-mono text-5xl sm:text-7xl font-semibold tracking-wider text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2">
                  <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-2xl">
                    {targetTime.hour.toString().padStart(2, '0')}
                  </span>
                  <span className="text-art-orange animate-pulse">:</span>
                  <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-2xl">
                    {targetTime.minute.toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="mt-4 bg-white/10 px-5 py-1.5 rounded-full border border-white/5 font-black text-yellow-100 text-sm tracking-widest inline-block">
                  {targetTime.isAm ? 'MORNING (AM)' : 'AFTERNOON/EVENING (PM)'}
                </div>
              </div>

              {/* Bottom Instructions Info */}
              <div className="p-6 bg-[#030611] text-xs text-white/50 leading-relaxed border-t border-white/5">
                <p className="flex items-center gap-1.5 font-bold text-white/70 mb-1">
                  <HelpCircle size={14} className="text-art-orange" />
                  How to Match:
                </p>
                Study the hours, minutes, and AM/PM time above. Seek the written Te Reo Māori card on the right containing the correct formula! Look for "mai te" for minutes past the hour.
              </div>

            </div>
          ) : (
            <div className="w-full bg-slate-900 rounded-3xl min-h-[300px] flex items-center justify-center">
              <span className="text-white/60 font-medium">Whakarite ana (Loading question...)</span>
            </div>
          )}
        </div>

        {/* Right Column: 4 options with explicit shapes at the top */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-between gap-4" id="shapes-options-grid">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className={`p-5 rounded-3xl text-left border-4 transition-all flex flex-col justify-between relative overflow-hidden h-44 outline-none ${
                    !answered ? 'cursor-pointer hover:bg-slate-50/50 hover:scale-[1.02] active:scale-[0.98]' : 'cursor-default'
                  } ${cardStyle}`}
                  id={`shape-option-${shape.id}`}
                >
                  
                  {/* Top area showing shape configured */}
                  <div className="w-full flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {shape.shapeElement}
                      <span className="font-black text-xs text-slate-500 tracking-wide uppercase">
                        {shape.name}
                      </span>
                    </div>

                    {/* Checkmark icon for correct / wrong answers on completion */}
                    {answered && isCorrectAnswer && (
                      <span className="text-emerald-500 fill-emerald-100">
                        <CheckCircle2 size={24} />
                      </span>
                    )}
                    {answered && isSelected && !isCorrectAnswer && (
                      <span className="text-red-500 fill-red-100">
                        <XCircle size={24} />
                      </span>
                    )}
                  </div>

                  {/* Written Te Reo Māori Option text, generously sized */}
                  <div className="mt-4 flex-1 flex flex-col justify-end">
                    <p className={`font-black text-base leading-snug tracking-tight text-art-green ${
                      answered && isCorrectAnswer ? 'text-emerald-800' : ''
                    }`}>
                      {getMaoriTime(option.hour, option.minute)}
                    </p>
                    
                    {/* Small english translation revealed after selection */}
                    {answered && (
                      <p className="text-[10px] text-slate-500 font-bold italic mt-0.5">
                        ({formatDigitalTime(option)})
                      </p>
                    )}
                  </div>

                </button>
              );
            })}
          </div>

          {/* Feedback & Proceed Block */}
          <div className="h-24 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {answered && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-4.5 bg-white border border-slate-250 shadow-lg rounded-2xl"
                  id="shape-feedback-panel"
                >
                  <div className="flex items-center gap-3">
                    {selectedIdx === targetOptionIdx ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={22} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <XCircle size={22} />
                      </div>
                    )}
                    <div>
                      <p className="font-black text-sm text-art-text">
                        {selectedIdx === targetOptionIdx ? 'Ka Rawe! You got it!' : 'Kia Mau! Keep trying!'}
                      </p>
                      <p className="text-xs text-art-text/60">
                        {selectedIdx === targetOptionIdx 
                          ? `Excellent choice. The digital time corresponds to ${getMaoriTime(targetTime!.hour, targetTime!.minute)}!` 
                          : `The correct written form was the shape at index ${targetOptionIdx + 1}.`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto bg-art-green hover:bg-art-green/90 text-white font-black text-sm px-6 py-3 rounded-xl shadow transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    id="btn-shape-next"
                  >
                    <span>{questionIndex >= 19 ? 'Finish Activity' : 'Pātai Whai Muri (Next Question)'}</span>
                    <ArrowRight size={16} />
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
