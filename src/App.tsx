import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Send,
  Volume2,
  Sparkles,
  AlertCircle,
  Tv,
} from 'lucide-react';
import { TutorAvatar } from './components/TutorAvatar';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { TranscriptView } from './components/TranscriptView';
import { ThreeBlueOneBrownBoard } from './components/ThreeBlueOneBrownBoard';
import { useTutorSession } from './hooks/useTutorSession';

const SAMPLE_QUESTIONS = [
  'How does the DNA double helix store genetic code?',
  'How does a rainwater harvesting system work?',
  'How does photosynthesis convert light and water into glucose?',
  'How does a neural network recognize handwritten digits?',
  'How does gravity shape planetary orbits around a sun?',
  'What is a matrix transformation in linear algebra?',
  'Explain calculus derivatives and Riemann integration',
];

export default function App() {
  const {
    tutorState,
    messages,
    visualScene,
    setVisualSceneStep,
    audioLevel,
    interimTranscript,
    isSessionStarted,
    selectedVoice,
    setSelectedVoice,
    errorMessage,
    setErrorMessage,
    startSession,
    interruptTutor,
    toggleListening,
    submitStudentMessage,
  } = useTutorSession();

  const [textInput, setTextInput] = useState('');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    submitStudentMessage(textInput);
    setTextInput('');
  };

  const handleQuickQuestion = (question: string) => {
    if (!isSessionStarted) {
      startSession();
      setTimeout(() => {
        submitStudentMessage(question);
      }, 300);
    } else {
      submitStudentMessage(question);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">
                Pip & 3B1B Visual Studio
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                AI Tutor + Visuals
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive 3Blue1Brown-style mathematical explanations
            </p>
          </div>
        </div>

        {/* Voice Selector */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-300 shadow-2xs transition-all cursor-pointer"
            title="Configure Tutor Voice"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Voice: {selectedVoice}</span>
          </button>

          {showVoiceSettings && (
            <div className="absolute right-0 top-11 z-50 w-52 bg-slate-900 rounded-xl shadow-xl border border-slate-800 p-2 text-xs">
              <div className="font-semibold text-slate-300 px-2 py-1 mb-1">
                Tutor Voice Style
              </div>
              <button
                onClick={() => {
                  setSelectedVoice('Kore');
                  setShowVoiceSettings(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                  selectedVoice === 'Kore'
                    ? 'bg-cyan-950 text-cyan-400 font-medium border border-cyan-800'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>Kore (Warm & Encouraging)</span>
              </button>
              <button
                onClick={() => {
                  setSelectedVoice('Puck');
                  setShowVoiceSettings(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                  selectedVoice === 'Puck'
                    ? 'bg-cyan-950 text-cyan-400 font-medium border border-cyan-800'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>Puck (Upbeat & Friendly)</span>
              </button>
              <button
                onClick={() => {
                  setSelectedVoice('Zephyr');
                  setShowVoiceSettings(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                  selectedVoice === 'Zephyr'
                    ? 'bg-cyan-950 text-cyan-400 font-medium border border-cyan-800'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>Zephyr (Calm & Clear)</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6 flex-1 flex flex-col items-center justify-center gap-6">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="w-full max-w-xl bg-rose-950/70 border border-rose-800 text-rose-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-semibold underline ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {!isSessionStarted ? (
          /* Welcome Stage */
          <div className="flex flex-col items-center text-center max-w-lg space-y-6 py-8">
            <TutorAvatar state="idle" />

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Learn with 3Blue1Brown Visuals
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pip explains concepts using simple analogies, real-world intuition, and glowing 3Blue1Brown mathematical chalkboard animations.
              </p>
            </div>

            <button
              onClick={startSession}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm"
            >
              <Tv className="w-4 h-4" />
              <span>Start Visual Learning Session</span>
            </button>

            <div className="pt-2">
              <p className="text-xs font-medium text-slate-500 mb-2.5">
                Or pick a 3B1B topic to explore immediately:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs bg-slate-900 hover:bg-slate-800 hover:text-cyan-400 border border-slate-800 hover:border-cyan-800/80 px-3 py-2 rounded-xl text-slate-300 transition-colors cursor-pointer text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Interactive Visual Blackboard + Tutor Session */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Columns: 3Blue1Brown Interactive Visual Board */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {visualScene && (
                <ThreeBlueOneBrownBoard
                  scene={visualScene}
                  onStepChange={setVisualSceneStep}
                  onAskTutorAboutScene={(prompt) => submitStudentMessage(prompt)}
                />
              )}

              {/* Minimal Transcript Area */}
              <div className="w-full">
                <TranscriptView
                  messages={messages}
                  interimStudentSpeech={interimTranscript}
                  isTutorSpeaking={tutorState === 'speaking'}
                  isListening={tutorState === 'listening'}
                />
              </div>
            </div>

            {/* Right 4 Columns: Companion Tutor Character */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60 space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Your Personal Mentor</span>
              </div>

              {/* Tutor Character Avatar */}
              <TutorAvatar
                state={tutorState}
                audioLevel={audioLevel}
                onInterrupt={interruptTutor}
              />

              {/* Audio Waveform */}
              <div className="w-full max-w-xs">
                <WaveformVisualizer
                  state={tutorState}
                  audioLevel={audioLevel}
                  barCount={20}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Voice & Interaction Bar */}
      <footer className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2 border-t border-slate-800/60">
        {isSessionStarted && (
          <div className="space-y-3">
            {/* Voice Control Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleListening}
                className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-lg cursor-pointer ${
                  tutorState === 'listening'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 ring-rose-500/30 scale-105 animate-pulse'
                    : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white hover:scale-105 shadow-cyan-500/20'
                }`}
                title={tutorState === 'listening' ? 'Stop listening' : 'Talk to Pip'}
                aria-label={tutorState === 'listening' ? 'Stop listening' : 'Talk to Pip'}
              >
                {tutorState === 'listening' ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>

              {tutorState === 'speaking' && (
                <button
                  onClick={interruptTutor}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-102 cursor-pointer border border-slate-700"
                  title="Interrupt tutor"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Interrupt</span>
                </button>
              )}
            </div>

            {/* Helper Status Notice */}
            <div className="text-center text-xs text-slate-400 font-medium">
              {tutorState === 'listening'
                ? 'Listening to you... Tap the red mic when you are finished.'
                : tutorState === 'speaking'
                ? 'Pip is explaining. You can tap Interrupt or speak at any time.'
                : tutorState === 'thinking'
                ? 'Generating 3B1B visual blueprint and explanation...'
                : 'Tap the mic to talk with Pip, or type your question below.'}
            </div>

            {/* Text Input Companion */}
            <form onSubmit={handleSendText} className="relative flex items-center">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ask about any math, AI, physics or CS concept to visualize..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl py-3 pl-4 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-inner"
                disabled={tutorState === 'thinking'}
              />
              <button
                type="submit"
                disabled={!textInput.trim() || tutorState === 'thinking'}
                className="absolute right-2 p-2 rounded-xl text-slate-400 hover:text-cyan-400 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Topic Chips */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 text-[11px] text-slate-400">
              <span className="opacity-70">Try visualizing:</span>
              <button
                onClick={() => submitStudentMessage('Explain how neural network weights and biases work')}
                className="hover:text-cyan-400 underline underline-offset-2 transition-colors cursor-pointer"
              >
                "Neural network weights"
              </button>
              <span>·</span>
              <button
                onClick={() => submitStudentMessage('What is a matrix transformation in linear algebra?')}
                className="hover:text-cyan-400 underline underline-offset-2 transition-colors cursor-pointer"
              >
                "Matrix transformations"
              </button>
              <span>·</span>
              <button
                onClick={() => submitStudentMessage('Explain calculus derivatives and slopes')}
                className="hover:text-cyan-400 underline underline-offset-2 transition-colors cursor-pointer"
              >
                "Calculus derivatives"
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
