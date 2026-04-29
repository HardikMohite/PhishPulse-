/**
 * CompletionScreen (Teaching View)
 * 3-step concept cards + interactive quiz pulled from levels.json teaching_steps.
 * Fully data-driven — no hardcoded content anywhere.
 * Step 1: Concept card (purple accent)
 * Step 2: Comparison card (green vs red)
 * Step 3: Quiz (correct = proceed, wrong = retry)
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Link2,
  Shield,
  Mail,
  Paperclip,
  Lock,
  Target,
  Eye,
  AlertOctagon,
  Trophy,
  Terminal,
} from 'lucide-react';
import type { TeachingStep, LevelWithTeaching } from '../types/vault01.types';

// Icon resolver — maps icon_hint string from JSON to a Lucide component
const ICON_MAP: Record<string, React.ElementType> = {
  clock: Clock, link: Link2, shield: Shield, mail: Mail,
  paperclip: Paperclip, lock: Lock, target: Target,
  eye: Eye, alert: AlertOctagon, trophy: Trophy,
};

interface TeachingViewProps {
  level: LevelWithTeaching;
  teachingStep: number;       // 1 | 2 | 3
  quizAnswered: string | null;
  onStepChange: (step: number) => void;
  onQuizAnswer: (optionId: string) => void;
  onStartSimulation: () => void;
  onBack: () => void;
  keyInsight: string;
}

export default function TeachingView({
  level,
  teachingStep,
  quizAnswered,
  onStepChange,
  onQuizAnswer,
  onStartSimulation,
  onBack,
  keyInsight,
}: TeachingViewProps) {
  const steps = level.teaching_steps ?? [];
  const currentStep: TeachingStep | undefined = steps.find((s) => s.step === teachingStep);

  if (!currentStep) return null;

  const correctOption = currentStep.quiz_options?.find((o) => o.is_correct);
  const quizPassed = quizAnswered === correctOption?.id;

  return (
    <main className="relative z-10 flex flex-col justify-start min-h-0 px-4 py-8 max-w-6xl mx-auto w-full space-y-8">

      {/* Progress tracker bar */}
      <div className="w-full bg-[#0f172a]/80 backdrop-blur-xl rounded-2xl px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/5">
        <div className="flex items-center gap-3 sm:gap-6 text-[10px] font-black tracking-widest uppercase">
          <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] border-b-2 border-cyan-400 pb-1">[ LEARN ]</span>
          <span className="text-white/30">→</span>
          <span className="text-white/30">[ SIMULATE ]</span>
          <span className="text-white/30">→</span>
          <span className="text-white/30">[ RESULTS ]</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className={`w-2.5 h-2.5 rounded-full transition-colors ${
              step < teachingStep ? 'bg-cyan-400' :
              step === teachingStep ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse' :
              'bg-transparent border border-white/20'
            }`} />
          ))}
        </div>
      </div>

      {/* Step card */}
      <div key={teachingStep} className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={teachingStep}
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
            transition={{ duration: 0.35 }}
          >
            {/* ── Step 1: Concept ─────────────────────────────────────── */}
            {currentStep.type === 'concept' && (
              <div className="w-full bg-[#0f172a]/80 backdrop-blur-xl rounded-[2rem] border-l-4 border-l-purple-500 border-t border-r border-b border-white/10 p-8 md:p-12 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-32 bg-purple-500/10 blur-[100px] pointer-events-none" />
                <div className="flex flex-col gap-2 relative z-10">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-purple-400">
                    {currentStep.subtitle}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                    {currentStep.title}
                  </h1>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 relative z-10">
                  <div className="w-24 h-24 shrink-0 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
                    {(() => {
                      const Icon = ICON_MAP[currentStep.icon_hint ?? 'shield'] ?? Shield;
                      return <Icon className="w-12 h-12 text-purple-400 animate-pulse" />;
                    })()}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-white/80 leading-relaxed font-medium">{currentStep.body}</p>
                    {currentStep.analogy && (
                      <p className="text-sm text-purple-300 italic border-l-2 border-purple-500/40 pl-3 leading-relaxed">
                        "{currentStep.analogy}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Comparison ──────────────────────────────────── */}
            {currentStep.type === 'comparison' && (
              <div className="w-full bg-[#0f172a]/80 backdrop-blur-xl rounded-[2rem] border-t-2 border-t-cyan-400 border-l border-r border-b border-white/10 p-8 md:p-12 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-400/10 blur-[100px] pointer-events-none" />
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">
                    {currentStep.subtitle}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                    {currentStep.title}
                  </h1>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {/* Legitimate */}
                  <div className="bg-white/5 border-2 border-green-500/30 rounded-2xl p-4 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-green-500" />
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-bold text-green-400 uppercase tracking-widest">Legitimate</span>
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 text-xs text-white/80 font-medium leading-relaxed border border-white/5 h-full">
                      "{currentStep.legitimate_example}"
                    </div>
                  </div>
                  {/* Phishing */}
                  <div className="bg-red-500/5 border-2 border-red-500/40 rounded-2xl p-4 flex flex-col shadow-[0_0_20px_rgba(239,68,68,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <span className="text-sm font-bold text-red-400 uppercase tracking-widest">Phishing</span>
                    </div>
                    <div className="bg-[#1A0A0A] rounded-xl p-3 text-xs text-white/80 font-medium leading-relaxed border border-red-500/20 h-full">
                      "{currentStep.phishing_example}"
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Quiz ────────────────────────────────────────── */}
            {currentStep.type === 'quiz' && (
              <div className="w-full bg-[#151525] border border-white/20 rounded-[2rem] p-8 md:p-12 flex flex-col gap-4 relative overflow-hidden">
                <div className="flex flex-col gap-2 text-center md:text-left">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">
                    {currentStep.subtitle}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                    {currentStep.quiz_question}
                  </h1>
                </div>

                <div className="grid gap-3">
                  {currentStep.quiz_options?.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => onQuizAnswer(option.id)}
                      disabled={quizAnswered !== null}
                      className={`text-left p-3 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        quizAnswered === option.id
                          ? option.is_correct
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-red-500 bg-red-500/10 text-red-400'
                          : quizAnswered !== null
                          ? option.is_correct
                            ? 'border-green-500/50 bg-green-500/5 text-green-400/50'
                            : 'border-white/5 bg-white/5 text-white/30 opacity-50'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/80'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-black/40 ${
                          quizAnswered === option.id
                            ? option.is_correct ? 'text-green-400' : 'text-red-400'
                            : 'text-white/50'
                        }`}
                      >
                        {option.id}
                      </span>
                      <span className="font-medium flex-1">{option.text}</span>
                      {quizAnswered === option.id && option.is_correct && (
                        <CheckCircle2 className="w-6 h-6 ml-auto text-green-400 shrink-0" />
                      )}
                      {quizAnswered === option.id && !option.is_correct && (
                        <AlertTriangle className="w-6 h-6 ml-auto text-red-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Quiz feedback */}
                <AnimatePresence>
                  {quizAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`p-4 rounded-xl flex items-start gap-4 ${
                        quizPassed
                          ? 'bg-green-500/10 border border-green-500/20 text-green-100'
                          : 'bg-red-500/10 border border-red-500/20 text-red-100'
                      }`}
                    >
                      {quizPassed ? (
                        <>
                          <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-green-400 mb-1 uppercase tracking-widest text-[10px]">Correct!</div>
                            <p className="text-sm font-medium">{currentStep.correct_explanation}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-red-400 mb-1 uppercase tracking-widest text-[10px]">Incorrect</div>
                            <p className="text-sm font-medium mb-3">{currentStep.incorrect_explanation}</p>
                            <button
                              onClick={() => onQuizAnswer('')}
                              className="text-[10px] uppercase font-bold tracking-widest bg-black/40 hover:bg-black/60 px-4 py-2 rounded-lg border border-red-500/30 transition-colors"
                            >
                              Try Again
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Key insight bar — shown on steps 1 and 2 */}
        {currentStep.type !== 'quiz' && (
          <div className="mt-4 bg-gradient-to-r from-cyan-400/10 to-transparent border-l-4 border-cyan-400 p-3 rounded-r-xl flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
            <span className="text-cyan-400 font-black uppercase text-[10px] tracking-widest whitespace-nowrap">
              Key Insight:
            </span>
            <span className="text-xs font-medium text-white/90">{keyInsight}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto pt-4">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => onStepChange(Math.max(1, teachingStep - 1))}
            disabled={teachingStep === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-cyan-400 text-cyan-400 font-black text-xs uppercase tracking-widest bg-transparent hover:bg-cyan-400/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <span className="text-xl font-black text-white font-mono tracking-widest">
            {teachingStep} / {steps.length}
          </span>

          <button
            onClick={() => onStepChange(Math.min(steps.length, teachingStep + 1))}
            disabled={currentStep.type === 'quiz' && !quizPassed}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-cyan-400 text-cyan-400 font-black text-xs uppercase tracking-widest bg-transparent hover:bg-cyan-400/10 transition-all disabled:opacity-30"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Start simulation button — only when quiz is passed on step 3 */}
        {currentStep.type === 'quiz' && quizPassed && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onStartSimulation}
            className="flex items-center gap-2 px-8 py-3.5 border-2 border-cyan-400 text-cyan-400 font-black uppercase tracking-tighter rounded-xl bg-transparent hover:bg-cyan-400/10 transition-all text-sm shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Terminal className="w-4 h-4" /> Start Simulation
          </motion.button>
        )}
      </div>
    </main>
  );
}