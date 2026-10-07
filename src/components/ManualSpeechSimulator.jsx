import React, { useState } from 'react';
import { Sparkles, Terminal, Play, RotateCcw } from 'lucide-react';

export default function ManualSpeechSimulator({ targetText, onEvaluateText }) {
  const [inputText, setInputText] = useState('');

  const handleTestSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onEvaluateText(inputText.trim());
    }
  };

  // Preset mistake scenarios for rapid testing & demonstration
  const handlePresetScenarios = (type) => {
    if (!targetText) return;
    const chars = Array.from(targetText);

    if (type === 'perfect') {
      // Exact target sentence
      setInputText(targetText);
      onEvaluateText(targetText);
    } else if (type === 'wrong') {
      // Mispronounce a character (e.g., substitute one character)
      const modified = chars.map((c, i) => {
        if (i === 1) return '心'; // Replace char with '心'
        return c;
      }).join('');
      setInputText(modified);
      onEvaluateText(modified);
    } else if (type === 'missing') {
      // Skip the second character
      const modified = chars.filter((_, i) => i !== 1).join('');
      setInputText(modified);
      onEvaluateText(modified);
    } else if (type === 'extra') {
      // Add extra words
      const modified = targetText + ' 对不对';
      setInputText(modified);
      onEvaluateText(modified);
    }
  };

  return (
    <div className="glass-panel" style={{
      borderRadius: 'var(--radius-lg)',
      padding: '24px 32px',
      maxWidth: '900px',
      margin: '0 auto 40px auto',
      background: 'rgba(15, 23, 42, 0.5)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px'
      }}>
        <Terminal size={20} color="#818cf8" />
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>
          ASR Speech Simulator & Custom Test Mode
        </h3>
        <span style={{
          fontSize: '0.75rem',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          color: 'var(--text-muted)'
        }}>
          Test Diff Engine
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        You can speak using the microphone above OR simulate ASR speech input directly below to test error detection:
      </p>

      {/* Preset Action Pills */}
      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => handlePresetScenarios('perfect')}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '6px 14px', border: '1px solid rgba(16, 185, 129, 0.4)' }}
        >
          ✨ Simulate 100% Perfect Speech
        </button>
        <button
          onClick={() => handlePresetScenarios('wrong')}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '6px 14px', border: '1px solid rgba(239, 68, 68, 0.4)' }}
        >
          ❌ Simulate Mispronounced Character
        </button>
        <button
          onClick={() => handlePresetScenarios('missing')}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '6px 14px', border: '1px solid rgba(245, 158, 11, 0.4)' }}
        >
          ⚠️ Simulate Omitted/Skipped Word
        </button>
        <button
          onClick={() => handlePresetScenarios('extra')}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '6px 14px', border: '1px solid rgba(139, 92, 246, 0.4)' }}
        >
          ➕ Simulate Extra Spoken Words
        </button>
      </div>

      {/* Manual Speech Text Input */}
      <form onSubmit={handleTestSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Type or paste what ASR heard..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-main)',
            fontSize: '0.95rem'
          }}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '10px 20px', fontSize: '0.9rem' }}
        >
          <Play size={16} />
          <span>Compare Speech</span>
        </button>
      </form>
    </div>
  );
}
