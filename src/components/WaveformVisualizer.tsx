import React from 'react';
import { TutorState } from './TutorAvatar';

interface WaveformVisualizerProps {
  state: TutorState;
  audioLevel?: number; // 0 to 1
  barCount?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  state,
  audioLevel = 0,
  barCount = 20,
}) => {
  const bars = Array.from({ length: barCount }, (_, index) => index);
  const isActive = state === 'listening' || state === 'speaking';

  return (
    <div className="flex items-center justify-center gap-1.5 h-10 px-4">
      {bars.map((i) => {
        // Create an organic wave distribution (taller towards the center)
        const centerOffset = Math.abs(i - barCount / 2) / (barCount / 2);
        const centerFactor = 1 - centerOffset * 0.7;

        let heightPercent = 12; // default idle height

        if (state === 'speaking') {
          // Dynamic heights based on audioLevel with wave variation
          const wavePhase = Math.sin((i / barCount) * Math.PI * 4 + Date.now() / 200);
          heightPercent = Math.min(
            100,
            Math.max(15, (audioLevel * 75 + 20) * centerFactor + wavePhase * 15)
          );
        } else if (state === 'listening') {
          // Reactive to mic audio level
          heightPercent = Math.min(
            100,
            Math.max(12, (audioLevel * 85 + 15) * centerFactor)
          );
        } else if (state === 'thinking') {
          // Subtle rhythmic undulating wave
          heightPercent = 16 + Math.sin(i * 0.8 + Date.now() / 300) * 12;
        }

        const barColor =
          state === 'listening'
            ? 'bg-emerald-500'
            : state === 'speaking'
            ? 'bg-indigo-600'
            : state === 'thinking'
            ? 'bg-amber-400'
            : 'bg-slate-300';

        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-75 ease-out ${barColor} ${
              isActive ? 'opacity-90' : 'opacity-40'
            }`}
            style={{
              height: `${Math.max(6, heightPercent)}%`,
              minHeight: '4px',
            }}
          />
        );
      })}
    </div>
  );
};
