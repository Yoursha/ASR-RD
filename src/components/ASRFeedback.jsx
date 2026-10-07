import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, PlusCircle, RefreshCw, Volume2, ArrowRight, Award } from 'lucide-react';

export default function ASRFeedback({ result, onRetry, onListenCorrect, onNext }) {
  if (!result) return null;

  const { alignedTarget, extraSpoken, accuracyScore, correctCount, totalChars, rawAsrText, targetText } = result;

  // Determine feedback badge color & message
  let gradeColor = '#10b981'; // Green
  let gradeLabel = '🌟 Perfect Pronunciation!';
  let gradeBg = 'rgba(16, 185, 129, 0.15)';

  if (accuracyScore < 60) {
    gradeColor = '#ef4444';
    gradeLabel = '💪 Needs Practice';
    gradeBg = 'rgba(239, 68, 68, 0.15)';
  } else if (accuracyScore < 90) {
    gradeColor = '#f59e0b';
    gradeLabel = '👍 Good Effort!';
    gradeBg = 'rgba(245, 158, 11, 0.15)';
  }

  // Count errors
  const wrongItems = alignedTarget.filter(item => item.status === 'wrong');
  const missingItems = alignedTarget.filter(item => item.status === 'missing');

  return (
    <div className="glass-panel" style={{
      borderRadius: 'var(--radius-lg)',
      padding: '32px',
      maxWidth: '900px',
      margin: '0 auto 40px auto',
      boxShadow: 'var(--shadow-glow)'
    }}>
      {/* Result Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid var(--card-border)',
        paddingBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Accuracy Percentage Wheel */}
          <div style={{
            width: '70px',
            height: '70px',
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
              Pronunciation Analysis Result
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Correct: {correctCount} / {totalChars} characters
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

      {/* Spoken Text Comparison Badge */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '14px 20px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '28px',
        border: '1px solid var(--card-border)'
      }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          ASR Speech Transcribed:
        </div>
        <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f8fafc' }}>
          {rawAsrText ? `"${rawAsrText}"` : <span style={{ color: '#ef4444' }}>(No speech detected or empty input)</span>}
        </p>
      </div>

      {/* Legend & Instructions */}
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '20px',
        fontSize: '0.82rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} color="#10b981" />
          <span>Correct (正确)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <XCircle size={14} color="#ef4444" />
          <span>Mispronounced (读错)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={14} color="#f59e0b" />
          <span>Omitted / Skipped (漏读)</span>
        </div>
        {extraSpoken.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={14} color="#8b5cf6" />
            <span>Extra Spoken (多读)</span>
          </div>
        )}
      </div>

      {/* Character-by-Character Visual Diff Grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px 14px',
        justifyContent: 'flex-start',
        marginBottom: '32px',
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

          return (
            <div key={index} className={`char-card status-${item.status}`}>
              {/* Target Pinyin */}
              <span style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace', opacity: 0.9 }}>
                {item.pinyin}
              </span>

              {/* Target Character */}
              <span style={{ fontSize: '1.8rem', fontWeight: '700', margin: '2px 0' }}>
                {item.char}
              </span>

              {/* Status indicator / Spoken alternate */}
              {item.status === 'correct' && (
                <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <CheckCircle2 size={12} /> Correct
                </span>
              )}

              {item.status === 'wrong' && (
                <div style={{
                  fontSize: '0.72rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: '2px'
                }}>
                  <span style={{ fontWeight: '600' }}>Spoken: {item.spoken}</span>
                  {item.spokenPinyin && <span style={{ opacity: 0.8 }}>({item.spokenPinyin})</span>}
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

        {/* Extra spoken characters badges */}
        {extraSpoken.map((extra, index) => (
          <div key={`extra-${index}`} className="char-card status-extra">
            <span style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace', opacity: 0.9 }}>
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

      {/* Detailed Mistakes Summary Box */}
      {(wrongItems.length > 0 || missingItems.length > 0 || extraSpoken.length > 0) ? (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fca5a5', marginBottom: '12px' }}>
            🔍 Pronunciation Mistakes Breakdown:
          </h3>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            {wrongItems.map((item, idx) => (
              <li key={`w-${idx}`}>
                Mispronounced <strong style={{ color: '#ffffff' }}>"{item.char}"</strong> ({item.pinyin}): You said <span style={{ color: '#ef4444', fontWeight: '600' }}>"{item.spoken}"</span> {item.spokenPinyin ? `(${item.spokenPinyin})` : ''}.
              </li>
            ))}
            {missingItems.map((item, idx) => (
              <li key={`m-${idx}`}>
                Skipped character <strong style={{ color: '#ffffff' }}>"{item.char}"</strong> ({item.pinyin}).
              </li>
            ))}
            {extraSpoken.map((item, idx) => (
              <li key={`e-${idx}`}>
                Added extra character <strong style={{ color: '#8b5cf6' }}>"{item.char}"</strong> ({item.pinyin}) not in the target sentence.
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          textAlign: 'center',
          color: '#34d399',
          fontWeight: '600'
        }}>
          🎉 Flawless pronunciation! Every character matched perfectly!
        </div>
      )}
    </div>
  );
}
