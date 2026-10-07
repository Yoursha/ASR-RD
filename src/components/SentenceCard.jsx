import React, { useState } from 'react';
import { Volume2, Mic, MicOff, ChevronLeft, ChevronRight, Shuffle, Gauge, Layers, Info } from 'lucide-react';
import { getSentencePinyin } from '../utils/diff';

export default function SentenceCard({
  sentence,
  onPrev,
  onNext,
  onRandom,
  onSpeakTTS,
  isPlayingTTS,
  onStartASR,
  onStopASR,
  isListeningASR,
  interimTranscript,
  ttsSpeed,
  setTtsSpeed,
  asrSupported
}) {
  const pinyinList = getSentencePinyin(sentence.targetText);
  const targetChars = Array.from(sentence.targetText);

  return (
    <div className="glass-panel" style={{
      borderRadius: 'var(--radius-lg)',
      padding: '32px',
      maxWidth: '900px',
      margin: '0 auto 28px auto',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Bar: Category & Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: 'rgba(99, 102, 241, 0.18)',
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Layers size={14} />
            {sentence.category || 'General'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Source: <code style={{ color: '#818cf8' }}>db.txt</code>
          </span>
        </div>

        {/* Sentence Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onPrev}
            className="btn-secondary"
            style={{ padding: '8px 12px' }}
            title="Previous Sentence"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onRandom}
            className="btn-secondary"
            style={{ padding: '8px 12px' }}
            title="Random Sentence"
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={onNext}
            className="btn-secondary"
            style={{ padding: '8px 12px' }}
            title="Next Sentence"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Main Chinese Sentence Display with Pinyin */}
      <div style={{
        textAlign: 'center',
        padding: '24px 16px',
        background: 'rgba(0, 0, 0, 0.15)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px 14px',
          margin: '0 auto 16px auto',
          maxWidth: '780px'
        }}>
          {targetChars.map((char, index) => {
            const isPunctuation = /^[^\u4e00-\u9fa5a-zA-Z0-9]$/.test(char);
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: isPunctuation ? '16px' : '38px'
                }}
              >
                <span style={{
                  fontSize: '0.85rem',
                  color: '#818cf8',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginBottom: '4px',
                  fontWeight: '500',
                  height: '18px'
                }}>
                  {pinyinList[index] || ''}
                </span>
                <span style={{
                  fontSize: '2.2rem',
                  fontWeight: '700',
                  lineHeight: '1.1',
                  color: 'var(--text-main)'
                }}>
                  {char}
                </span>
              </div>
            );
          })}
        </div>

        {/* Translation */}
        <p style={{
          fontSize: '1.05rem',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          marginTop: '8px'
        }}>
          "{sentence.translation}"
        </p>
      </div>

      {/* Audio & Mic Action Panel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        {/* TTS Speaker Control Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onSpeakTTS}
            className="btn-primary"
            style={{
              background: isPlayingTTS
                ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              padding: '14px 28px',
              fontSize: '1rem'
            }}
          >
            <Volume2 size={22} className={isPlayingTTS ? 'pulse' : ''} />
            <span>{isPlayingTTS ? 'Listening...' : 'Listen (TTS)'}</span>

            {isPlayingTTS && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '6px' }}>
                <span className="speaker-bar"></span>
                <span className="speaker-bar"></span>
                <span className="speaker-bar"></span>
              </div>
            )}
          </button>

          {/* Speed Selector */}
          <select
            value={ttsSpeed}
            onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
            style={{
              background: 'rgba(0,0,0,0.3)',
              color: 'var(--text-main)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 10px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
            title="TTS Speech Speed"
          >
            <option value={0.75}>0.75x (Slow)</option>
            <option value={0.9}>0.9x (Normal)</option>
            <option value={1.1}>1.1x (Fast)</option>
          </select>
        </div>

        {/* Mic ASR Control Button */}
        <button
          onClick={isListeningASR ? onStopASR : onStartASR}
          className={`btn-primary ${isListeningASR ? 'mic-active' : ''}`}
          style={{
            background: isListeningASR
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '14px 32px',
            fontSize: '1.05rem',
            boxShadow: isListeningASR ? '0 0 25px rgba(239, 68, 68, 0.6)' : '0 4px 14px rgba(16, 185, 129, 0.4)'
          }}
        >
          {isListeningASR ? <MicOff size={22} /> : <Mic size={22} />}
          <span>{isListeningASR ? 'Stop & Evaluate' : 'Click Mic to Speak'}</span>

          {isListeningASR && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '8px' }}>
              <span className="wave-bar"></span>
              <span className="wave-bar"></span>
              <span className="wave-bar"></span>
              <span className="wave-bar"></span>
            </div>
          )}
        </button>
      </div>

      {/* Live Transcript Display while recording */}
      {isListeningASR && (
        <div style={{
          marginTop: '20px',
          padding: '14px 20px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#fca5a5', marginBottom: '4px', fontWeight: '600' }}>
            🎙️ Listening to your speech (ASR active)...
          </div>
          <p style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#ffffff',
            minHeight: '28px'
          }}>
            {interimTranscript || 'Speak now...'}
          </p>
        </div>
      )}

      {!asrSupported && (
        <div style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#f59e0b',
          fontSize: '0.85rem',
          justifyContent: 'center',
          background: 'rgba(245, 158, 11, 0.1)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-sm)'
        }}>
          <Info size={16} />
          Note: Web Speech Recognition works best on Google Chrome / Microsoft Edge desktop browsers.
        </div>
      )}
    </div>
  );
}
