import React, { useRef, useEffect } from 'react';
import { Volume2, User, Sparkles } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'tutor' | 'student';
  text: string;
  timestamp: Date;
}

interface TranscriptViewProps {
  messages: ChatMessage[];
  interimStudentSpeech?: string;
  isTutorSpeaking?: boolean;
  isListening?: boolean;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  messages,
  interimStudentSpeech = '',
  isTutorSpeaking = false,
  isListening = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimStudentSpeech]);

  // If there are no messages yet
  if (messages.length === 0 && !interimStudentSpeech) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col transition-all">
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Conversation Transcript</span>
        </div>
        <span className="text-[11px] text-slate-400">
          {messages.length} {messages.length === 1 ? 'exchange' : 'exchanges'}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="max-h-56 sm:max-h-64 overflow-y-auto p-4 space-y-3.5 text-sm scroll-smooth"
      >
        {messages.map((message) => {
          const isTutor = message.role === 'tutor';
          return (
            <div
              key={message.id}
              className={`flex gap-3 items-start ${isTutor ? 'justify-start' : 'justify-end'}`}
            >
              {isTutor && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed ${
                  isTutor
                    ? 'bg-slate-100/90 text-slate-800 rounded-tl-xs'
                    : 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                }`}
              >
                <div className="text-[11px] font-semibold mb-1 opacity-75">
                  {isTutor ? 'Pip (Tutor)' : 'You'}
                </div>
                <div className="whitespace-pre-wrap">{message.text}</div>
              </div>

              {!isTutor && (
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Live interim student speech while microphone is active */}
        {isListening && interimStudentSpeech && (
          <div className="flex gap-3 items-start justify-end">
            <div className="rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed bg-indigo-500/20 text-indigo-900 border border-indigo-200/60 rounded-tr-xs animate-pulse">
              <div className="text-[11px] font-semibold mb-1 text-indigo-700">
                You (speaking...)
              </div>
              <div className="italic">{interimStudentSpeech}</div>
            </div>
            <div className="w-7 h-7 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
