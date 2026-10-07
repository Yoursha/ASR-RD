import React, { useEffect, useRef } from 'react';
import { Music, Activity, HelpCircle } from 'lucide-react';
import { TONE_MAP } from '../utils/diff';

export default function TonePitchVisualizer({ isTracking, pitchHistory, currentPitch, targetSentence }) {
  const canvasRef = useRef(null);

  // Draw real-time vocal pitch trajectory on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Draw background pitch grid lines (100Hz to 400Hz range)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;

    for (let h = 50; h < height; h += 30) {
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(width, h);
      ctx.stroke();
    }

    if (!pitchHistory || pitchHistory.length === 0) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isTracking ? 'Listening to voice pitch intonation...' : 'Speak into mic to visualize pitch intonation contour', width / 2, height / 2);
      return;
    }

    // Min and Max Hz normalization
    const minHz = 80;
    const maxHz = 380;

    // Draw pitch trajectory path
    ctx.beginPath();
    ctx.strokeStyle = '#a855f7'; // Purple pitch line
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let started = false;
    pitchHistory.forEach((pt, idx) => {
      const x = (idx / Math.max(1, pitchHistory.length - 1)) * width;
      // Invert Y axis: higher pitch -> top of canvas
      const normalizedPitch = Math.max(minHz, Math.min(maxHz, pt.pitchHz));
      const y = height - ((normalizedPitch - minHz) / (maxHz - minHz)) * (height - 20) - 10;

      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw current active pitch glowing point
    if (currentPitch && pitchHistory.length > 0) {
      const lastX = width;
      const normalizedPitch = Math.max(minHz, Math.min(maxHz, currentPitch));
      const lastY = height - ((normalizedPitch - minHz) / (maxHz - minHz)) * (height - 20) - 10;

      ctx.beginPath();
      ctx.arc(lastX - 5, lastY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#ec4899';
      ctx.fill();
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 10;
    }
  }, [pitchHistory, currentPitch, isTracking]);

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid var(--card-border)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
      marginTop: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Music size={18} color="#c084fc" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc' }}>
            Real-Time Pitch & Intonation Tracker (声调调值)
          </h4>
        </div>
        {currentPitch && (
          <span style={{
            fontSize: '0.82rem',
            background: 'rgba(168, 85, 247, 0.2)',
            color: '#e9d5ff',
            padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            fontWeight: '600'
          }}>
            Vocal F0: {currentPitch} Hz
          </span>
        )}
      </div>

      {/* Real-time Pitch Canvas */}
      <div style={{ position: 'relative', width: '100%', height: '110px', marginBottom: '16px' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={110}
          style={{
            width: '100%',
            height: '110px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        />
      </div>

      {/* Mandarin 4 Tones Intonation Reference Cards */}
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
        Mandarin Chinese 4 Tones Pitch Contour Reference:
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '10px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>1st Tone (阴平 55)</strong>
          <span style={{ fontSize: '1.4rem', color: '#38bdf8', fontWeight: 'bold' }}>¯</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2px' }}>
            High Level (mā)
          </span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <strong style={{ color: '#34d399', fontSize: '0.9rem' }}>2nd Tone (阳平 35)</strong>
          <span style={{ fontSize: '1.4rem', color: '#34d399', fontWeight: 'bold' }}>ˊ</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2px' }}>
            Rising Pitch (má)
          </span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <strong style={{ color: '#fbbf24', fontSize: '0.9rem' }}>3rd Tone (上声 214)</strong>
          <span style={{ fontSize: '1.4rem', color: '#fbbf24', fontWeight: 'bold' }}>ˇ</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2px' }}>
            Low Dipping (mǎ)
          </span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <strong style={{ color: '#f87171', fontSize: '0.9rem' }}>4th Tone (去声 51)</strong>
          <span style={{ fontSize: '1.4rem', color: '#f87171', fontWeight: 'bold' }}>ˋ</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2px' }}>
            High Falling (mà)
          </span>
        </div>
      </div>
    </div>
  );
}
