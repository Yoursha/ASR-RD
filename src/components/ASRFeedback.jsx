import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, PlusCircle, RefreshCw, Volume2, ArrowRight, Music, Sparkles } from 'lucide-react';

export default function ASRFeedback({ result, onRetry, onListenCorrect, onNext }) {
  if (!result) return null;

  const {
    alignedTarget,
    extraSpoken,
    accuracyScore,
    intonationScore,
    correctCount,
    intonationErrorCount,
    phonemeErrorCount,
    missingCount,
    totalChars,
    rawAsrText,
    targetText
  } = result;

  // Grade labels
  let gradeColor = '#10b981';
  let gradeLabel = '🌟 Perfect Pronunciation & Intonation!';
  let gradeBg = 'rgba(16, 185, 129, 0.15)';

  if (accuracyScore < 60) {
    gradeColor = '#ef4444';
    gradeLabel = '💪 Needs Practice';
    gradeBg = 'rgba(239, 68, 68, 0.15)';
  } else if (intonationErrorCount > 0) {
    gradeColor = '#f59e0b';
    gradeLabel = '🎵 Syllable Correct, Fix Tone Intonation!';
    gradeBg = 'rgba(245, 158, 11, 0.15)';
  } else if (accuracyScore < 90) {
    gradeColor = '#f59e0b';
    gradeLabel = '👍 Good Effort!';
    gradeBg = 'rgba(245, 158, 11, 0.15)';
  }

  // Filter specific intonation error items
  const intonationMistakes = alignedTarget.filter(item => item.errorType === 'intonation_mistake');
  const phonemeMistakes = alignedTarget.filter(item => item.errorType === 'phoneme_mistake');

  return (
    <div className="glass-panel" style={{
      borderRadius: 'var(--radius-lg)',
      padding: '32px',
      maxWidth: '900px',
      margin: '0 auto 40px auto',
      boxShadow: 'var(--shadow-glow)'
    }}>
      {/* Result Header & Dual Gauges */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '20px',
        borderBottom: '1px solid var(--card-border)',
        paddingBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Overall Accuracy Gauge */}
          <div style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            background: gradeBg,
            border: `3px solid ${gradeColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            boxShadow: `0 0 20px ${gradeBg}`
          }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: gradeColor }}>
              {accuracyScore}%
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Overall</span>
          </div>

          {/* Intonation Sub-Score Gauge */}
          <div style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '3px solid #c084fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)'
          }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#c084fc' }}>
              {intonationScore}%
            </span>
            <span style={{ fontSize: '0.65rem', color: '#e9d5ff' }}>Intonation</span>
          </div>

          <div>
            <span style={{
              background: gradeBg,
              color: gradeColor,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: '700'
            }}>
              {gradeLabel}
            </span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginTop: '6px' }}>
              Speech & Tone Analysis Result
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Correct: {correctCount}/{totalChars} chars | Tone Errors: {intonationErrorCount}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={onRetry} className="btn-secondary">
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
          <button onClick={onListenCorrect} className="btn-secondary">
            <Volume2 size={16} color="#818cf8" />
            <span>Listen Correct</span>
          </button>
          <button onClick={onNext} className="btn-primary">
            <span>Next Sentence</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Spoken Text Transcribed */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '14px 20px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
        border: '1px solid var(--card-border)'
      }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          ASR Speech Transcribed:
        </div>
        <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f8fafc' }}>
          {rawAsrText ? `"${rawAsrText}"` : <span style={{ color: '#ef4444' }}>(No speech detected)</span>}
        </p>
      </div>

      {/* Legend & Key */}
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '16px',
        fontSize: '0.82rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} color="#10b981" />
          <span>Correct Tone & Syllable (正确)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Music size={14} color="#f59e0b" />
          <span style={{ color: '#f59e0b', fontWeight: '600' }}>Intonation / Tone Mistake (声调错误)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <XCircle size={14} color="#ef4444" />
          <span>Phoneme / Syllable Mistake (发音错误)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={14} color="#f59e0b" />
          <span>Omitted (漏读)</span>
        </div>
      </div>

      {/* Character-by-Character Visual Diff Grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px 14px',
        justifyContent: 'flex-start',
        marginBottom: '28px',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 'var(--radius-md)'
      }}>
        {alignedTarget.map((item, index) => {
          const isPunct = /^[^\u4e00-\u9fa5a-zA-Z0-9]$/.test(item.char);

          if (isPunct) {
            return (
              <div key={index} style={{ fontSize: '1.8rem', opacity: 0.6, alignSelf: 'flex-end', paddingBottom: '8px' }}>
                {item.char}
              </div>
            );
          }

          const isToneErr = item.errorType === 'intonation_mistake';

          return (
            <div
              key={index}
              className={`char-card ${isToneErr ? 'status-missing' : `status-${item.status}`}`}
              style={{
                borderColor: isToneErr ? '#f59e0b' : undefined,
                background: isToneErr ? 'rgba(245, 158, 11, 0.18)' : undefined
              }}
            >
              {/* Target Pinyin */}
              <span style={{ fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace', opacity: 0.9 }}>
                {item.pinyin}
              </span>

              {/* Target Character */}
              <span style={{ fontSize: '1.8rem', fontWeight: '700', margin: '2px 0' }}>
                {item.char}
              </span>

              {/* Status Indicator */}
              {item.status === 'correct' && (
                <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <CheckCircle2 size={12} /> Correct
                </span>
              )}

              {isToneErr && (
                <div style={{
                  fontSize: '0.72rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: '#f59e0b',
                  fontWeight: '600'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Music size={12} /> Tone Error
                  </span>
                  <span>Spoken: {item.spokenPinyin}</span>
                </div>
              )}

              {item.status === 'wrong' && !isToneErr && (
                <div style={{ fontSize: '0.72rem', textAlign: 'center' }}>
                  <span style={{ fontWeight: '600' }}>Spoken: {item.spoken}</span>
                  {item.spokenPinyin && <span style={{ opacity: 0.8 }}><br/>({item.spokenPinyin})</span>}
                </div>
              )}

              {item.status === 'missing' && (
                <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <AlertTriangle size={12} /> Omitted
                </span>
              )}
            </div>
          );
        })}

        {/* Extra spoken characters */}
        {extraSpoken.map((extra, index) => (
          <div key={`extra-${index}`} className="char-card status-extra">
            <span style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace' }}>
              {extra.pinyin}
            </span>
            <span style={{ fontSize: '1.8rem', fontWeight: '700', margin: '2px 0' }}>
              {extra.char}
            </span>
            <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <PlusCircle size={12} /> Extra
            </span>
          </div>
        ))}
      </div>

      {/* Intonation Mistakes Specific Focus Box */}
      {intonationMistakes.length > 0 && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Music size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fbbf24' }}>
              🎵 Intonation & Tone Correction Guide ({intonationMistakes.length} tone issues)
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {intonationMistakes.map((item, idx) => (
              <div
                key={`tone-err-${idx}`}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '4px solid #f59e0b'
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                  Character <span style={{ color: '#fbbf24', fontSize: '1.1rem' }}>"{item.char}"</span> ({item.pinyin}):
                  You said <span style={{ color: '#ef4444' }}>"{item.spoken}"</span> ({item.spokenPinyin})
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  • Expected: <strong>Tone {item.toneMistakeInfo.expectedTone} ({item.toneMistakeInfo.expectedMark})</strong> vs Spoken: <span style={{ color: '#fca5a5' }}>Tone {item.toneMistakeInfo.spokenTone} ({item.toneMistakeInfo.spokenMark})</span>
                </div>
                <div style={{ fontSize: '0.83rem', color: '#93c5fd', marginTop: '4px', fontStyle: 'italic' }}>
                  💡 Tip: {item.toneMistakeInfo.pitchTip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Phoneme / General Mistakes Breakdown */}
      {phonemeMistakes.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fca5a5', marginBottom: '12px' }}>
            🔍 Syllable & Character Mistakes Breakdown:
          </h3>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            {phonemeMistakes.map((item, idx) => (
              <li key={`p-${idx}`}>
                Expected <strong style={{ color: '#ffffff' }}>"{item.char}"</strong> ({item.pinyin}), but spoken as <span style={{ color: '#ef4444', fontWeight: '600' }}>"{item.spoken}"</span> ({item.spokenPinyin}).
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
