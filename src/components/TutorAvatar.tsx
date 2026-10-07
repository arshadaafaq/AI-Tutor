import React, { useEffect, useState } from 'react';

export type TutorState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface TutorAvatarProps {
  state: TutorState;
  audioLevel?: number; // 0.0 to 1.0 (from microphone or tutor speech)
  onInterrupt?: () => void;
}

export const TutorAvatar: React.FC<TutorAvatarProps> = ({
  state,
  audioLevel = 0,
  onInterrupt,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // Natural eye blink interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Compute reactive mouth height and glow based on audio level
  const clampedLevel = Math.min(Math.max(audioLevel, 0), 1);
  const reactiveMouthY = state === 'speaking' ? 8 + clampedLevel * 14 : 6;
  const reactivePulseScale = state === 'speaking' ? 1 + clampedLevel * 0.08 : 1;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Background ambient aura rings */}
      <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
        {/* Glow halo */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 ease-out ${
            state === 'listening'
              ? 'bg-emerald-500/15 ring-2 ring-emerald-500/30 scale-105'
              : state === 'thinking'
              ? 'bg-amber-500/15 ring-2 ring-amber-500/30 animate-pulse'
              : state === 'speaking'
              ? 'bg-indigo-500/20 ring-4 ring-indigo-500/30 scale-110'
              : 'bg-indigo-500/8'
          }`}
          style={{
            transform: state === 'speaking' ? `scale(${1.02 + clampedLevel * 0.15})` : undefined,
          }}
        />

        {/* Listening audio ripple ring */}
        {state === 'listening' && (
          <div
            className="absolute inset-0 rounded-full border border-emerald-400/40 animate-ping opacity-60"
            style={{ animationDuration: '2s' }}
          />
        )}

        {/* Thinking orbital indicator dots */}
        {state === 'thinking' && (
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '6s' }}>
            <div className="w-3 h-3 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 absolute -top-1 left-1/2 -translate-x-1/2" />
            <div className="w-2 h-2 bg-amber-300 rounded-full shadow-md shadow-amber-300/40 absolute top-1/2 -right-1 -translate-y-1/2" />
          </div>
        )}

        {/* Main Character SVG */}
        <div
          className={`relative z-10 transition-transform duration-300 ${
            state === 'thinking' ? 'animate-bounce' : ''
          }`}
          style={{
            transform: `scale(${reactivePulseScale})`,
            animationDuration: state === 'thinking' ? '2.4s' : undefined,
          }}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-52 h-52 sm:w-60 sm:h-60 drop-shadow-xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Defs for gradients and filters */}
            <defs>
              <linearGradient id="bodyGradient" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" /> {/* Indigo 500 */}
                <stop offset="0.6" stopColor="#4F46E5" /> {/* Indigo 600 */}
                <stop offset="1" stopColor="#4338CA" /> {/* Indigo 700 */}
              </linearGradient>

              <linearGradient id="faceGradient" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#F8FAFC" />
              </linearGradient>

              <linearGradient id="earphonesGradient" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>

              <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* Tutor Headphone Band */}
            <path
              d="M 46 95 C 46 45, 154 45, 154 95"
              stroke="#E0E7FF"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />

            {/* Left Earphone Cup */}
            <rect
              x="36"
              y="85"
              width="14"
              height="30"
              rx="7"
              fill={state === 'listening' ? '#10B981' : state === 'speaking' ? '#6366F1' : '#818CF8'}
              className="transition-colors duration-300"
            />
            {/* Right Earphone Cup */}
            <rect
              x="150"
              y="85"
              width="14"
              height="30"
              rx="7"
              fill={state === 'listening' ? '#10B981' : state === 'speaking' ? '#6366F1' : '#818CF8'}
              className="transition-colors duration-300"
            />

            {/* Main Head Base */}
            <circle
              cx="100"
              cy="100"
              r="62"
              fill="url(#bodyGradient)"
              filter="url(#softShadow)"
            />

            {/* Inner Face Screen / Mask */}
            <rect
              x="52"
              y="58"
              width="96"
              height="84"
              rx="38"
              fill="url(#faceGradient)"
            />

            {/* Friendly Cheeks */}
            <ellipse
              cx="68"
              cy="106"
              rx="8"
              ry="5"
              fill="#F472B6"
              opacity="0.45"
            />
            <ellipse
              cx="132"
              cy="106"
              rx="8"
              ry="5"
              fill="#F472B6"
              opacity="0.45"
            />

            {/* Eyes */}
            {isBlinking ? (
              // Blinking state (closed friendly curved slits)
              <g stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round">
                <path d="M 72 94 Q 80 97 88 94" />
                <path d="M 112 94 Q 120 97 128 94" />
              </g>
            ) : state === 'thinking' ? (
              // Thinking state (looking up thoughtfully)
              <g fill="#1E1B4B">
                <circle cx="80" cy="88" r="6" />
                <circle cx="120" cy="88" r="6" />
                {/* Catchlight */}
                <circle cx="82" cy="86" r="2.2" fill="#FFFFFF" />
                <circle cx="122" cy="86" r="2.2" fill="#FFFFFF" />
              </g>
            ) : state === 'listening' ? (
              // Listening state (wide, attentive eyes)
              <g fill="#1E1B4B">
                <circle cx="80" cy="92" r="7.5" />
                <circle cx="120" cy="92" r="7.5" />
                {/* Catchlight */}
                <circle cx="78" cy="89" r="3" fill="#FFFFFF" />
                <circle cx="118" cy="89" r="3" fill="#FFFFFF" />
                <circle cx="83" cy="94" r="1.5" fill="#FFFFFF" opacity="0.8" />
                <circle cx="123" cy="94" r="1.5" fill="#FFFFFF" opacity="0.8" />
              </g>
            ) : (
              // Normal friendly eyes
              <g fill="#1E1B4B">
                <circle cx="80" cy="93" r="6.5" />
                <circle cx="120" cy="93" r="6.5" />
                {/* Catchlight */}
                <circle cx="78" cy="90" r="2.5" fill="#FFFFFF" />
                <circle cx="118" cy="90" r="2.5" fill="#FFFFFF" />
              </g>
            )}

            {/* Cute Eyebrows */}
            {state === 'thinking' ? (
              <g stroke="#4338CA" strokeWidth="2.5" strokeLinecap="round">
                <path d="M 72 82 Q 80 79 88 83" />
                <path d="M 112 80 Q 120 76 128 78" />
              </g>
            ) : state === 'listening' ? (
              <g stroke="#4338CA" strokeWidth="2.5" strokeLinecap="round">
                <path d="M 72 81 Q 80 77 88 81" />
                <path d="M 112 81 Q 120 77 128 81" />
              </g>
            ) : (
              <g stroke="#4338CA" strokeWidth="2" strokeLinecap="round">
                <path d="M 74 83 Q 80 81 86 83" />
                <path d="M 114 83 Q 120 81 126 83" />
              </g>
            )}

            {/* Mouth */}
            {state === 'speaking' ? (
              // Speaking animated mouth: expands vertically with speech audio level
              <g>
                <path
                  d={`M 88 112 Q 100 ${112 + reactiveMouthY} 112 112 Q 100 ${112 - 3} 88 112 Z`}
                  fill="#E11D48"
                />
                {/* Teeth highlight */}
                <path
                  d="M 92 112 Q 100 114 108 112"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            ) : state === 'listening' ? (
              // Attentive small smile
              <path
                d="M 92 113 Q 100 118 108 113"
                stroke="#1E1B4B"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : state === 'thinking' ? (
              // Contemplative rounded mouth
              <circle cx="100" cy="114" r="3.5" fill="#1E1B4B" />
            ) : (
              // Warm welcoming smile
              <path
                d="M 90 111 Q 100 120 110 111"
                stroke="#1E1B4B"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
            )}

            {/* Little Teacher Bowtie / Accent */}
            <polygon
              points="94,158 106,158 100,163"
              fill="#F59E0B"
            />
            <circle cx="100" cy="160" r="2.5" fill="#D97706" />
          </svg>
        </div>
      </div>

      {/* State Badge and Description */}
      <div className="mt-4 flex flex-col items-center gap-1.5 text-center">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              state === 'listening'
                ? 'bg-emerald-500 animate-pulse'
                : state === 'thinking'
                ? 'bg-amber-500 animate-spin'
                : state === 'speaking'
                ? 'bg-indigo-600 animate-pulse'
                : 'bg-slate-400'
            }`}
          />
          <span className="text-sm font-semibold tracking-wide text-slate-800">
            {state === 'listening' && 'Listening to you...'}
            {state === 'thinking' && 'Thinking about the best way to explain...'}
            {state === 'speaking' && 'Pip is speaking'}
            {state === 'idle' && 'Pip is ready to chat'}
          </span>
        </div>

        {/* If tutor is currently speaking, provide an explicit one-tap Interrupt button right here */}
        {state === 'speaking' && onInterrupt && (
          <button
            onClick={onInterrupt}
            className="mt-1 text-xs font-medium text-slate-500 hover:text-rose-600 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Tap to interrupt tutor
          </button>
        )}
      </div>
    </div>
  );
};
