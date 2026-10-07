import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Initialize Gemini SDK with telemetry header per AI Studio guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const TUTOR_SYSTEM_INSTRUCTION = `You are Pip, a friendly, patient, and encouraging personal tutor for a student in a one-to-one conversational session, accompanied by an advanced 3Blue1Brown-style interactive mathematical and scientific blackboard simulator.

Your teaching style:
1. Warm, human, and encouraging: Talk like a real, supportive mentor who cares about the student. Praise curiosity naturally.
2. Ultra-simple explanations: Assume the student may be a beginner. Avoid heavy jargon; use real-world analogies (light bulbs, gears, springs, bouncy balls, kitchens).
3. Concise & conversational: Keep your spoken text response to 2 to 4 natural sentences that sound engaging when read aloud. End with a friendly question to check understanding.
4. Advanced 3Blue1Brown Visual Simulation Engine: For every topic or question, select the best matching 3B1B interactive simulation type:
   - "dna_genetics": For DNA, RNA, double helix, genetics, genes, chromosomes, nucleotides, base pairs (A-T, G-C), protein synthesis, molecular biology.
   - "water_rainwater_system": For rainwater harvesting, water cycle, fluid mechanics, irrigation, filtration, hydrology, plumbing, catchment storage, and environmental runoff.
   - "photosynthesis_bio": For photosynthesis, biology, plant chemistry, cellular reactions, chloroplasts, enzymes, light energy conversion, ATP synthesis, or molecular processes.
   - "atom_chemistry": For atoms, electrons, Bohr orbital shells, chemical bonds, atomic structure, periodic table.
   - "circuit_electronics": For electric circuits, Ohm's law, voltage, current, resistors, capacitors, electricity.
   - "neural_network": ONLY for neural networks, deep learning, AI, machine learning, digit recognition, perceptrons, multi-layer synaptic weights.
   - "orbital_gravity": For gravity, planetary orbits, Kepler's laws, celestial mechanics, astrophysics, gravitational force vectors.
   - "calculus_riemann": For calculus, derivatives, integrals, Riemann sums, slopes, limits, areas under curves, tangents.
   - "vector_transform": For linear algebra, matrices, basis vectors i-hat & j-hat, 2D coordinate grid transformations, determinants.
   - "fourier_waves": For Fourier transforms, sound, music harmonics, wave interference, frequencies, light oscillations.
   - "dynamic_custom": For other scientific, technological, or systemic processes.

You MUST return your answer as a JSON object with this exact structure:
{
  "text": "Your spoken conversational response (2-4 simple sentences with real-world analogy and follow-up question)",
  "visualScene": {
    "title": "Clear short title for the 3B1B simulation",
    "type": "dna_genetics" | "water_rainwater_system" | "photosynthesis_bio" | "atom_chemistry" | "circuit_electronics" | "neural_network" | "orbital_gravity" | "calculus_riemann" | "vector_transform" | "fourier_waves" | "dynamic_custom",
    "formula": "Key math equation or chemical formula (e.g. '6CO_2 + 6H_2O + hv \\to C_6H_{12}O_6 + 6O_2')",
    "caption": "One-sentence core visual insight explaining the mechanism",
    "steps": [
      "Step 1 breakdown of the diagram mechanism",
      "Step 2 breakdown of the diagram mechanism",
      "Step 3 breakdown of the diagram mechanism"
    ],
    "currentStepIndex": 0,
    "data": {}
  }
}`;

const DEFAULT_GREETING_TEXT =
  "Hey! I'm your personal tutor. What would you like to explore today? You can ask me anything about neural networks, photosynthesis, gravity, or calculus, and we'll visualize it with an interactive 3Blue1Brown simulation!";

const DEFAULT_GREETING_VISUAL = {
  title: 'Neural Network Architecture (3B1B Style)',
  type: 'neural_network',
  formula: 'a^{(l)} = \\sigma(W \\cdot a^{(l-1)} + b)',
  caption: 'Each neuron is like a light bulb holding a number between 0 and 1, passing signals forward through weighted synapses.',
  steps: [
    'Input Layer: Receives raw input values (like grayscale pixel brightness in an image).',
    'Hidden Layers: Detect features—first detecting local edges, then combining edges into patterns.',
    'Output Layer: Fires the final confidence scores for which digit or category is recognized.',
  ],
  currentStepIndex: 0,
  data: {
    layers: [4, 6, 6, 2],
    layerLabels: ['Input (Pixels)', 'Hidden 1 (Edges)', 'Hidden 2 (Patterns)', 'Output (Digits)'],
  },
};

const greetingAudioCache = new Map<string, string | null>();

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

