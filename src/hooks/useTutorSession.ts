import { useState, useEffect, useRef, useCallback } from 'react';
import { TutorState } from '../components/TutorAvatar';
import { ChatMessage } from '../components/TranscriptView';
import { VisualScene } from '../types/visuals';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const DEFAULT_GREETING =
  "Hey! I'm your personal tutor. What would you like to explore today? You can ask me anything about neural networks, math, or science, and we'll visualize it step-by-step!";

const INITIAL_VISUAL_SCENE: VisualScene = {
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

export function useTutorSession() {
  const [tutorState, setTutorState] = useState<TutorState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visualScene, setVisualScene] = useState<VisualScene | null>(INITIAL_VISUAL_SCENE);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isSessionStarted, setIsSessionStarted] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio playback references
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentHtmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const speechIntervalRef = useRef<number | null>(null);

  // Mic capture references
  const recognitionRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micAudioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const interruptTutor = useCallback(() => {
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
        currentAudioSourceRef.current.disconnect();
      } catch (_) {}
      currentAudioSourceRef.current = null;
    }

    if (currentHtmlAudioRef.current) {
      try {
        currentHtmlAudioRef.current.pause();
        currentHtmlAudioRef.current.currentTime = 0;
      } catch (_) {}
      currentHtmlAudioRef.current = null;
    }

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    if (speechIntervalRef.current) {
      clearInterval(speechIntervalRef.current);
      speechIntervalRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setAudioLevel(0);
    setTutorState('idle');
  }, []);

  const speakWithBrowserSpeech = useCallback(
    (text: string) => {
      interruptTutor();

      if (!('speechSynthesis' in window)) {
        setTutorState('idle');
        return;
      }

      setTutorState('speaking');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.96;
      utterance.pitch = 1.05;

      speechIntervalRef.current = window.setInterval(() => {
        setAudioLevel(0.25 + Math.random() * 0.5);
      }, 110);

      utterance.onend = () => {
        if (speechIntervalRef.current) {
          clearInterval(speechIntervalRef.current);
          speechIntervalRef.current = null;
        }
        setAudioLevel(0);
        setTutorState('idle');
      };

      utterance.onerror = () => {
        if (speechIntervalRef.current) {
          clearInterval(speechIntervalRef.current);
          speechIntervalRef.current = null;
        }
        setAudioLevel(0);
        setTutorState('idle');
      };

      window.speechSynthesis.speak(utterance);
    },
    [interruptTutor]
  );

  const playAudioBase64 = useCallback(
    async (base64Audio: string, fallbackText?: string) => {
      if (!base64Audio) {
        if (fallbackText) speakWithBrowserSpeech(fallbackText);
        return;
      }

      interruptTutor();
      setTutorState('speaking');

      try {
        const audioCtx = getAudioContext();
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.5;
        analyserRef.current = analyser;

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        currentAudioSourceRef.current = source;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudioLevel = () => {
          if (analyserRef.current && currentAudioSourceRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length / 255;
            setAudioLevel(average * 1.8);
            animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
          }
        };
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);

        source.onended = () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          currentAudioSourceRef.current = null;
          setAudioLevel(0);
          setTutorState('idle');
        };

        source.start(0);
      } catch (err) {
        console.warn('Audio buffer playback notice:', err);
        if (fallbackText) speakWithBrowserSpeech(fallbackText);
        else setTutorState('idle');
      }
    },
    [getAudioContext, interruptTutor, speakWithBrowserSpeech]
  );

  const submitStudentMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      interruptTutor();

      const userMsg: ChatMessage = {
        id: `student-${Date.now()}`,
        role: 'student',
        text: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInterimTranscript('');
      setTutorState('thinking');
      setErrorMessage(null);

      try {
        const history = [...messages, userMsg].map((m) => ({
          role: m.role === 'tutor' ? 'tutor' : 'user',
          content: m.text,
        }));

        const response = await fetch('/api/tutor/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            voice: selectedVoice,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (!response.ok || !contentType.includes('application/json')) {
          throw new Error('Connection took too long. Please ask again!');
        }

        const data = await response.json();
        const replyText =
          data.text || "I'm right here with you! Let's examine this visual diagram together.";

        // Update visual scene if returned
        if (data.visualScene) {
          setVisualScene(data.visualScene);
        }

        const tutorMsg: ChatMessage = {
          id: `tutor-${Date.now()}`,
          role: 'tutor',
          text: replyText,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, tutorMsg]);

        if (data.audioBase64) {
          await playAudioBase64(data.audioBase64, replyText);
        } else {
          speakWithBrowserSpeech(replyText);
        }
      } catch (err: any) {
        console.error('Failed to get tutor response:', err);
        setErrorMessage(err.message || 'Could not connect to the tutor. Please try again.');
        setTutorState('idle');
      }
    },
    [messages, selectedVoice, interruptTutor, playAudioBase64, speakWithBrowserSpeech]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (micAudioContextRef.current) {
      try {
        micAudioContextRef.current.close();
      } catch (_) {}
      micAudioContextRef.current = null;
    }

    setTutorState('idle');
    setAudioLevel(0);
  }, []);

  const startListening = useCallback(async () => {
    interruptTutor();
    setErrorMessage(null);
    setInterimTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const micAudioCtx = new AudioCtx();
      micAudioContextRef.current = micAudioCtx;
      const source = micAudioCtx.createMediaStreamSource(stream);
      const analyser = micAudioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      micAnalyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const monitorMicLevel = () => {
        if (micAnalyserRef.current && micStreamRef.current) {
          micAnalyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length / 255;
          setAudioLevel(Math.min(1, avg * 2.2));
          requestAnimationFrame(monitorMicLevel);
        }
      };
      requestAnimationFrame(monitorMicLevel);

      setTutorState('listening');

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalSpeechText = '';

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalSpeechText += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          setInterimTranscript(interim || finalSpeechText);
        };

        recognition.onerror = () => {
          stopListening();
        };

        recognition.onend = () => {
          stopListening();
          const spoken = finalSpeechText.trim() || interimTranscript.trim();
          if (spoken) {
            submitStudentMessage(spoken);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size > 1000) {
            setTutorState('thinking');
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1];
              const res = await fetch('/api/tutor/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioData: base64Audio, mimeType: 'audio/webm' }),
              });
              const resJson = await res.json().catch(() => ({}));
              if (resJson.text) {
                submitStudentMessage(resJson.text);
              } else {
                setTutorState('idle');
              }
            };
          } else {
            setTutorState('idle');
          }
        };

        mediaRecorder.start();
      }
    } catch (err: any) {
      console.warn('Microphone error:', err);
      setErrorMessage(
        'Microphone is unavailable or permissions were denied. You can type your questions in the box below!'
      );
      stopListening();
    }
  }, [interruptTutor, stopListening, submitStudentMessage, interimTranscript]);

  const toggleListening = useCallback(() => {
    if (tutorState === 'listening') stopListening();
    else startListening();
  }, [tutorState, startListening, stopListening]);

  const startSession = useCallback(async () => {
    setIsSessionStarted(true);

    const greetingMsg: ChatMessage = {
      id: `greeting-${Date.now()}`,
      role: 'tutor',
      text: DEFAULT_GREETING,
      timestamp: new Date(),
    };

    setMessages([greetingMsg]);
    setVisualScene(INITIAL_VISUAL_SCENE);

    speakWithBrowserSpeech(DEFAULT_GREETING);

    fetch('/api/tutor/greeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voice: selectedVoice }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.visualScene) setVisualScene(data.visualScene);
        if (data?.audioBase64) playAudioBase64(data.audioBase64, DEFAULT_GREETING);
      })
      .catch(() => {});
  }, [selectedVoice, speakWithBrowserSpeech, playAudioBase64]);

  const setVisualSceneStep = useCallback((stepIndex: number) => {
    setVisualScene((prev) => (prev ? { ...prev, currentStepIndex: stepIndex } : null));
  }, []);

  useEffect(() => {
    return () => {
      interruptTutor();
      stopListening();
    };
  }, [interruptTutor, stopListening]);

  return {
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
    startListening,
    stopListening,
    submitStudentMessage,
  };
}
