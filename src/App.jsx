import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import SentenceCard from './components/SentenceCard';
import ASRFeedback from './components/ASRFeedback';
import ManualSpeechSimulator from './components/ManualSpeechSimulator';
import SentenceListModal from './components/SentenceListModal';
import { fetchSentencesFromDB, getDefaultSentences } from './utils/dbParser';
import { compareSentences } from './utils/diff';
import { TTSPlayer, ASRListener } from './utils/speech';
import { Sparkles, Info, RefreshCw } from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState('dark');

  // Sentences Database state
  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Audio Speech engines
  const ttsRef = useRef(null);
  const asrRef = useRef(null);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(0.9);

  const [isListeningASR, setIsListeningASR] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [asrSupported, setAsrSupported] = useState(true);

  // Evaluation & Results
  const [evaluationResult, setEvaluationResult] = useState(null);

  // User Stats
  const [stats, setStats] = useState({
    totalPracticed: 0,
    totalAccuracy: 0,
    perfectScores: 0
  });

  // Initialize Speech Engines & Fetch db.txt
  useEffect(() => {
    ttsRef.current = new TTSPlayer();
    asrRef.current = new ASRListener();
    setAsrSupported(asrRef.current.isSupported);

    loadSentences();

    // Load saved stats from localStorage
    try {
      const savedStats = localStorage.getItem('mandarin_asr_stats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (e) {
      console.warn('Could not parse saved stats:', e);
    }
  }, []);

  const loadSentences = async () => {
    setIsLoading(true);
    const data = await fetchSentencesFromDB();
    setSentences(data);
    setCurrentIndex(0);
    setIsLoading(false);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const currentSentence = sentences[currentIndex] || getDefaultSentences()[0];

  // Navigation handlers
  const handlePrev = () => {
    stopAllAudio();
    setEvaluationResult(null);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : sentences.length - 1));
  };

  const handleNext = () => {
    stopAllAudio();
    setEvaluationResult(null);
    setCurrentIndex((prev) => (prev < sentences.length - 1 ? prev + 1 : 0));
  };

  const handleRandom = () => {
    stopAllAudio();
    setEvaluationResult(null);
    const randomIndex = Math.floor(Math.random() * sentences.length);
    setCurrentIndex(randomIndex);
  };

  const stopAllAudio = () => {
    if (ttsRef.current) ttsRef.current.stop();
    if (asrRef.current) asrRef.current.stopListening();
    setIsPlayingTTS(false);
    setIsListeningASR(false);
  };

  // TTS Playback handler
  const handleSpeakTTS = () => {
    if (isPlayingTTS) {
      ttsRef.current.stop();
      setIsPlayingTTS(false);
      return;
    }

    if (isListeningASR) {
      handleStopASR();
    }

    setIsPlayingTTS(true);
    ttsRef.current.speak(currentSentence.targetText, {
      rate: ttsSpeed,
      onStart: () => setIsPlayingTTS(true),
      onEnd: () => setIsPlayingTTS(false),
      onError: (err) => {
        setIsPlayingTTS(false);
        console.warn('TTS Playback notice:', err);
      }
    });
  };

  // ASR Listening handler
  const handleStartASR = () => {
    if (isPlayingTTS) {
      ttsRef.current.stop();
      setIsPlayingTTS(false);
    }

    setEvaluationResult(null);
    setInterimTranscript('');
    setIsListeningASR(true);

    const started = asrRef.current.startListening({
      onResult: ({ transcript }) => {
        setInterimTranscript(transcript);
      },
      onEnd: (finalTranscript) => {
        setIsListeningASR(false);
        const textToEvaluate = finalTranscript || interimTranscript;
        if (textToEvaluate) {
          evaluateSpeech(textToEvaluate);
        }
      },
      onError: (errMessage) => {
        setIsListeningASR(false);
        alert(`ASR Microphone Notice: ${errMessage}`);
      }
    });

    if (!started) {
      setIsListeningASR(false);
    }
  };

  const handleStopASR = () => {
    if (asrRef.current) {
      asrRef.current.stopListening();
    }
    setIsListeningASR(false);
  };

  // Evaluate spoken text against current target sentence
  const evaluateSpeech = (spokenText) => {
    if (!currentSentence) return;

    const result = compareSentences(currentSentence.targetText, spokenText);
    setEvaluationResult(result);

    // Trigger celebration confetti if score is 100% or > 90%
    if (result.accuracyScore >= 90) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti optional fallback
      }
    }

    // Update stats
    setStats((prev) => {
      const updated = {
        totalPracticed: prev.totalPracticed + 1,
        totalAccuracy: prev.totalAccuracy + result.accuracyScore,
        perfectScores: prev.perfectScores + (result.accuracyScore === 100 ? 1 : 0)
      };
      try {
        localStorage.setItem('mandarin_asr_stats', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleAddCustomSentence = (newSentence) => {
    setSentences((prev) => [newSentence, ...prev]);
    setCurrentIndex(0);
    setEvaluationResult(null);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '0 20px 60px 20px' }}>
      {/* Top Navigation & Header */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenDb={() => setIsDbModalOpen(true)}
        stats={stats}
      />

      {/* Main Content */}
      <main>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid rgba(99, 102, 241, 0.2)',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>
              Loading sentences from db.txt...
            </p>
          </div>
        ) : (
          <>
            {/* Sentence Card with TTS & ASR controls */}
            <SentenceCard
              sentence={currentSentence}
              onPrev={handlePrev}
              onNext={handleNext}
              onRandom={handleRandom}
              onSpeakTTS={handleSpeakTTS}
              isPlayingTTS={isPlayingTTS}
              onStartASR={handleStartASR}
              onStopASR={handleStopASR}
              isListeningASR={isListeningASR}
              interimTranscript={interimTranscript}
              ttsSpeed={ttsSpeed}
              setTtsSpeed={setTtsSpeed}
              asrSupported={asrSupported}
            />

            {/* ASR Feedback and Pronunciation Diff Results */}
            {evaluationResult && (
              <ASRFeedback
                result={evaluationResult}
                onRetry={() => setEvaluationResult(null)}
                onListenCorrect={handleSpeakTTS}
                onNext={handleNext}
              />
            )}

            {/* Manual Speech Simulator / Test Mode */}
            <ManualSpeechSimulator
              targetText={currentSentence.targetText}
              onEvaluateText={evaluateSpeech}
            />
          </>
        )}
      </main>

      {/* Sentence Library Modal */}
      <SentenceListModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        sentences={sentences}
        currentSentenceId={currentSentence.id}
        onSelectSentence={(s) => {
          stopAllAudio();
          setEvaluationResult(null);
          const index = sentences.findIndex((item) => item.id === s.id);
          if (index !== -1) setCurrentIndex(index);
        }}
        onAddCustomSentence={handleAddCustomSentence}
        onReloadDB={loadSentences}
      />
    </div>
  );
}