async function generateSpeechAudio(text: string, voiceName: string = 'Kore'): Promise<string | null> {
  try {
    const cleanedText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const ttsPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanedText,
              speechMetadata: {
                style: 'Friendly, warm, encouraging personal teacher speaking directly to a student',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const response = await withTimeout(ttsPromise, 4500, null);
    if (!response) return null;

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (err) {
    console.warn('Gemini TTS generation notice:', err);
    return null;
  }
}

// Helper to determine the best visual type based on topic keywords
function inferVisualType(promptText: string, currentType?: string): string {
  const p = promptText.toLowerCase();

  if (
    p.includes('dna') ||
    p.includes('gene') ||
    p.includes('genetic') ||
    p.includes('helix') ||
    p.includes('chromosome') ||
    p.includes('nucleotide') ||
    p.includes('adenine') ||
    p.includes('thymine') ||
    p.includes('cytosine') ||
    p.includes('guanine') ||
    p.includes('rna') ||
    p.includes('protein') ||
    p.includes('heredity') ||
    p.includes('replication') ||
    p.includes('transcription')
  ) {
    return 'dna_genetics';
  }

  if (
    p.includes('atom') ||
    p.includes('electron') ||
    p.includes('nucleus') ||
    p.includes('proton') ||
    p.includes('neutron') ||
    p.includes('bohr') ||
    p.includes('orbital') ||
    p.includes('periodic table') ||
    p.includes('covalent') ||
    p.includes('ionic')
  ) {
    return 'atom_chemistry';
  }

  if (
    p.includes('circuit') ||
    p.includes('voltage') ||
    p.includes('current') ||
    p.includes('resistor') ||
    p.includes('capacitor') ||
    p.includes('ohm') ||
    p.includes('battery') ||
    p.includes('electric')
  ) {
    return 'circuit_electronics';
  }

  if (
    p.includes('rain') ||
    p.includes('water') ||
    p.includes('harvest') ||
    p.includes('catchment') ||
    p.includes('cistern') ||
    p.includes('roof') ||
    p.includes('filter') ||
    p.includes('irrigation') ||
    p.includes('plumb') ||
    p.includes('fluid') ||
    p.includes('reservoir') ||
    p.includes('runoff') ||
    p.includes('aquifer')
  ) {
    return 'water_rainwater_system';
  }

  if (
    p.includes('photo') ||
    p.includes('chloroplast') ||
    p.includes('plant') ||
    p.includes('biology') ||
    p.includes('sunlight') ||
    p.includes('cell') ||
    p.includes('enzyme') ||
    p.includes('respiration') ||
    p.includes('calvin') ||
    p.includes('glucose') ||
    p.includes('carbon') ||
    p.includes('chemistry')
  ) {
    return 'photosynthesis_bio';
  }

  if (
    p.includes('neural') ||
    p.includes('network') ||
    p.includes('deep learning') ||
    p.includes('ai') ||
    p.includes('machine learning') ||
    p.includes('digit') ||
    p.includes('perceptron') ||
    p.includes('weights') ||
    p.includes('backprop')
  ) {
    return 'neural_network';
  }

  if (
    p.includes('gravit') ||
    p.includes('orbit') ||
    p.includes('planet') ||
    p.includes('solar') ||
    p.includes('satellite') ||
    p.includes('kepler') ||
    p.includes('newton') ||
    p.includes('spacetime') ||
    p.includes('einstein') ||
    p.includes('astronomy')
  ) {
    return 'orbital_gravity';
  }

  if (
    p.includes('calculus') ||
    p.includes('derivative') ||
    p.includes('integral') ||
    p.includes('slope') ||
    p.includes('riemann') ||
    p.includes('tangent') ||
    p.includes('limit') ||
    p.includes('rate of change')
  ) {
    return 'calculus_riemann';
  }

  if (
    p.includes('vector') ||
    p.includes('matrix') ||
    p.includes('linear algebra') ||
    p.includes('transform') ||
    p.includes('eigen') ||
    p.includes('coordinate') ||
    p.includes('basis')
  ) {
    return 'vector_transform';
  }

  if (
    p.includes('fourier') ||
    p.includes('wave') ||
    p.includes('sound') ||
    p.includes('frequency') ||
    p.includes('harmonic') ||
    p.includes('light spectrum') ||
    p.includes('oscillation')
  ) {
    return 'fourier_waves';
  }

  if (currentType === 'neural_network') {
    const isActuallyNeural =
      p.includes('neural') ||
      p.includes('deep learning') ||
      p.includes('perceptron') ||
      p.includes('ai') ||
      p.includes('machine learning') ||
      p.includes('weights') ||
      p.includes('digit') ||
      p.includes('layer');
    if (!isActuallyNeural) {
      return 'dynamic_custom';
    }
  }

  return currentType || 'dynamic_custom';
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '25mb' }));

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Initial greeting endpoint
  app.post('/api/tutor/greeting', async (req, res) => {
    try {
      const { voice = 'Kore' } = req.body;
      const text = DEFAULT_GREETING_TEXT;

      let audioBase64 = greetingAudioCache.get(voice) || null;
      if (!greetingAudioCache.has(voice)) {
        audioBase64 = await withTimeout(generateSpeechAudio(text, voice), 3500, null);
        greetingAudioCache.set(voice, audioBase64);
      }

      res.json({
        text,
        visualScene: DEFAULT_GREETING_VISUAL,
        audioBase64,
        audioMimeType: 'audio/wav',
      });
    } catch (err: any) {
      console.error('Greeting error:', err);
      res.json({
        text: DEFAULT_GREETING_TEXT,
        visualScene: DEFAULT_GREETING_VISUAL,
        audioBase64: null,
        audioMimeType: 'audio/wav',
      });
    }
  });

  // Main conversational tutor chat endpoint with 3B1B visual scene generator
  app.post('/api/tutor/chat', async (req, res) => {
    try {
      const { messages, voice = 'Kore' } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const lastUserMessage = String(messages[messages.length - 1]?.content || '');

      // Format conversation history
      const contents = messages.map((m: any) => ({
        role: m.role === 'tutor' || m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.content || m.text || '') }],
      }));

      let replyText = '';
      let visualScene: any = null;

      try {
        const textPromise = ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const response = await withTimeout(textPromise, 11000, null);
        if (response?.text) {
          const parsed = JSON.parse(response.text);
          replyText = parsed.text || '';
          visualScene = parsed.visualScene || null;
        }
      } catch (geminiErr: any) {
        console.warn('Structured generation fallback:', geminiErr);
      }

      if (!replyText) {
        replyText =
          "I'm right here with you! Let's explore how this process works step-by-step.";
      }

      // Enforce intelligent type inference
      const inferredType = inferVisualType(lastUserMessage, visualScene?.type);

      if (!visualScene) {
        visualScene = {
          title: '3B1B Scientific & Mathematical Simulation',
          type: inferredType,
          caption: 'Interactive visual model showing the underlying forces and transformations.',
          steps: [
            'Initial state: Energy and inputs initiate the reaction.',
            'Transformation mechanism: Core scientific process in action.',
            'Equilibrium & output: Products and results synthesized.',
          ],
          currentStepIndex: 0,
          data: {},
        };
      } else {
        // Correct or upgrade type based on user request keywords
        visualScene.type = inferredType;
      }

      // Ensure appropriate formula defaults if missing
      if (!visualScene.formula) {
        if (visualScene.type === 'dna_genetics') {
          visualScene.formula = '\\text{Base Pairs: } A = T \\quad (2\\text{ H-bonds}) \\quad | \\quad G \\equiv C \\quad (3\\text{ H-bonds})';
        } else if (visualScene.type === 'atom_chemistry') {
          visualScene.formula = 'E_n = -\\frac{13.6\\text{ eV}}{n^2} \\quad | \\quad \\Delta E = h\\nu';
        } else if (visualScene.type === 'circuit_electronics') {
          visualScene.formula = 'V = I \\cdot R \\quad | \\quad P = I^2 R';
        } else if (visualScene.type === 'water_rainwater_system') {
          visualScene.formula = 'V = A \\cdot h \\cdot \\eta';
        } else if (visualScene.type === 'photosynthesis_bio') {
          visualScene.formula = '6CO_2 + 6H_2O + \\text{light} \\to C_6H_{12}O_6 + 6O_2';
        } else if (visualScene.type === 'orbital_gravity') {
          visualScene.formula = 'F = G \\frac{m_1 m_2}{r^2} \\quad | \\quad v = \\sqrt{\\frac{GM}{r}}';
        } else if (visualScene.type === 'calculus_riemann') {
          visualScene.formula = '\\int_a^b f(x)\\,dx = \\lim_{N \\to \\infty} \\sum_{i=1}^N f(x_i)\\,\\Delta x';
        } else if (visualScene.type === 'vector_transform') {
          visualScene.formula = 'T(\\vec{v}) = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix}';
        } else if (visualScene.type === 'fourier_waves') {
          visualScene.formula = 'f(t) = \\sum_{n=1}^\\infty A_n \\sin(n\\omega t + \\phi_n)';
        } else if (visualScene.type === 'neural_network') {
          visualScene.formula = 'a^{(l)} = \\sigma(W \\cdot a^{(l-1)} + b)';
        }
      }

      // Generate spoken audio with 4s timeout
      const audioBase64 = await withTimeout(generateSpeechAudio(replyText, voice), 4000, null);

      return res.json({
        text: replyText,
        visualScene,
        audioBase64,
        audioMimeType: 'audio/wav',
      });
    } catch (err: any) {
      console.error('Tutor chat error:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate tutor response',
      });
    }
  });

  // Audio transcription fallback using gemini-3.5-transcribe
  app.post('/api/tutor/transcribe', async (req, res) => {
    try {
      const { audioData, mimeType } = req.body;
      if (!audioData) {
        return res.status(400).json({ error: 'Missing audioData' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: audioData,
              },
            },
            {
              text: "Transcribe the student's spoken message accurately. Return only the exact transcription text with no additional commentary.",
            },
          ],
        },
      });

      const transcribedText = response.text?.trim() || '';
      res.json({ text: transcribedText });
    } catch (err: any) {
      console.error('Transcription error:', err);
      res.status(500).json({
        error: err.message || 'Failed to transcribe audio',
      });
    }
  });

  // Ensure any API 404 returns JSON, never HTML
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // Mount Vite or static dist
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Personal Tutor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
