import React, { useState } from 'react';

const ClassSearch = ({ classes, onSelectClass }) => {
  const [term, setTerm] = useState('');
  const fieldStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--panel-border)',
    boxSizing: 'border-box',
    fontSize: '14px',
    background: 'var(--panel-bg)',
    color: 'var(--panel-text)',
  };
  const dropdownStyle = {
    position: 'absolute',
    zIndex: 100,
    width: '100%',
    backgroundColor: 'var(--panel-bg)',
    border: '1px solid var(--panel-border)',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
    maxHeight: '300px',
    overflowY: 'auto',
    borderRadius: '0 0 8px 8px',
  };

  const filtered = term
    ? classes.filter((c) => c.name.toLowerCase().includes(term.toLowerCase()))
    : classes;

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="클래스 검색 (이름)..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        style={fieldStyle}
      />
      {term ? (
        <div style={dropdownStyle}>
          {filtered.map(c => (
            <div 
              key={c.name} 
              onClick={() => { onSelectClass(c.name); setTerm(''); }}
              style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid var(--panel-border)', fontSize: '14px', color: 'var(--panel-text)' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--panel-bg-2)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <strong>{c.name}</strong> <span style={{ fontSize: '0.8em', color: 'var(--panel-muted)' }}>({c.type})</span>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: '10px', color: 'var(--panel-muted)' }}>결과가 없습니다.</div>}
        </div>
      ) : null}
    </div>
  );
};

export default ClassSearch;
