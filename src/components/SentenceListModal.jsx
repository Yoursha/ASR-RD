import React, { useState } from 'react';
import { X, Search, Plus, BookOpen, Check, RefreshCw } from 'lucide-react';

export default function SentenceListModal({
  isOpen,
  onClose,
  sentences,
  currentSentenceId,
  onSelectSentence,
  onAddCustomSentence,
  onReloadDB
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newText, setNewText] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newCategory, setNewCategory] = useState('Custom');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(sentences.map(s => s.category || 'General')))];

  // Filter sentences
  const filteredSentences = sentences.filter(s => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.targetText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.translation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddCustomSentence({
      id: `custom-${Date.now()}`,
      category: newCategory || 'Custom',
      targetText: newText.trim(),
      translation: newTranslation.trim() || 'Custom practice sentence',
      source: 'user'
    });
    setNewText('');
    setNewTranslation('');
    setShowAddForm(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={22} color="#818cf8" />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                db.txt Sentence Library
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Loaded {sentences.length} sentences from db.txt & user items
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onReloadDB}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.82rem' }}
              title="Reload sentences from db.txt"
            >
              <RefreshCw size={14} /> Reload db.txt
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Modal Controls Bar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{
              position: 'relative',
              flex: 1,
              minWidth: '200px'
            }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search Chinese or English..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            {/* Add Custom Button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary"
              style={{ padding: '9px 16px', fontSize: '0.85rem' }}
            >
              <Plus size={16} />
              <span>{showAddForm ? 'Cancel Add' : 'Add Custom'}</span>
            </button>
          </div>

          {/* Categories Pill Filters */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedCategory === cat ? '#a5b4fc' : 'var(--text-muted)',
                  border: `1px solid ${selectedCategory === cat ? 'rgba(99, 102, 241, 0.5)' : 'var(--card-border)'}`,
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Add Custom Sentence Form */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} style={{
            padding: '16px 24px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <h4 style={{ fontSize: '0.9rem', color: '#a5b4fc' }}>Add Custom Sentence to Practice</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Chinese Text (e.g. 我很喜欢学中文)"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                required
                style={{
                  flex: 2,
                  minWidth: '200px',
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white'
                }}
              />
              <input
                type="text"
                placeholder="English Translation"
                value={newTranslation}
                onChange={(e) => setNewTranslation(e.target.value)}
                style={{
                  flex: 2,
                  minWidth: '200px',
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white'
                }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>
                Save
              </button>
            </div>
          </form>
        )}

        {/* Sentences List */}
        <div style={{
          padding: '16px 24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {filteredSentences.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No sentences found matching search query.
            </div>
          ) : (
            filteredSentences.map((s) => {
              const isSelected = s.id === currentSentenceId;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSentence(s);
                    onClose();
                  }}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.5)' : 'var(--card-border)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        background: 'rgba(255,255,255,0.08)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        color: '#a5b4fc'
                      }}>
                        {s.category}
                      </span>
                      <strong style={{ fontSize: '1.1rem', color: isSelected ? '#818cf8' : 'var(--text-main)' }}>
                        {s.targetText}
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {s.translation}
                    </p>
                  </div>

                  {isSelected && (
                    <div style={{
                      background: '#6366f1',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={16} color="white" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
