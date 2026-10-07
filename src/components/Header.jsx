import React from 'react';
import { Volume2, Mic, Sparkles, BookOpen, Sun, Moon, Award, RefreshCw } from 'lucide-react';

export default function Header({ theme, toggleTheme, onOpenDb, stats, onResetStats }) {
  return (
    <header className="glass-panel" style={{
      borderRadius: 'var(--radius-lg)',
      padding: '16px 28px',
      margin: '20px auto 30px auto',
      maxWidth: '1200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(99, 102, 241, 0.35)'
        }}>
          <Mic size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            MandarinSpeak ASR
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            AI Speech Recognition & Pronunciation Correction
          </p>
        </div>
      </div>

      {/* Quick Stats Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '8px 18px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--card-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={16} color="#10b981" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Avg Accuracy:</span>
          <strong style={{ fontSize: '0.95rem', color: stats.totalPracticed > 0 ? '#10b981' : 'var(--text-main)' }}>
            {stats.totalPracticed > 0 ? `${Math.round(stats.totalAccuracy / stats.totalPracticed)}%` : '0%'}
          </strong>
        </div>

        <div style={{ height: '16px', width: '1px', background: 'var(--card-border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="#f59e0b" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Practiced:</span>
          <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
            {stats.totalPracticed}
          </strong>
        </div>
      </div>

      {/* Controls / Theme & DB */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onOpenDb}
          className="btn-secondary"
          title="Sentence Library (db.txt)"
          style={{ fontSize: '0.9rem' }}
        >
          <BookOpen size={18} color="#818cf8" />
          <span>db.txt Library</span>
        </button>

        <button
          onClick={toggleTheme}
          className="btn-secondary"
          title="Toggle Theme"
          style={{ padding: '10px', borderRadius: 'var(--radius-md)' }}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>
      </div>
    </header>
  );
}
