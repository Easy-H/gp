import React from 'react';

const MermaidCodeEditor = ({ value, onChange }) => {
  return (
    <textarea
      rows="10"
      className="mermaid-split-textarea"
      style={{
        padding: '16px',
        fontFamily: 'monospace',
        backgroundColor: '#f8fafc',
        border: 'none',
        borderRadius: '0',
        fontSize: '13px',
        color: '#334155',
        resize: 'vertical',
        flex: 1,
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Mermaid 스크립트 디버깅용..."
    />
  );
};

export default MermaidCodeEditor;