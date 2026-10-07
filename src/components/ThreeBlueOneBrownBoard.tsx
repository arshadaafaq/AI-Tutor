import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Sliders,
  Sun,
  Activity,
  Maximize2,
} from 'lucide-react';
import { VisualScene } from '../types/visuals';

interface ThreeBlueOneBrownBoardProps {
  scene: VisualScene;
  onAskTutorAboutScene?: (prompt: string) => void;
  onStepChange?: (stepIndex: number) => void;
}

export const ThreeBlueOneBrownBoard: React.FC<ThreeBlueOneBrownBoardProps> = ({
  scene,
  onAskTutorAboutScene,
  onStepChange,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(scene.currentStepIndex || 0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animTime, setAnimTime] = useState<number>(0);
  const [customParam, setCustomParam] = useState<number>(0.5); // general scrub param t in [0, 1]
  const [selectedDigit, setSelectedDigit] = useState<number>(3); // for neural network demo

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentStep(scene.currentStepIndex || 0);
  }, [scene]);

  // Main animation clock loop
  useEffect(() => {
    let lastTime = performance.now();
    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      if (isPlaying) {
        setAnimTime((prev) => prev + delta);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Render 3Blue1Brown Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear with 3B1B signature deep dark chalkboard color
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    // Subtle 3B1B coordinate grid background
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    ctx.beginPath();
    for (let x = 0; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Route to appropriate advanced 3B1B renderer
    if (scene.type === 'dna_genetics') {
      renderDnaDoubleHelix(ctx, width, height, animTime, customParam);
    } else if (scene.type === 'water_rainwater_system') {
      renderRainwaterHarvestingSystem(ctx, width, height, animTime, customParam);
    } else if (scene.type === 'photosynthesis_bio') {
      renderPhotosynthesisSimulation(ctx, width, height, animTime, customParam);
    } else if (scene.type === 'neural_network') {
      renderNeuralNetworkChapter1(ctx, width, height, animTime, customParam, selectedDigit);
    } else if (scene.type === 'orbital_gravity') {
      renderOrbitalGravityWell(ctx, width, height, animTime, customParam);
    } else if (scene.type === 'calculus_riemann') {
      renderCalculusRiemann(ctx, width, height, animTime, customParam);
    } else if (scene.type === 'vector_transform') {
      renderVectorTransform(ctx, width, height, animTime, customParam);
    } else if (scene.type === 'fourier_waves') {
      renderFourierEpicycles(ctx, width, height, animTime, customParam);
    } else if (scene.type === 'atom_chemistry') {
      renderAtomChemistry(ctx, width, height, animTime, customParam);
    } else if (scene.type === 'circuit_electronics') {
      renderCircuitElectronics(ctx, width, height, animTime, customParam);
    } else {
      renderDynamicCustomDiagram(ctx, width, height, scene, animTime, currentStep, customParam);
    }
  }, [scene, animTime, customParam, currentStep, selectedDigit]);

  const handleStepPrev = () => {
    if (currentStep > 0) {
      const next = currentStep - 1;
      setCurrentStep(next);
      onStepChange?.(next);
    }
  };

  const handleStepNext = () => {
    if (currentStep < scene.steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onStepChange?.(next);
    }
  };

  return (
    <div className="w-full bg-[#0d121f] rounded-2xl border border-slate-800/90 shadow-2xl overflow-hidden flex flex-col text-slate-200 select-none">
      {/* Top Blackboard Header */}
      <div className="px-4 py-3 bg-[#111726] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            3B1B Visual Studio
          </span>
          <span className="text-slate-600">·</span>
          <h3 className="text-sm font-semibold text-white tracking-tight truncate max-w-[280px] sm:max-w-md">
            {scene.title}
          </h3>
        </div>

        {/* Math Formula / Chemical Equation Badge */}
        {scene.formula && (
          <div className="hidden md:flex items-center px-3 py-1 rounded-md bg-slate-900/90 border border-slate-700/70 text-xs font-mono text-amber-300 shadow-inner">
            {scene.formula}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isPlaying ? 'Pause simulation' : 'Play simulation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              setAnimTime(0);
              setCustomParam(0.5);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Reset simulation parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2.1/1] max-h-[440px] bg-[#0b0f19] overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={900}
          height={440}
          className="w-full h-full object-contain"
        />

        {/* If Neural Network mode: show digit test selector */}
        {scene.type === 'neural_network' && (
          <div className="absolute top-3 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 font-mono mr-1">Test Digit:</span>
            {[0, 1, 2, 3, 4, 7, 8].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDigit(d)}
                className={`w-6 h-6 rounded-md font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedDigit === d
                    ? 'bg-cyan-500 text-black shadow-sm shadow-cyan-400 scale-105'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* Mobile floating equation badge */}
        {scene.formula && (
          <div className="md:hidden absolute top-3 right-4 px-2.5 py-1 rounded bg-black/70 backdrop-blur-xs border border-slate-800 text-[11px] font-mono text-amber-300 truncate max-w-[200px]">
            {scene.formula}
          </div>
        )}

        {/* Bottom Interactive Parameter Scrub Slider */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs shadow-lg">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-semibold shrink-0 text-xs">
            <Sliders className="w-3.5 h-3.5" />
            <span>t = {customParam.toFixed(2)}</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={customParam}
            onChange={(e) => setCustomParam(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <span className="text-[11px] text-slate-400 shrink-0 hidden sm:inline">
            {scene.type === 'dna_genetics'
              ? 'Helicase Unwinding & Replication'
              : scene.type === 'water_rainwater_system'
              ? 'Rainfall Intensity & Inflow'
              : scene.type === 'photosynthesis_bio'
              ? 'Light Intensity & Electron Flow'
              : scene.type === 'neural_network'
              ? 'Forward Propagation Flow'
              : scene.type === 'orbital_gravity'
              ? 'Orbital Velocity'
              : scene.type === 'calculus_riemann'
              ? 'Partition Resolution (N Rectangles)'
              : scene.type === 'vector_transform'
              ? 'Matrix Transformation Interpolation'
              : scene.type === 'atom_chemistry'
              ? 'Electron Shell Transition'
              : scene.type === 'circuit_electronics'
              ? 'Current Drift Velocity'
              : 'Interactive Parameter'}
          </span>
        </div>
      </div>

      {/* Bottom Step Timeline & Insight Walkthrough */}
      <div className="p-4 bg-[#0e1322] border-t border-slate-800/80 flex flex-col gap-3">
        {/* Caption & Key Intuition */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>3B1B Core Intuition</span>
            </div>
            <p className="text-sm font-medium text-slate-100 leading-snug">
              {scene.caption}
            </p>
          </div>

          {onAskTutorAboutScene && (
            <button
              onClick={() =>
                onAskTutorAboutScene(
                  `Can you explain step ${currentStep + 1} of this "${scene.title}" 3B1B visualization in simple terms?`
                )
              }
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/70 text-xs font-medium text-cyan-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ask Pip about this</span>
            </button>
          )}
        </div>

        {/* Step Progress Tracker */}
        {scene.steps && scene.steps.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                Step {currentStep + 1} of {scene.steps.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleStepPrev}
                  disabled={currentStep === 0}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleStepNext}
                  disabled={currentStep === scene.steps.length - 1}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Current Step Description Card */}
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-cyan-200 font-sans leading-relaxed">
              <span className="font-semibold text-cyan-400 mr-2">
                [{currentStep + 1}]
              </span>
              {scene.steps[currentStep]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   ADVANCED 3BLUE1BROWN MATHEMATICAL & SCIENTIFIC VISUAL RENDERERS
   ========================================================================= */

/**
 * 0A. DNA DOUBLE HELIX & MOLECULAR GENETICS
 * Renders rotating 3D double helix, complementary base pairs A-T (2 H-bonds) and G-C (3 H-bonds),
 * sugar-phosphate backbones, unzipping replication fork with helicase, and genetics sequence readout.
 */
function renderDnaDoubleHelix(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  param: number
) {
  const centerY = h / 2 + 10;
  const startX = 60;
  const endX = w - 240;
  const rungCount = 20;
  const spacingX = (endX - startX) / (rungCount - 1);
  const helixRadius = 55;

  const forkThresholdIndex = Math.floor(rungCount * (1 - param * 0.75));

  const baseSequence = [
    { name1: 'A', name2: 'T', col1: '#00e5ff', col2: '#ffd166', bonds: 2 },
    { name1: 'G', name2: 'C', col1: '#f43f5e', col2: '#10b981', bonds: 3 },
    { name1: 'T', name2: 'A', col1: '#ffd166', col2: '#00e5ff', bonds: 2 },
    { name1: 'C', name2: 'G', col1: '#10b981', col2: '#f43f5e', bonds: 3 },
    { name1: 'A', name2: 'T', col1: '#00e5ff', col2: '#ffd166', bonds: 2 },
    { name1: 'C', name2: 'G', col1: '#10b981', col2: '#f43f5e', bonds: 3 },
  ];

  interface HelixNode {
    x: number;
    y1: number;
    y2: number;
    z1: number;
    z2: number;
    base: (typeof baseSequence)[0];
    unwound: boolean;
  }

  const nodes: HelixNode[] = [];

  for (let i = 0; i < rungCount; i++) {
    const x = startX + i * spacingX;
    const angle = i * 0.45 - time * 1.5;
    const isUnwound = i >= forkThresholdIndex && param > 0.15;
    const separation = isUnwound ? (i - forkThresholdIndex + 1) * 8 * param : 0;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const y1 = centerY + cosA * helixRadius - separation;
    const y2 = centerY - cosA * helixRadius + separation;
    const z1 = sinA * helixRadius;
    const z2 = -sinA * helixRadius;

    const base = baseSequence[i % baseSequence.length];
    nodes.push({ x, y1, y2, z1, z2, base, unwound: isUnwound });
  }

  // Draw Sequence Ribbon at top
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  roundRect(ctx, 50, 18, endX - 30, 32, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'left';
  ctx.fillText("5' ➔", 60, 38);
  ctx.fillText("3'", endX + 8, 38);

  nodes.forEach((n) => {
    ctx.fillStyle = n.base.col1;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(n.base.name1, n.x, 38);
  });

  // Draw Base Pair Rungs
  nodes.forEach((n) => {
    if (!n.unwound) {
      const midX = n.x;
      const midY = (n.y1 + n.y2) / 2;

      ctx.strokeStyle = n.base.col1;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(n.x, n.y1);
      ctx.lineTo(midX, midY - 3);
      ctx.stroke();

      ctx.strokeStyle = n.base.col2;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(midX, midY + 3);
      ctx.lineTo(n.x, n.y2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(midX, midY - 4);
      ctx.lineTo(midX, midY + 4);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = n.base.col1;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(n.x, n.y1);
      ctx.lineTo(n.x, n.y1 + 18);
      ctx.stroke();

      ctx.strokeStyle = n.base.col2;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(n.x, n.y2);
      ctx.lineTo(n.x, n.y2 - 18);
      ctx.stroke();
    }
  });

  // Draw Two Continuous Glowing Sugar-Phosphate Backbones
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < nodes.length; i++) {
    if (i === 0) ctx.moveTo(nodes[i].x, nodes[i].y1);
    else {
      const xc = (nodes[i].x + nodes[i - 1].x) / 2;
      const yc = (nodes[i].y1 + nodes[i - 1].y1) / 2;
      ctx.quadraticCurveTo(nodes[i - 1].x, nodes[i - 1].y1, xc, yc);
    }
  }
  ctx.stroke();

  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < nodes.length; i++) {
    if (i === 0) ctx.moveTo(nodes[i].x, nodes[i].y2);
    else {
      const xc = (nodes[i].x + nodes[i - 1].x) / 2;
      const yc = (nodes[i].y2 + nodes[i - 1].y2) / 2;
      ctx.quadraticCurveTo(nodes[i - 1].x, nodes[i - 1].y2, xc, yc);
    }
  }
  ctx.stroke();

  nodes.forEach((n) => {
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(n.x, n.y1, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(n.x, n.y2, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Helicase Enzyme unzipping wedge
  if (param > 0.15 && forkThresholdIndex < rungCount) {
    const forkX = nodes[forkThresholdIndex]?.x || 380;
    ctx.fillStyle = '#ffd166';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(forkX - 12, centerY - 25);
    ctx.lineTo(forkX + 16, centerY);
    ctx.lineTo(forkX - 12, centerY + 25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0b0f19';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HELICASE', forkX - 2, centerY + 3);
  }

  // Right Side: Molecular Genetics Dashboard
  const dashX = w - 210;
  const dashY = 40;
  const dashW = 180;
  const dashH = 280;

  ctx.fillStyle = '#111726';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  roundRect(ctx, dashX, dashY, dashW, dashH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MOLECULAR GENETICS', dashX + dashW / 2, dashY + 22);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Helix Pitch: 3.4 nm', dashX + 16, dashY + 55);
  ctx.fillText('Diameter: 2.0 nm', dashX + 16, dashY + 80);
  ctx.fillText('Base pairs/turn: 10.5 bp', dashX + 16, dashY + 105);

  ctx.fillStyle = '#00e5ff';
  ctx.fillText('■ A (Adenine) ═ T (Thymine)', dashX + 16, dashY + 135);
  ctx.fillStyle = '#10b981';
  ctx.fillText('■ C (Cytosine) ≡ G (Guanine)', dashX + 16, dashY + 160);

  renderMetricBar(ctx, dashX + 16, dashY + 185, 'Helicase Unwind', param, '#ffd166');
  renderMetricBar(ctx, dashX + 16, dashY + 230, 'H-Bond Stability', 1 - param * 0.7, '#00e5ff');
}

/**
 * 0B. ATOM & QUANTUM ORBITAL SHELLS
 */
function renderAtomChemistry(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  param: number
) {
  const centerX = w / 2 - 80;
  const centerY = h / 2;

  const shells = [55, 95, 140];
  const shellLabels = ['n=1 (K shell)', 'n=2 (L shell)', 'n=3 (M shell)'];

  shells.forEach((r, idx) => {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText(shellLabels[idx], centerX + r - 10, centerY - 8);
  });

  ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 28, 0, Math.PI * 2);
  ctx.fill();

  for (let n = 0; n < 8; n++) {
    const na = (n * Math.PI) / 4 + time * 0.5;
    const nr = 10 + Math.sin(time * 3 + n) * 4;
    const nx = centerX + Math.cos(na) * nr;
    const ny = centerY + Math.sin(na) * nr;
    const isProton = n % 2 === 0;

    ctx.fillStyle = isProton ? '#f43f5e' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(nx, ny, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isProton ? '+' : 'n', nx, ny + 2.5);
  }

  const electronConfigs = [
    { shellR: 55, count: 2, speed: 2.4 },
    { shellR: 95, count: 4, speed: 1.6 },
    { shellR: 140, count: 1 + Math.floor(param * 3), speed: 1.1 },
  ];

  electronConfigs.forEach((cfg) => {
    for (let e = 0; e < cfg.count; e++) {
      const ea = (e * (Math.PI * 2)) / cfg.count + time * cfg.speed;
      const ex = centerX + Math.cos(ea) * cfg.shellR;
      const ey = centerY + Math.sin(ea) * cfg.shellR;

      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const dashX = w - 210;
  const dashY = 40;
  ctx.fillStyle = '#111726';
  ctx.strokeStyle = '#334155';
  roundRect(ctx, dashX, dashY, 180, 250, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ATOMIC STRUCTURE', dashX + 90, dashY + 22);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Nucleus: 4p⁺, 4n⁰', dashX + 16, dashY + 55);
  ctx.fillText('Electrons: 7e⁻', dashX + 16, dashY + 80);
  ctx.fillText('Config: 1s² 2s² 2p³', dashX + 16, dashY + 105);

  renderMetricBar(ctx, dashX + 16, dashY + 130, 'Excitation (ΔE=hν)', param, '#ffd166');
  renderMetricBar(ctx, dashX + 16, dashY + 175, 'Ionization Energy', 0.85, '#00e5ff');
}

/**
 * 0C. CIRCUITS & ELECTRICAL CHARGE FLOW
 */
function renderCircuitElectronics(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  param: number
) {
  const leftX = 120;
  const rightX = w - 260;
  const topY = 90;
  const bottomY = h - 100;

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.strokeRect(leftX, topY, rightX - leftX, bottomY - topY);

  const batY = (topY + bottomY) / 2;
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(leftX - 10, batY - 25, 20, 50);

  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(leftX - 18, batY - 12);
  ctx.lineTo(leftX + 18, batY - 12);
  ctx.moveTo(leftX - 9, batY + 12);
  ctx.lineTo(leftX + 9, batY + 12);
  ctx.stroke();

  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('+ V -', leftX - 24, batY + 4);

  const resX = (leftX + rightX) / 2;
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(resX - 35, topY - 12, 70, 24);

  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(resX - 30, topY);
  ctx.lineTo(resX - 20, topY - 10);
  ctx.lineTo(resX - 10, topY + 10);
  ctx.lineTo(resX, topY - 10);
  ctx.lineTo(resX + 10, topY + 10);
  ctx.lineTo(resX + 20, topY - 10);
  ctx.lineTo(resX + 30, topY);
  ctx.stroke();

  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('RESISTOR (R)', resX, topY - 20);

  const driftSpeed = 0.8 + param * 2.2;
  const perimeter = 2 * (rightX - leftX + (bottomY - topY));
  const electronCount = 20;

  for (let e = 0; e < electronCount; e++) {
    const dist = ((e / electronCount) * perimeter + time * 70 * driftSpeed) % perimeter;
    let ex = leftX;
    let ey = topY;

    const w1 = rightX - leftX;
    const h1 = bottomY - topY;

    if (dist < w1) {
      ex = leftX + dist;
      ey = topY;
    } else if (dist < w1 + h1) {
      ex = rightX;
      ey = topY + (dist - w1);
    } else if (dist < 2 * w1 + h1) {
      ex = rightX - (dist - (w1 + h1));
      ey = bottomY;
    } else {
      ex = leftX;
      ey = bottomY - (dist - (2 * w1 + h1));
    }

    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const dashX = w - 210;
  const dashY = 40;
  ctx.fillStyle = '#111726';
  ctx.strokeStyle = '#334155';
  roundRect(ctx, dashX, dashY, 180, 240, 10);
  ctx.fill();
  ctx.stroke();

  const voltage = 12;
  const resistance = 4;
  const current = (voltage / resistance) * driftSpeed;

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText("OHM'S LAW (V = IR)", dashX + 90, dashY + 22);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Voltage (V): ${voltage} V`, dashX + 16, dashY + 55);
  ctx.fillText(`Resistance (R): ${resistance} Ω`, dashX + 16, dashY + 80);
  ctx.fillText(`Current (I): ${current.toFixed(2)} A`, dashX + 16, dashY + 105);

  renderMetricBar(ctx, dashX + 16, dashY + 130, 'Current Flow (I)', Math.min(1, current / 6), '#00e5ff');
  renderMetricBar(ctx, dashX + 16, dashY + 175, 'Power (P = VI)', Math.min(1, (voltage * current) / 60), '#ffd166');
}

/**
 * 0. RAINWATER HARVESTING & HYDRAULIC FLUID SYSTEM
 * Renders rain clouds with precipitation, isometric sloped roof catchment plane (A),
 * gutters, first-flush diverter, multi-stage filtration column, clean storage cistern (V),
 * irrigation outflow, and quantitative volume calculations V = A * h * eta.
 */
function renderRainwaterHarvestingSystem(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  param: number
) {
  // 1. Rain Clouds & Animated Precipitation
  const rainRate = 12 + param * 48; // mm/hr
  const rainIntensity = 0.35 + param * 0.65;

  const cloudX = 140;
  const cloudY = 48;

  // Cloud shape
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cloudX - 35, cloudY + 8, 20, 0, Math.PI * 2);
  ctx.arc(cloudX, cloudY - 2, 26, 0, Math.PI * 2);
  ctx.arc(cloudX + 38, cloudY + 6, 22, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`PRECIPITATION (${rainRate.toFixed(0)} mm/h)`, cloudX, cloudY - 28);

  // Animated falling rain streaks
  const rainDrops = 24;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < rainDrops; i++) {
    const rx = 55 + ((i * 11 + Math.floor(time * 40)) % 170);
    const ry = cloudY + 20 + ((i * 17 + time * 160 * rainIntensity) % 95);
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 3, ry + 11);
    ctx.stroke();
  }

  // 2. Isometric Sloped Roof Catchment Plane
  const roofX = 65;
  const roofY = 165;
  const roofW = 150;

  // Roof Plane (cyan translucent geometric 3B1B style)
  ctx.fillStyle = 'rgba(14, 165, 233, 0.12)';
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(roofX, roofY + 30);
  ctx.lineTo(roofX + 65, roofY - 22);
  ctx.lineTo(roofX + roofW + 35, roofY - 8);
  ctx.lineTo(roofX + roofW - 25, roofY + 45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Roof Area Label
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ROOF CATCHMENT (A)', roofX + 80, roofY + 12);

  // Water runoff sheets sliding along the roof
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
  ctx.lineWidth = 2;
  for (let s = 0; s < 3; s++) {
    const slipT = (time * 1.5 + s * 0.35) % 1;
    const sx1 = roofX + 65 + (roofW - 25 - 65) * (s / 3);
    const sy1 = roofY - 22 + 65 * (s / 3);
    const sx2 = sx1 - 35 * slipT;
    const sy2 = sy1 + 42 * slipT;
    ctx.beginPath();
    ctx.moveTo(sx2, sy2);
    ctx.lineTo(sx2 - 7, sy2 + 9);
    ctx.stroke();
  }

  // Perimeter Gutter Channel
  const gutterX = roofX + roofW - 25;
  const gutterY = roofY + 45;
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(roofX, roofY + 30);
  ctx.lineTo(gutterX, gutterY);
  ctx.stroke();

  // Downspout Pipe into First Flush Diverter & Filter
  const pipeX = gutterX;
  const pipeY1 = gutterY;
  const filterEntryX = 310;
  const filterEntryY = 140;

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pipeX, pipeY1);
  ctx.lineTo(pipeX, pipeY1 + 40);
  ctx.lineTo(filterEntryX - 25, pipeY1 + 40);
  ctx.lineTo(filterEntryX - 25, filterEntryY);
  ctx.lineTo(filterEntryX, filterEntryY);
  ctx.stroke();

  // First flush vertical sediment trap
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  roundRect(ctx, pipeX - 6, pipeY1 + 40, 12, 45, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.font = '8px monospace';
  ctx.fillText('1st FLUSH', pipeX, pipeY1 + 96);

  // 3. Multi-Stage Filtration Column
  const filterX = 310;
  const filterY = 110;
  const filterW = 85;
  const filterH = 160;

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2;
  roundRect(ctx, filterX, filterY, filterW, filterH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FILTRATION CHAMBER', filterX + filterW / 2, filterY - 10);

  // Layer 1: Coarse Gravel Bed
  ctx.fillStyle = 'rgba(120, 113, 108, 0.4)';
  ctx.fillRect(filterX + 2, filterY + 15, filterW - 4, 35);
  ctx.fillStyle = '#a8a29e';
  ctx.font = '8px monospace';
  ctx.fillText('Coarse Gravel', filterX + filterW / 2, filterY + 36);

  // Layer 2: Fine Silica Sand
  ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
  ctx.fillRect(filterX + 2, filterY + 52, filterW - 4, 40);
  ctx.fillStyle = '#fcd34d';
  ctx.fillText('Silica Sand', filterX + filterW / 2, filterY + 76);

  // Layer 3: Activated Charcoal
  ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.fillRect(filterX + 2, filterY + 94, filterW - 4, 45);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('Carbon Filter', filterX + filterW / 2, filterY + 120);

  // Connecting pipe to storage cistern
  const tankX = 455;
  const tankY = 95;
  const tankW = 165;
  const tankH = 195;

  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(filterX + filterW, filterY + filterH - 15);
  ctx.lineTo(tankX + 20, filterY + filterH - 15);
  ctx.lineTo(tankX + 20, tankY + 25);
  ctx.stroke();

  // 4. Clean Storage Cistern / Reservoir
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2.5;
  roundRect(ctx, tankX, tankY, tankW, tankH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('STORAGE CISTERN (V)', tankX + tankW / 2, tankY - 12);

  // Dynamic Water Level inside tank
  const fillFraction = Math.min(0.92, 0.25 + param * 0.65 + Math.sin(time * 0.5) * 0.03);
  const waterH = (tankH - 8) * fillFraction;
  const waterY = tankY + tankH - 4 - waterH;

  // Water body with glowing blue gradient
  const waterGrad = ctx.createLinearGradient(tankX, waterY, tankX, tankY + tankH);
  waterGrad.addColorStop(0, 'rgba(0, 229, 255, 0.65)');
  waterGrad.addColorStop(1, 'rgba(3, 105, 161, 0.85)');
  ctx.fillStyle = waterGrad;

  // Water surface waves
  ctx.beginPath();
  ctx.moveTo(tankX + 4, waterY);
  for (let wx = 4; wx <= tankW - 4; wx += 8) {
    const wy = waterY + Math.sin(wx / 18 + time * 4) * 2.5;
    ctx.lineTo(tankX + wx, wy);
  }
  ctx.lineTo(tankX + tankW - 4, tankY + tankH - 4);
  ctx.lineTo(tankX + 4, tankY + tankH - 4);
  ctx.closePath();
  ctx.fill();

  // Tank volume label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`${(fillFraction * 100).toFixed(0)}% FILLED`, tankX + tankW / 2, waterY + 30);

  // Distribution Outflow Pipe
  const outX = tankX + tankW;
  const outY = tankY + tankH - 30;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(outX, outY);
  ctx.lineTo(outX + 35, outY);
  ctx.lineTo(outX + 35, outY + 35);
  ctx.stroke();

  // Irrigation output particles
  for (let sp = 0; sp < 4; sp++) {
    const spY = outY + 35 + ((time * 40 + sp * 10) % 25);
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(outX + 35 + Math.sin(time * 5 + sp) * 6, spY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('CLEAN SUPPLY', outX + 35, outY + 75);

  // 5. Quantitative Engineering Dashboard
  const dashX = 705;
  const dashY = 40;
  const dashW = 175;
  const dashH = 280;

  ctx.fillStyle = '#111726';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  roundRect(ctx, dashX, dashY, dashW, dashH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HARVESTING CALCULATION', dashX + dashW / 2, dashY + 22);

  const roofArea = 150; // m^2
  const rainfallDepth = 15 + param * 45; // mm
  const efficiency = 0.85; // coefficient
  const volumeLiters = Math.floor(roofArea * rainfallDepth * efficiency);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Roof Area (A): ${roofArea} m²`, dashX + 16, dashY + 55);
  ctx.fillText(`Rain Depth (h): ${rainfallDepth.toFixed(1)} mm`, dashX + 16, dashY + 80);
  ctx.fillText(`Efficiency (η): ${efficiency}`, dashX + 16, dashY + 105);

  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`Yield: ${volumeLiters.toLocaleString()} L`, dashX + 16, dashY + 135);

  // Performance meters
  renderMetricBar(ctx, dashX + 16, dashY + 155, 'Precipitation', param, '#0284c7');
  renderMetricBar(ctx, dashX + 16, dashY + 195, 'Filtration Rate', 0.9, '#10b981');
  renderMetricBar(ctx, dashX + 16, dashY + 235, 'Cistern Fill', fillFraction, '#00e5ff');
}

/**
 * 1. PHOTOSYNTHESIS & BIOCHEMICAL ENGINE
 * Renders radiant sun photon emitter, thylakoid membrane, photolysis water splitting,
 * Calvin cycle rotating gears, ATP/NADPH energy packets, and chemical yield curves.
 */
function renderPhotosynthesisSimulation(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  param: number
) {
  // Left: Radiant Sun with animated light waves
  const sunX = 80;
  const sunY = 90;
  const sunGlow = 35 + Math.sin(time * 3) * 4;

  // Sun outer glow
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunGlow * 1.8);
  sunGrad.addColorStop(0, 'rgba(255, 214, 0, 0.9)');
  sunGrad.addColorStop(0.5, 'rgba(255, 140, 0, 0.35)');
  sunGrad.addColorStop(1, 'rgba(255, 140, 0, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunGlow * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Sun core
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0b0f19';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PHOTONS', sunX, sunY - 4);
  ctx.fillText('hv', sunX, sunY + 8);

  // Photon wave packet beams radiating towards chloroplast
  const lightTargetX = 260;
  const lightTargetY = 220;
  const beamCount = 4;

  for (let b = 0; b < beamCount; b++) {
    const offset = (b - 1.5) * 16;
    const startX = sunX + 25;
    const startY = sunY + 15 + offset;
    const endX = lightTargetX - 40;
    const endY = lightTargetY - 20 + offset;

    ctx.strokeStyle = 'rgba(255, 209, 102, 0.6)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();

    const steps = 30;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const lx = startX + (endX - startX) * t;
      const ly = startY + (endY - startY) * t;
      const wave = Math.sin(t * Math.PI * 8 - time * 6 + b) * 5 * param;
      if (s === 0) ctx.moveTo(lx, ly + wave);
      else ctx.lineTo(lx, ly + wave);
    }
    ctx.stroke();
  }

  // Center-Left: Chloroplast Thylakoid Chamber (Light Reactions)
  const thylaX = 220;
  const thylaY = 170;
  const thylaW = 190;
  const thylaH = 210;

  // Membrane boundary
  ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  roundRect(ctx, thylaX, thylaY, thylaW, thylaH, 18);
  ctx.fill();
  ctx.stroke();

  // Title badge
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CHLOROPLAST (Thylakoid)', thylaX + thylaW / 2, thylaY + 22);

  // Water Splitting Site (Photolysis): H2O -> 2H+ + 1/2 O2 + 2e-
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('2H₂O ➔ 4H⁺ + O₂ + 4e⁻', thylaX + thylaW / 2, thylaY + 55);

  // Animated Electron Transport Chain (Photosystems I & II)
  const ps1X = thylaX + 45;
  const ps1Y = thylaY + 110;
  const ps2X = thylaX + 145;
  const ps2Y = thylaY + 110;

  // Photosystem complexes
  drawChamberNode(ctx, ps1X, ps1Y, 'PS II', '#06b6d4', 'P680');
  drawChamberNode(ctx, ps2X, ps2Y, 'PS I', '#10b981', 'P700');

  // Electron transport spark line
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(ps1X + 22, ps1Y);
  ctx.lineTo(ps2X - 22, ps2Y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Electron pulse spark
  const ePulse = (time * 2) % 1;
  const epX = ps1X + 22 + (ps2X - 22 - (ps1X + 22)) * ePulse;
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(epX, ps1Y, 4, 0, Math.PI * 2);
  ctx.fill();

  // Escaping Oxygen Bubbles (O2)
  for (let bub = 0; bub < 3; bub++) {
    const by = thylaY + 45 - ((time * 30 + bub * 25) % 65);
    const bx = thylaX + 120 + Math.sin(time * 3 + bub) * 8;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(bx, by, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.font = '7px sans-serif';
    ctx.fillText('O₂', bx, by + 2.5);
  }

  // Energy transfer arrows: ATP & NADPH heading to Calvin Cycle
  const bridgeX1 = thylaX + thylaW;
  const bridgeY1 = thylaY + 110;
  const bridgeX2 = 510;
  const bridgeY2 = 180;

  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bridgeX1, bridgeY1);
  ctx.bezierCurveTo(bridgeX1 + 40, bridgeY1 - 20, bridgeX2 - 40, bridgeY2 - 20, bridgeX2, bridgeY2);
  ctx.stroke();

  // Floating ATP/NADPH energy packets
  const atpT = (time * 0.8) % 1;
  const atpX = bridgeX1 + (bridgeX2 - bridgeX1) * atpT;
  const atpY = bridgeY1 - Math.sin(atpT * Math.PI) * 35;
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  ctx.arc(atpX, atpY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('ATP', atpX, atpY + 2.5);

  // Center-Right: Calvin Cycle (Light-Independent Stroma Reactions)
  const calvinCenterX = 600;
  const calvinCenterY = 240;
  const calvinRadius = 65;

  // Stroma background zone
  ctx.fillStyle = 'rgba(168, 85, 247, 0.06)';
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(calvinCenterX, calvinCenterY, calvinRadius + 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('CALVIN CYCLE (Stroma)', calvinCenterX, calvinCenterY - calvinRadius - 15);

  // Rotating Circular Path with arrows
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(calvinCenterX, calvinCenterY, calvinRadius, 0, Math.PI * 2);
  ctx.stroke();

  // 3 Stages on the Calvin Cycle: Fixation, Reduction, Regeneration
  const cycleAngle = time * 0.8;
  const stages = [
    { label: 'CO₂ Fixation', angle: 0 },
    { label: 'Reduction', angle: (Math.PI * 2) / 3 },
    { label: 'Regeneration', angle: (Math.PI * 4) / 3 },
  ];

  stages.forEach((st) => {
    const a = st.angle + cycleAngle;
    const nx = calvinCenterX + Math.cos(a) * calvinRadius;
    const ny = calvinCenterY + Math.sin(a) * calvinRadius;

    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(nx, ny, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(st.label, nx + Math.cos(a) * 28, ny + Math.sin(a) * 16);
  });

  // CO2 Intake from top
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  drawArrow(ctx, calvinCenterX, 70, calvinCenterX, calvinCenterY - calvinRadius - 2, '#94a3b8', '6 CO₂');

  // Output Glucose (C6H12O6) Synthesis at bottom
  const gluX = calvinCenterX + 85;
  const gluY = calvinCenterY + calvinRadius + 45;
  drawArrow(ctx, calvinCenterX + 35, calvinCenterY + calvinRadius - 5, gluX, gluY - 10, '#ffd166', '');

  // Glucose Hexagon Molecule Badge
  drawHexagon(ctx, gluX + 25, gluY, 20, '#ffd166', '#0b0f19');
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('GLUCOSE', gluX + 25, gluY + 28);
  ctx.font = '9px monospace';
  ctx.fillText('C₆H₁₂O₆', gluX + 25, gluY + 40);

  // Far Right: Chemical Energy / Net Yield Dashboard
  const dashX = 760;
  const dashY = 50;
  const dashW = 120;
  const dashH = 260;

  ctx.fillStyle = '#111726';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  roundRect(ctx, dashX, dashY, dashW, dashH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('REACTION METRICS', dashX + dashW / 2, dashY + 22);

  // Metric bars
  renderMetricBar(ctx, dashX + 15, dashY + 45, 'Solar Lux', Math.min(1, param * 1.2), '#ffd166');
  renderMetricBar(ctx, dashX + 15, dashY + 95, 'ATP Yield', 0.85 * param, '#a855f7');
  renderMetricBar(ctx, dashX + 15, dashY + 145, 'O₂ Rate', 0.92 * param, '#38bdf8');
  renderMetricBar(ctx, dashX + 15, dashY + 195, 'Glucose Output', 0.78 * param, '#10b981');
}

/**
 * 2. NEURAL NETWORK CHAPTER 1 (3Blue1Brown MNIST Digit Recognition)
 * Renders handwritten digit input grid, 4 layers of neurons with synaptic weights,
 * forward propagation waves, and 0-9 output probability distributions.
 */
function renderNeuralNetworkChapter1(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  param: number,
  digit: number
) {
  // Left: 8x8 Pixel Grid representation of the handwritten digit
  const gridX = 40;
  const gridY = 110;
  const cellSize = 14;
  const gridSize = 8;

  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  roundRect(ctx, gridX - 10, gridY - 30, gridSize * cellSize + 20, gridSize * cellSize + 60, 10);
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Digit "${digit}" (Input Pixels)`, gridX + (gridSize * cellSize) / 2, gridY - 12);

  // Generate synthetic pixel brightness for the selected digit
  const digitPixels = getDigitPixelMap(digit);

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const px = gridX + c * cellSize;
      const py = gridY + r * cellSize;
      const val = digitPixels[r * gridSize + c] || 0;

      ctx.fillStyle = `rgb(${Math.floor(val * 255)}, ${Math.floor(val * 255)}, ${Math.floor(
        val * 255
      )})`;
      ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
    }
  }

  // Multi-layer Neural Network Layout
  const layers = [6, 8, 8, 10]; // Represented layers
  const layerLabels = ['Layer 1 (784 Pixels)', 'Layer 2 (Edges)', 'Layer 3 (Patterns)', 'Layer 4 (Output 0-9)'];
  const colSpacing = 130;
  const startX = 220;

  interface NodeCoord {
    x: number;
    y: number;
    layer: number;
    index: number;
    activation: number;
  }

  const nodes: NodeCoord[][] = [];

  for (let l = 0; l < layers.length; l++) {
    const count = layers[l];
    const x = startX + l * colSpacing;
    const spacingY = (h - 130) / (count + 1);
    nodes[l] = [];

    for (let i = 0; i < count; i++) {
      const y = 65 + (i + 1) * spacingY;
      let act = 0.1;

      if (l === 0) {
        // Sampled from digit pixels
        act = digitPixels[(i * 10) % 64] || 0.2;
      } else if (l === layers.length - 1) {
        // Output layer: Target digit has highest activation
        act = i === digit ? 0.94 : 0.08 + Math.sin(i * 3 + time) * 0.06;
      } else {
        // Hidden activations
        act = Math.sin((l * 0.8 - (time * 2 + param * 4)) + i * 0.6) * 0.45 + 0.55;
      }

      nodes[l].push({ x, y, layer: l, index: i, activation: Math.max(0, Math.min(1, act)) });
    }
  }

  // Draw Synaptic Connections with positive (cyan) and negative (orange) weights
  for (let l = 0; l < layers.length - 1; l++) {
    for (const src of nodes[l]) {
      for (const dest of nodes[l + 1]) {
        const weightVal = Math.sin(src.index * 7 + dest.index * 13 + (l === 2 ? digit : 0));
        const isPositive = weightVal > 0;
        const absW = Math.abs(weightVal);

        ctx.strokeStyle = isPositive
          ? `rgba(0, 229, 255, ${0.08 + absW * 0.2})`
          : `rgba(244, 63, 94, ${0.05 + absW * 0.16})`;
        ctx.lineWidth = 1 + absW * 1.5;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(dest.x, dest.y);
        ctx.stroke();

        // Forward propagation signal pulse packets
        const pulse = (time * 1.5 + param * 3 - l * 0.35) % 1;
        if (pulse > 0 && pulse < 1 && absW > 0.5) {
          const px = src.x + (dest.x - src.x) * pulse;
          const py = src.y + (dest.y - src.y) * pulse;
          ctx.fillStyle = '#ffd166';
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // Draw Neurons (Spheres with brightness = activation)
  for (let l = 0; l < layers.length; l++) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(layerLabels[l], startX + l * colSpacing, 35);

    for (const n of nodes[l]) {
      const act = n.activation;

      // Glow halo on high activation
      if (act > 0.6) {
        ctx.fillStyle = `rgba(0, 229, 255, ${(act - 0.5) * 0.5})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // Border ring
      ctx.strokeStyle = act > 0.5 ? '#38bdf8' : '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Core fill
      const bri = Math.floor(act * 255);
      ctx.fillStyle = `rgb(${bri}, ${Math.floor(bri * 0.95)}, ${Math.floor(bri * 0.7)})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Output digit label on rightmost column
      if (l === layers.length - 1) {
        ctx.fillStyle = n.index === digit ? '#ffd166' : '#64748b';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(String(n.index), n.x + 18, n.y + 4);
      }
    }
  }

  // Far Right: Output Probability Distribution Bar Chart
  const chartX = 760;
  const chartY = 60;
  const chartW = 110;
  const chartH = 260;

  ctx.fillStyle = '#111726';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  roundRect(ctx, chartX, chartY, chartW, chartH, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('OUTPUT SOFTMAX', chartX + chartW / 2, chartY + 20);

  for (let d = 0; d < 10; d++) {
    const barY = chartY + 38 + d * 21;
    const isTarget = d === digit;
    const prob = isTarget ? 0.92 : 0.05 + Math.sin(d + time) * 0.03;

    ctx.fillStyle = isTarget ? '#ffd166' : '#94a3b8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`${d}:`, chartX + 16, barY + 9);

    // Probability bar
    ctx.fillStyle = isTarget ? '#00e5ff' : '#334155';
    ctx.fillRect(chartX + 28, barY, Math.floor(prob * 65), 11);
  }
}

/**
 * 3. ORBITAL GRAVITY WELL & CELESTIAL MECHANICS
 * Renders curved spacetime gravity well, central sun, planet orbiting with elliptical path,
 * and velocity vector v (cyan) and gravitational force vector F (gold).
 */
function renderOrbitalGravityWell(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  param: number
) {
  const centerX = w / 2 - 30;
  const centerY = h / 2 + 10;

  // 3D Perspective Curved Spacetime Grid (Gravity Well)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.lineWidth = 1;

  for (let r = 25; r <= 180; r += 25) {
    const dip = Math.max(0, 150 - r) * 0.25;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + dip, r, r * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const endX = centerX + Math.cos(a) * 200;
    const endY = centerY + Math.sin(a) * 110;
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  // Central Star / Sun
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 209, 102, 0.3)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0b0f19';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SUN (M)', centerX, centerY + 3.5);

  // Orbit Geometry: Semi-major axis A and semi-minor axis B
  const ecc = 0.15 + param * 0.5; // Eccentricity
  const semiA = 160;
  const semiB = semiA * Math.sqrt(1 - ecc * ecc) * 0.55;

  // Orbit ellipse trajectory
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.ellipse(centerX - ecc * 30, centerY, semiA, semiB, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Planet Position
  const orbitSpeed = 1.2 / Math.sqrt(param + 0.3);
  const theta = time * orbitSpeed;
  const planetX = centerX - ecc * 30 + Math.cos(theta) * semiA;
  const planetY = centerY + Math.sin(theta) * semiB;

  // Orbit Path Trail
  ctx.fillStyle = '#00e5ff';
  ctx.beginPath();
  ctx.arc(planetX, planetY, 7, 0, Math.PI * 2);
  ctx.fill();

  // Gravitational Force Vector F = -G M m / r^2 r_hat (Gold, pointing to Sun)
  drawArrow(ctx, planetX, planetY, centerX, centerY, '#ffd166', 'F_g');

  // Velocity Vector v = dr/dt (Cyan, tangent to path)
  const tanX = -Math.sin(theta) * 55;
  const tanY = Math.cos(theta) * 30;
  drawArrow(ctx, planetX, planetY, planetX + tanX, planetY + tanY, '#00e5ff', 'v');

  // Right Side: Energy & Keplerian Orbital Dashboard
  const dashX = 720;
  const dashY = 50;
  const dashW = 150;
  const dashH = 260;

  ctx.fillStyle = '#111726';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  roundRect(ctx, dashX, dashY, dashW, dashH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ORBITAL DYNAMICS', dashX + dashW / 2, dashY + 24);

  // Compute live distance r and velocity
  const dx = planetX - centerX;
  const dy = planetY - centerY;
  const r = Math.sqrt(dx * dx + dy * dy);
  const v = Math.sqrt(1 / (r + 10)) * 80;

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Radius r: ${r.toFixed(1)} AU`, dashX + 16, dashY + 60);
  ctx.fillText(`Velocity v: ${v.toFixed(1)} km/s`, dashX + 16, dashY + 85);
  ctx.fillText(`Eccentricity e: ${ecc.toFixed(2)}`, dashX + 16, dashY + 110);

  renderMetricBar(ctx, dashX + 16, dashY + 130, 'Kinetic (1/2mv²)', Math.min(1, v / 12), '#00e5ff');
  renderMetricBar(ctx, dashX + 16, dashY + 180, 'Potential (-GM/r)', Math.min(1, 120 / r), '#ffd166');
}

/**
 * 4. CALCULUS RIEMANN SUMS & TANGENT DERIVATIVE
 * Renders smooth continuous curve f(x), Riemann approximation rectangular partitions
 * that converge smoothly as N increases, and interactive tangent slope probe.
 */
function renderCalculusRiemann(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  param: number
) {
  const originX = 140;
  const originY = h * 0.78;
  const scaleX = 80;
  const scaleY = 70;

  // Function: f(x) = sin(x) + 0.15 x^2 + 0.4
  const f = (x: number) => Math.sin(x) + 0.12 * x * x + 0.4;
  const df = (x: number) => Math.cos(x) + 0.24 * x;

  // Axes
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(originX, 30);
  ctx.lineTo(originX, originY + 20);
  ctx.moveTo(originX - 30, originY);
  ctx.lineTo(w - 60, originY);
  ctx.stroke();

  // Integration Interval [a, b]
  const a = 0.5;
  const b = 5.5;
  const numRects = Math.max(4, Math.floor(4 + param * 40));
  const dx = (b - a) / numRects;

  let totalArea = 0;

  // Draw Riemann Sum Rectangles
  for (let i = 0; i < numRects; i++) {
    const rx = a + i * dx;
    const midX = rx + dx / 2;
    const ry = f(midX);
    totalArea += ry * dx;

    const px = originX + rx * scaleX;
    const pw = dx * scaleX;
    const ph = ry * scaleY;
    const py = originY - ph;

    ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeRect(px, py, pw, ph);
  }

  // Draw Smooth Continuous Curve f(x) in Gold
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let px = originX - 20; px < w - 80; px += 2) {
    const x = (px - originX) / scaleX;
    const y = f(x);
    const py = originY - y * scaleY;
    if (px === originX - 20) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Tangent line probe at x_probe
  const probeX = a + (b - a) * (0.3 + Math.sin(time * 0.8) * 0.25);
  const probeY = f(probeX);
  const slope = df(probeX);

  const ptX = originX + probeX * scaleX;
  const ptY = originY - probeY * scaleY;

  // Tangent line
  const span = 1.2;
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(originX + (probeX - span) * scaleX, originY - (probeY - slope * span) * scaleY);
  ctx.lineTo(originX + (probeX + span) * scaleX, originY - (probeY + slope * span) * scaleY);
  ctx.stroke();

  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(ptX, ptY, 6, 0, Math.PI * 2);
  ctx.fill();

  // Calculus Live Equation Box
  const infoX = w - 240;
  const infoY = 50;
  ctx.fillStyle = '#111726';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  roundRect(ctx, infoX, infoY, 200, 180, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('RIEMANN INTEGRAL', infoX + 16, infoY + 24);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '10px monospace';
  ctx.fillText(`Partitions N: ${numRects}`, infoX + 16, infoY + 55);
  ctx.fillText(`Width dx: ${dx.toFixed(3)}`, infoX + 16, infoY + 80);
  ctx.fillText(`Area ≈ ${totalArea.toFixed(3)}`, infoX + 16, infoY + 105);

  ctx.fillStyle = '#f43f5e';
  ctx.fillText(`Tangent df/dx: ${slope.toFixed(2)}`, infoX + 16, infoY + 140);
}

/**
 * 5. VECTOR TRANSFORMATIONS & LINEAR ALGEBRA
 */
function renderVectorTransform(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  t: number
) {
  const originX = w / 2 - 30;
  const originY = h / 2;
  const scale = 42;

  // Target Transformation Matrix M = [[1.5, -0.7], [0.6, 1.2]]
  const targetA = 1.4;
  const targetB = -0.7;
  const targetC = 0.5;
  const targetD = 1.2;

  const curA = 1 + (targetA - 1) * t;
  const curB = targetB * t;
  const curC = targetC * t;
  const curD = 1 + (targetD - 1) * t;

  const transformPoint = (x: number, y: number) => {
    const tx = curA * x + curB * y;
    const ty = curC * x + curD * y;
    return {
      px: originX + tx * scale,
      py: originY - ty * scale,
    };
  };

  // Draw Transformed Grid Lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.lineWidth = 1;

  for (let grid = -6; grid <= 6; grid++) {
    const p1 = transformPoint(grid, -6);
    const p2 = transformPoint(grid, 6);
    ctx.beginPath();
    ctx.moveTo(p1.px, p1.py);
    ctx.lineTo(p2.px, p2.py);
    ctx.stroke();

    const p3 = transformPoint(-6, grid);
    const p4 = transformPoint(6, grid);
    ctx.beginPath();
    ctx.moveTo(p3.px, p3.py);
    ctx.lineTo(p4.px, p4.py);
    ctx.stroke();
  }

  // Determinant Area Parallelogram (shaded area scaled by det(M))
  const o = transformPoint(0, 0);
  const pI = transformPoint(1, 0);
  const pJ = transformPoint(0, 1);
  const pSum = transformPoint(1, 1);

  ctx.fillStyle = 'rgba(255, 209, 102, 0.2)';
  ctx.beginPath();
  ctx.moveTo(o.px, o.py);
  ctx.lineTo(pI.px, pI.py);
  ctx.lineTo(pSum.px, pSum.py);
  ctx.lineTo(pJ.px, pJ.py);
  ctx.closePath();
  ctx.fill();

  // Axes
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(originX, 0);
  ctx.lineTo(originX, h);
  ctx.moveTo(0, originY);
  ctx.lineTo(w - 180, originY);
  ctx.stroke();

  // Basis vectors
  drawArrow(ctx, originX, originY, pI.px, pI.py, '#10b981', 'î');
  drawArrow(ctx, originX, originY, pJ.px, pJ.py, '#f43f5e', 'ĵ');

  // Transformed test vector v = (2, 1)
  const vPos = transformPoint(2, 1);
  drawArrow(ctx, originX, originY, vPos.px, vPos.py, '#ffd166', 'v');

  // Matrix display card
  const cardX = w - 210;
  const cardY = 50;
  ctx.fillStyle = '#111726';
  ctx.strokeStyle = '#334155';
  roundRect(ctx, cardX, cardY, 180, 170, 10);
  ctx.fill();
  ctx.stroke();

  const det = curA * curD - curB * curC;
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TRANSFORMATION MATRIX', cardX + 90, cardY + 22);

  ctx.font = '12px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`[ ${curA.toFixed(2)}   ${curB.toFixed(2)} ]`, cardX + 90, cardY + 60);
  ctx.fillText(`[ ${curC.toFixed(2)}   ${curD.toFixed(2)} ]`, cardX + 90, cardY + 85);

  ctx.fillStyle = '#ffd166';
  ctx.fillText(`det(M) = ${det.toFixed(2)}`, cardX + 90, cardY + 125);
  ctx.font = '9px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Area Scaling Factor', cardX + 90, cardY + 145);
}

/**
 * 6. FOURIER EPICYCLES & HARMONIC WAVE DECOMPOSITION
 */
function renderFourierEpicycles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  param: number
) {
  const centerX = 240;
  const centerY = h / 2;

  // Circles parameters (Fourier coefficients)
  const harmonics = [
    { radius: 65, speed: 1.5 },
    { radius: 35, speed: 4.5 },
    { radius: 18, speed: 7.5 },
  ];

  let curX = centerX;
  let curY = centerY;

  harmonics.forEach((hArm) => {
    const prevX = curX;
    const prevY = curY;
    const angle = time * hArm.speed;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(prevX, prevY, hArm.radius, 0, Math.PI * 2);
    ctx.stroke();

    curX = prevX + Math.cos(angle) * hArm.radius;
    curY = prevY + Math.sin(angle) * hArm.radius;

    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(curX, curY);
    ctx.stroke();
  });

  // Connecting horizontal laser line from epicycle tip to wave
  const waveStartX = 420;
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.4)';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(curX, curY);
  ctx.lineTo(waveStartX, curY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Synthesized Periodic Waveform
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let px = waveStartX; px < w - 60; px += 2) {
    const tShift = time + (px - waveStartX) * 0.02;
    let wy = centerY;
    harmonics.forEach((hArm) => {
      wy += Math.sin(tShift * hArm.speed) * hArm.radius;
    });

    if (px === waveStartX) ctx.moveTo(px, wy);
    else ctx.lineTo(px, wy);
  }
  ctx.stroke();
}

/**
 * 7. DYNAMIC CUSTOM TOPIC DIAGRAM
 * Generates an elaborate animated circular system with chemical/conceptual nodes,
 * pulse lines, and live reaction meters for open-ended topics.
 */
function renderDynamicCustomDiagram(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scene: VisualScene,
  time: number,
  stepIndex: number,
  param: number
) {
  const centerX = w / 2 - 80;
  const centerY = h / 2;
  const radius = 130;

  const defaultNodes = [
    { label: 'Primary Input', detail: 'Energy / Material' },
    { label: 'Core Mechanism', detail: 'Transformations' },
    { label: 'Equilibrium', detail: 'Dynamic Balance' },
    { label: 'Synthesized Output', detail: 'Final Products' },
  ];

  const nodeCount = defaultNodes.length;

  // Center energy core
  ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ACTIVE', centerX, centerY - 4);
  ctx.fillText('PROCESS', centerX, centerY + 10);

  // Orbiting ring with flowing pulses
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < nodeCount; i++) {
    const angle = (i * (Math.PI * 2)) / nodeCount - Math.PI / 2;
    const nx = centerX + Math.cos(angle) * radius;
    const ny = centerY + Math.sin(angle) * radius;
    const isActive = i === stepIndex;

    // Glowing active halo
    if (isActive) {
      ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(nx, ny, 36, 0, Math.PI * 2);
      ctx.fill();
    }

    // Node bubble
    ctx.fillStyle = isActive ? '#1e293b' : '#0f172a';
    ctx.strokeStyle = isActive ? '#00e5ff' : '#475569';
    ctx.lineWidth = isActive ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.arc(nx, ny, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isActive ? '#38bdf8' : '#94a3b8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(defaultNodes[i].label, nx, ny - 32);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(`${i + 1}`, nx, ny + 4);
  }

  // Right Side Metrics Dashboard
  const dashX = w - 210;
  const dashY = 50;
  ctx.fillStyle = '#111726';
  ctx.strokeStyle = '#334155';
  roundRect(ctx, dashX, dashY, 180, 220, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SYSTEM PARAMETERS', dashX + 90, dashY + 24);

  renderMetricBar(ctx, dashX + 16, dashY + 50, 'Energy Flow', 0.65 + Math.sin(time) * 0.15, '#00e5ff');
  renderMetricBar(ctx, dashX + 16, dashY + 100, 'Reaction Yield', param * 0.9, '#ffd166');
  renderMetricBar(ctx, dashX + 16, dashY + 150, 'Equilibrium', 0.82, '#10b981');
}

/* =========================================================================
   CANVAS DRAWING UTILITIES
   ========================================================================= */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawChamberNode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  color: string,
  sublabel: string
) {
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y - 2);
  ctx.font = '8px monospace';
  ctx.fillText(sublabel, x, y + 9);
}

function renderMetricBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  val: number,
  color: string
) {
  const w = 90;
  const h = 8;
  const clamped = Math.max(0, Math.min(1, val));

  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x, y + 4, w, h);

  ctx.fillStyle = color;
  ctx.fillRect(x, y + 4, Math.floor(w * clamped), h);
}

function drawHexagon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  strokeColor: string,
  fillColor: string
) {
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const hx = x + Math.cos(angle) * radius;
    const hy = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  label?: string
) {
  const headLen = 9;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  if (label) {
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, toX + 12, toY - 6);
  }
}

function getDigitPixelMap(digit: number): number[] {
  // Precomputed 8x8 bitmap activations for digits 0-9
  const map = new Array(64).fill(0.05);

  if (digit === 0) {
    const indices = [10, 11, 12, 13, 17, 22, 25, 30, 33, 38, 41, 46, 50, 51, 52, 53];
    indices.forEach((i) => (map[i] = 0.95));
  } else if (digit === 1) {
    const indices = [11, 12, 19, 20, 27, 28, 35, 36, 43, 44, 51, 52];
    indices.forEach((i) => (map[i] = 0.95));
  } else if (digit === 2) {
    const indices = [10, 11, 12, 13, 22, 29, 36, 43, 50, 51, 52, 53];
    indices.forEach((i) => (map[i] = 0.95));
  } else if (digit === 3) {
    const indices = [10, 11, 12, 13, 22, 27, 28, 38, 46, 50, 51, 52, 53];
    indices.forEach((i) => (map[i] = 0.95));
  } else if (digit === 4) {
    const indices = [10, 14, 18, 22, 26, 30, 34, 35, 36, 37, 38, 46, 54];
    indices.forEach((i) => (map[i] = 0.95));
  } else if (digit === 7) {
    const indices = [9, 10, 11, 12, 13, 14, 22, 29, 36, 44, 52];
    indices.forEach((i) => (map[i] = 0.95));
  } else if (digit === 8) {
    const indices = [10, 11, 12, 13, 17, 22, 26, 27, 28, 29, 33, 38, 41, 46, 50, 51, 52, 53];
    indices.forEach((i) => (map[i] = 0.95));
  } else {
    // Default digit curve
    const indices = [10, 11, 12, 13, 17, 22, 27, 28, 38, 50, 51, 52, 53];
    indices.forEach((i) => (map[i] = 0.95));
  }

  return map;
}
