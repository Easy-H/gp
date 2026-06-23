import React from 'react';

const MermaidCodeEditor = ({ value, onChange }) => {
  return (
    <textarea
      rows="10"
      wrap="soft"
      className="app-textarea app-textarea-code mermaid-split-textarea"
      style={{
        border: 'none',
        borderRadius: '0',
        flex: 1,
        width: '100%',
        minWidth: 0,
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Mermaid 스크립트 디버깅용..."
    />
  );
};

export default MermaidCodeEditor;
