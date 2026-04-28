import React, { useState } from 'react';

const ClassSearch = ({ classes, onSelectClass }) => {
  const [term, setTerm] = useState('');

  const filtered = classes.filter(c => 
    c.name.toLowerCase().includes(term.toLowerCase())
  );

  return (
    <div style={{ marginBottom: '15px', position: 'relative' }}>
      <input 
        type="text" 
        placeholder="클래스 검색 (이름)..." 
        value={term} 
        onChange={(e) => setTerm(e.target.value)}
        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}
      />
      {term && (
        <div style={{ 
          position: 'absolute', zIndex: 100, width: '100%',
          backgroundColor: '#fff', border: '1px solid #ddd', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxHeight: '300px', overflowY: 'auto', borderRadius: '0 0 4px 4px'
        }}>
          {filtered.map(c => (
            <div 
              key={c.name} 
              onClick={() => { onSelectClass(c.name); setTerm(''); }}
              style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '14px' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f7ff'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <strong>{c.name}</strong> <span style={{ fontSize: '0.8em', color: '#666' }}>({c.type})</span>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: '10px', color: '#999' }}>결과가 없습니다.</div>}
        </div>
      )}
    </div>
  );
};

export default ClassSearch;