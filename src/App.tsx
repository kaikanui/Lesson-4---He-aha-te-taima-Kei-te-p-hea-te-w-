import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Gamepad2, 
  Camera, 
  Clock, 
  Sun, 
  Moon, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { 
  GameTime, 
  getMaoriTime, 
  formatDigitalTime, 
  getRandomTime, 
  generateQuizOptions, 
  DAILY_CHORES, 
  ScheduleTask 
} from './utils/timeHelpers';
import AnalogueClock from './components/AnalogueClock';
import CameraGame from './components/CameraGame';

type GameMode = 'explore' | 'quiz' | 'camera';

export default function App() {
  const [mode, setMode] = useState<GameMode>('camera');
  
  // State for Explore mode
  const [exploreTime, setExploreTime] = useState<GameTime>({
    hour: 9,
    minute: 30,
    isAm: true
  });
  const [activePreset, setActivePreset] = useState<ScheduleTask | null>(
    DAILY_CHORES.find(c => c.hour === 9 && c.minute === 30 && c.isAm === true) || null
  );

  // State for Quiz mode
  const [quizTarget, setQuizTarget] = useState<GameTime | null>(null);
  const [quizOptions, setQuizOptions] = useState<GameTime[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<'success' | 'fail' | null>(null);
  const [selectedQuizIdx, setSelectedQuizIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  // Initialize Quiz targets
  const startNewQuiz = () => {
    const target = getRandomTime();
    setQuizTarget(target);
    setQuizOptions(generateQuizOptions(target));
    setQuizFeedback(null);
    setSelectedQuizIdx(null);
    setMode('quiz');
  };

  const handleSelectQuizOption = (index: number) => {
    if (quizFeedback === 'success') return; // Completed
    
    setSelectedQuizIdx(index);
    const selected = quizOptions[index];
    const isCorrect = 
      selected.hour === quizTarget?.hour && 
      selected.minute === quizTarget?.minute && 
      selected.isAm === quizTarget?.isAm;

    if (isCorrect) {
      setQuizFeedback('success');
      setScore(s => s + 1);
    } else {
      setQuizFeedback('fail');
    }
  };

  // Adjust explorer time manually
  const adjustHour = (amount: number) => {
    setExploreTime(prev => {
      let nextHr = prev.hour + amount;
      if (nextHr > 12) nextHr = 1;
      if (nextHr < 1) nextHr = 12;
      
      // Auto-clear preset highlight if manual changes occur
      setActivePreset(null);
      return { ...prev, hour: nextHr };
    });
  };

  const adjustMinute = (amount: number) => {
    setExploreTime(prev => {
      let nextMin = prev.minute + amount;
      let nextHour = prev.hour;
      
      if (nextMin >= 60) {
        nextMin = 0;
        nextHour = prev.hour === 12 ? 1 : prev.hour + 1;
      } else if (nextMin < 0) {
        nextMin = 55;
        nextHour = prev.hour === 1 ? 12 : prev.hour - 1;
      }
      setActivePreset(null);
      return { ...prev, hour: nextHour, minute: nextMin };
    });
  };

  const toggleAmPm = () => {
    setExploreTime(prev => {
      setActivePreset(null);
      return { ...prev, isAm: !prev.isAm };
    });
  };

  const selectPreset = (chore: ScheduleTask) => {
    setExploreTime({
      hour: chore.hour,
      minute: chore.minute,
      isAm: chore.isAm
    });
    setActivePreset(chore);
  };

  if (mode === 'camera') {
    return <CameraGame onExit={() => setMode('explore')} />;
  }

  return (
    <div className="min-h-screen bg-art-bg text-art-text font-sans p-4 md:p-8" id="root-app-container">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header - Navigation */}
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-art-green/10 pb-6" id="app-header">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-art-green mb-1 flex items-center gap-2">
              He aha te taima?
            </h1>
            <p className="text-xl font-medium opacity-70 italic">Kei te pēhea te wā? • Telling Time in Te Reo Māori</p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="bg-art-orange text-white px-5 py-1.5 rounded-full font-bold text-sm shadow-md rotate-1 mb-1">
              Lesson 4 • Taimi & Schedule
            </div>
            
            <div className="flex bg-white/70 p-1.5 rounded-2xl shadow-sm border border-art-green/20 backdrop-blur-sm">
              <button 
                onClick={() => setMode('explore')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm cursor-pointer ${mode === 'explore' ? 'bg-art-green text-white shadow-md' : 'text-art-green hover:bg-art-green/10'}`}
                id="btn-explore"
              >
                <BookOpen size={16} />
                <span>Tūhura (Explore)</span>
              </button>
              
              <button 
                onClick={startNewQuiz}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm cursor-pointer ${mode === 'quiz' ? 'bg-art-green text-white shadow-md' : 'text-art-green hover:bg-art-green/10'}`}
                id="btn-quiz"
              >
                <Gamepad2 size={16} />
                <span>Kēmu (Game)</span>
              </button>
              
              <button 
                onClick={() => setMode('camera')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm cursor-pointer ${mode === 'camera' ? 'bg-art-green text-white shadow-md' : 'text-art-green hover:bg-art-green/10'}`}
                id="btn-camera"
              >
                <Camera size={16} />
                <span>Ringaringa (Camera Mode)</span>
              </button>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-12 gap-8" id="app-main-layout">
          
          {/* LEFT PANEL: Explore Preset Tasks / Left Instructions */}
          <section className="col-span-12 lg:col-span-4 space-y-6 order-2 lg:order-1">
            
            {mode === 'explore' ? (
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-art-green/15 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-art-green/10">
                  <Calendar className="text-art-orange" size={20} />
                  <h3 className="font-display font-bold text-lg text-art-green uppercase tracking-wide">
                    Tōku Wātaka (My Schedule)
                  </h3>
                </div>
                <p className="text-xs text-art-text/75 leading-relaxed">
                  Select a typical school schedule activity below. Watch the analogue clock update its hands and sunrise/sunset dial, then study the written Te Reo Māori time structure below!
                </p>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                  {DAILY_CHORES.map((chore, idx) => {
                    const isSelected = activePreset?.hour === chore.hour && 
                                       activePreset?.minute === chore.minute && 
                                       activePreset?.isAm === chore.isAm;
                    return (
                      <motion.button
                        key={`${chore.activityMaori}-${idx}`}
                        whileHover={{ x: 4 }}
                        onClick={() => selectPreset(chore)}
                        className={`w-full text-left p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all gap-3 cursor-pointer ${
                          isSelected 
                            ? 'bg-art-green border-art-green text-white shadow-md' 
                            : 'bg-white border-art-green/10 hover:border-art-green/30 text-art-text'
                        }`}
                        id={`preset-chore-${idx}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl bg-art-bg/80 p-1.5 rounded-xl group-hover:bg-white/15 transition-all">
                            {chore.emoji}
                          </span>
                          <div className="min-w-0">
                            <p className="font-black text-sm leading-tight truncate">
                              {chore.activityMaori}
                            </p>
                            <p className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-art-text/60 font-semibold'}`}>
                              {chore.activityEnglish}
                            </p>
                          </div>
                        </div>
                        <div className={`text-right shrink-0 font-mono text-xs font-bold px-2 py-1 rounded-lg ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {chore.timeDigital}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Quiz Game Controls / Stats Panel
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-art-green/15 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2 border-b border-art-green/10 mb-3">
                    <GraduationCap className="text-art-orange" size={20} />
                    <h3 className="font-display font-bold text-lg text-art-green uppercase tracking-wide">
                      Kēmu Taimi (Time Game)
                    </h3>
                  </div>
                  <p className="text-xs text-art-text/75 leading-relaxed">
                    Look closely at the analogue clock in the center. Observe whether the sun is rising (AM) or setting (PM). 
                    Then match it with the correct digital clock and Te Reo Māori translation!
                  </p>
                </div>

                <div className="bg-white/80 p-5 rounded-2xl border border-art-green/10 space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold text-art-green">
                    <span>🎮 MODE:</span>
                    <span className="bg-art-green/10 text-art-green px-3 py-0.5 rounded-xl text-xs uppercase">Multiple Choice</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-art-green">
                    <span>🏆 TOTAL SCORE:</span>
                    <span className="bg-art-gold text-white px-3 py-0.5 rounded-xl text-xs font-black">{score}</span>
                  </div>
                </div>

                <button 
                  onClick={startNewQuiz}
                  className="w-full bg-art-orange hover:bg-art-orange/90 text-white py-4.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  id="reset-quiz-btn"
                >
                  <RotateCcw size={16} />
                  <span>Reset & Try New Time</span>
                </button>
              </div>
            )}

            {/* Curriculum Help Card */}
            <div className="bg-art-green p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
              <h4 className="font-display font-bold text-lg text-yellow-100 mb-3 flex items-center gap-1.5">
                <Sparkles size={18} className="text-yellow-100" />
                Language Tip:
              </h4>
              <ul className="text-xs space-y-2.5 opacity-90 font-medium">
                <li>
                  <strong className="text-yellow-100">Karaka</strong>: Modern Word for Clock or O'clock. (e.g., <span className="italic">Kotahi karaka</span> = 1:00)
                </li>
                <li>
                  <strong className="text-yellow-100">Miniti</strong>: Minutes. (e.g., <span className="italic">e rima miniti</span> = 5 minutes)
                </li>
                <li>
                  <strong className="text-yellow-100">Mai te...</strong>: Used for minutes past the hour. (e.g., <span className="italic">E tekau miniti mai te rua karaka</span> = 10 minutes past 2:00)
                </li>
                <li>
                  <strong className="text-yellow-100">AM vs PM Skies</strong>: The analogue clock shows a golden sunrise sun (AM) or an evening moon with stars (PM). Watch it closely!
                </li>
              </ul>
            </div>
          </section>

          {/* RIGHT PANEL: Clock Render & Selections */}
          <section className="col-span-12 lg:col-span-8 space-y-6 order-1 lg:order-2">
            
            {mode === 'explore' ? (
              // EXPLORE INTERACTION SECTION
              <div className="space-y-6" id="explore-view">
                
                {/* Visual Canvas Container */}
                <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-art-green/15 shadow-xl flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
                  
                  {/* Decorative background sun illustration */}
                  <div className="absolute top-0 right-0 w-52 h-52 bg-[#FEEBC8]/20 rounded-full blur-3xl pointer-events-none" />

                  {/* Dynamic Clock Render */}
                  <div className="shrink-0 relative">
                    <AnalogueClock time={exploreTime} size={250} />
                  </div>

                  {/* Explorer Manual Adjustments */}
                  <div className="flex-1 w-full space-y-5">
                    <div>
                      <span className="bg-art-orange/10 text-art-orange px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase inline-block mb-1.5">
                        Whakatika Taimā • Interactive Adjustment
                      </span>
                      <h3 className="text-2xl font-black text-art-green leading-none mb-1">
                        Adjust & Learn in Real Time
                      </h3>
                      <p className="text-xs text-art-text/60 leading-normal">
                        Click the buttons below to change the time. Observe how the hands position themselves and how the time translates to Te Reo Māori!
                      </p>
                    </div>

                    {/* Quick Button Adjusters */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Hour Controls */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hour Limits:</span>
                        <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/40 gap-1.5">
                          <button 
                            onClick={() => adjustHour(-1)}
                            className="flex-1 bg-white hover:bg-slate-50 text-art-green p-2 rounded-lg font-black text-sm shadow-sm active:scale-95 transition-all text-center block cursor-pointer"
                            id="btn-hour-minus"
                          >
                            -1 Hr
                          </button>
                          <button 
                            onClick={() => adjustHour(1)}
                            className="flex-1 bg-white hover:bg-slate-50 text-art-green p-2 rounded-lg font-black text-sm shadow-sm active:scale-95 transition-all text-center block cursor-pointer"
                            id="btn-hour-plus"
                          >
                            +1 Hr
                          </button>
                        </div>
                      </div>

                      {/* Minute Controls */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Minutes:</span>
                        <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/40 gap-1.5">
                          <button 
                            onClick={() => adjustMinute(-5)}
                            className="flex-1 bg-white hover:bg-slate-50 text-art-green p-2 rounded-lg font-black text-sm shadow-sm active:scale-95 transition-all text-center block cursor-pointer"
                            id="btn-minute-minus"
                          >
                            -5 M
                          </button>
                          <button 
                            onClick={() => adjustMinute(5)}
                            className="flex-1 bg-white hover:bg-slate-50 text-art-green p-2 rounded-lg font-black text-sm shadow-sm active:scale-95 transition-all text-center block cursor-pointer"
                            id="btn-minute-plus"
                          >
                            +5 M
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Toggle AM / PM Shift Shift */}
                    <div className="flex items-center justify-between bg-[#F7FBE7]/50 p-4.5 rounded-2xl border border-art-green/10">
                      <div className="flex items-center gap-2.5">
                        {exploreTime.isAm ? (
                          <Sun className="text-amber-500 fill-amber-100" size={24} />
                        ) : (
                          <Moon className="text-indigo-500 fill-indigo-100" size={24} />
                        )}
                        <div>
                          <p className="text-xs font-black text-art-green">
                            {exploreTime.isAm ? 'Morning Air (AM)' : 'Afternoon/Night (PM)'}
                          </p>
                          <p className="text-[10px] text-art-green/60 font-semibold">
                            {exploreTime.isAm ? 'Tākiri te ata: Sun rising sky background' : 'Tō te rā: Sunset sky background'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={toggleAmPm}
                        className="bg-art-green hover:bg-art-green/90 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                        id="btn-toggle-ampm"
                      >
                        Change to {exploreTime.isAm ? 'PM' : 'AM'}
                      </button>
                    </div>

                  </div>
                </div>

                {/* Big Sentence Builder Translation Area */}
                <section className="bg-art-green shadow-xl relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 text-white">
                  <div className="absolute top-0 right-10 bg-art-orange px-4 py-1 rounded-b-md text-[9px] font-black uppercase tracking-widest shadow-lg">
                    TE REO TRANSLATOR
                  </div>

                  {/* Digital Clock display side-by-side */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] text-yellow-100 tracking-widest font-black uppercase block">
                        Written Māori Translation
                      </span>
                      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
                        {getMaoriTime(exploreTime.hour, exploreTime.minute)}
                      </h2>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15 text-center shrink-0">
                      <span className="text-[9px] text-yellow-100/80 font-black uppercase block tracking-wider mb-0.5">
                        Digital Clock
                      </span>
                      <div className="text-4xl font-mono font-black tracking-wider text-white">
                        {exploreTime.hour.toString().padStart(2, '0')}
                        <span className="animate-pulse">:</span>
                        {exploreTime.minute.toString().padStart(2, '0')}
                        <span className="text-sm font-sans font-bold ml-1 text-yellow-100">
                          {exploreTime.isAm ? 'AM' : 'PM'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* If preset chore is active, show the details of the day task! */}
                  {activePreset && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 pt-5 border-t border-white/15 flex items-start gap-3.5 bg-white/5 p-4 rounded-xl"
                    >
                      <span className="text-4xl shrink-0">{activePreset.emoji}</span>
                      <div>
                        <p className="text-sm font-black text-yellow-100">
                          🎯 Active Activity: {activePreset.activityMaori}
                        </p>
                        <p className="text-xs text-white/80 leading-snug mt-1">
                          In New Zealand schools, representing time in connection with daily school routines helps children learn time and grammar at once. At {activePreset.timeDigital}, it's <strong className="text-white">{activePreset.activityEnglish}</strong>!
                        </p>
                      </div>
                    </motion.div>
                  )}
                </section>
                
              </div>
            ) : (
              // MULTIPLE CHOICE QUIZ GAMEPLAY
              <div className="space-y-6" id="quiz-view">
                
                {quizTarget ? (
                  <div className="space-y-6">
                    
                    {/* Centered Area with Clock Question and layout */}
                    <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-art-green/15 shadow-xl flex flex-col md:flex-row items-center gap-8 md:gap-12 relative">
                      
                      {/* Analogue Question Clock */}
                      <div className="shrink-0 mx-auto">
                        <AnalogueClock time={quizTarget} size={250} />
                      </div>

                      {/* Display Question details */}
                      <div className="flex-1 w-full space-y-4">
                        <span className="bg-art-gold/10 text-art-gold-dark px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase inline-block">
                          🎯 Tāpaetanga • Challenge
                        </span>
                        <h2 className="text-2xl sm:text-3.5xl font-black text-art-green tracking-tight leading-none">
                          He aha te taima o tēnei karaka?
                        </h2>
                        <p className="text-sm text-art-text/60 leading-relaxed">
                          Look closely at the hour hand (shorter, darker) and minute hand (longer, thinner). Also look at the sky! If there is a bright rising sun, it translates to AM. If it is a purplish starry horizon, it's PM. 
                          <br />
                          <br />
                          <strong>Choose the correct matching Digital Time & Māori text below:</strong>
                        </p>
                      </div>

                      {/* Feedback overlays for active answer state */}
                      <AnimatePresence>
                        {quizFeedback && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`absolute inset-0 rounded-[3rem] z-30 flex flex-col items-center justify-center text-center p-6 text-white ${
                              quizFeedback === 'success' ? 'bg-art-green' : 'bg-art-orange'
                            }`}
                          >
                            {quizFeedback === 'success' ? (
                              <>
                                <CheckCircle2 size={72} className="mb-2 animate-bounce" />
                                <h3 className="text-3xl font-black">Ka Rawe! Excellent Work!</h3>
                                <p className="text-sm max-w-md mt-2 opacity-90 italic">
                                  You correctly translated the analogue clock to "{getMaoriTime(quizTarget.hour, quizTarget.minute)}"!
                                </p>
                                <button 
                                  onClick={startNewQuiz}
                                  className="mt-6 bg-white hover:bg-slate-50 text-art-green px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                                  id="next-quiz-btn"
                                >
                                  Next Time Challenge
                                </button>
                              </>
                            ) : (
                              <>
                                <XCircle size={72} className="mb-2 animate-shake" />
                                <h3 className="text-3xl font-black">Kia Mau! Almost there!</h3>
                                <p className="text-sm max-w-md mt-2 opacity-90">
                                  That's incorrect. Remember to watch the hand indicators and check if it has a sunrise (AM) or sunset (PM) sky!
                                </p>
                                <button 
                                  onClick={() => setQuizFeedback(null)}
                                  className="mt-6 bg-white hover:bg-slate-50 text-art-orange px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                                  id="try-again-quiz-btn"
                                >
                                  Try This Again
                                </button>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>

                    {/* Simple Grid Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quizOptions.map((opt, idx) => {
                        const isSelected = selectedQuizIdx === idx;
                        const formatted = formatDigitalTime(opt);
                        const maoriPhrase = getMaoriTime(opt.hour, opt.minute);

                        return (
                          <motion.button
                            key={`${formatted}-${idx}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectQuizOption(idx)}
                            className={`p-5 rounded-2xl border-4 text-left transition-all flex flex-col justify-center relative overflow-hidden cursor-pointer ${
                              isSelected
                                ? quizFeedback === 'success'
                                  ? 'bg-art-green border-art-green text-white'
                                  : 'bg-art-orange border-art-orange text-white'
                                : 'bg-white border-art-green/10 hover:border-art-green/30 text-art-text hover:bg-slate-50/50'
                            }`}
                            id={`quiz-option-${idx}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              {/* Digital time badge */}
                              <div className="font-mono text-xl font-bold tracking-wider flex items-center gap-1">
                                <span className={`px-2 py-0.5 rounded-lg text-sm font-semibold uppercase ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {opt.hour.toString().padStart(2, '0')}:{opt.minute.toString().padStart(2, '0')} {opt.isAm ? 'AM' : 'PM'}
                                </span>
                              </div>
                              
                              <div className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : opt.isAm ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                {opt.isAm ? 'Sunrise • AM' : 'Sunset • PM'}
                              </div>
                            </div>

                            <p className={`font-black text-sm leading-normal ${
                              isSelected ? 'text-white' : 'text-art-green'
                            }`}>
                              {maoriPhrase}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>

                  </div>
                ) : (
                  <div className="p-20 text-center bg-white/50 rounded-3xl border border-dashed border-art-green/20">
                    <p className="font-bold text-art-green">Loading a fun time puzzle...</p>
                  </div>
                )}

              </div>
            )}

            {/* School footer tagline */}
            <footer className="w-full flex justify-between items-center text-[10px] font-black text-art-green/45 uppercase tracking-[0.2em] pt-4">
              <div>Curriculum • Te Reo Lesson 4</div>
              <div className="bg-art-green/10 px-4 py-1 rounded-full">He aha te taima? Kei te pēhea te wā?</div>
              <div>© Te Reo Kete 2026</div>
            </footer>

          </section>

        </main>
        
      </div>
    </div>
  );
}
