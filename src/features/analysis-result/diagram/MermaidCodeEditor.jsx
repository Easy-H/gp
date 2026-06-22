import React from 'react';

const MermaidCodeEditor = ({ value, onChange }) => {
  return (
    <textarea
      rows="10"
      wrap="soft"
      className="mermaid-split-textarea"
      style={{
        padding: '16px',
        fontFamily: 'monospace',
        backgroundColor: 'var(--panel-bg-2)',
        border: 'none',
        borderRadius: '0',
        fontSize: '13px',
        color: 'var(--panel-text)',
        resize: 'vertical',
        flex: 1,
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        overflowX: 'hidden',
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Mermaid 스크립트 디버깅용..."
    />
  );
};

export default MermaidCodeEditor;
