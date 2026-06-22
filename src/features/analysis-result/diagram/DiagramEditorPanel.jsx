import React from 'react';
import MermaidCodeEditor from './MermaidCodeEditor';

const DiagramEditorPanel = ({ value, onChange, onApply }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 12, overflow: 'hidden', position: 'relative', flex: 1 }}>
      <button
        onClick={onApply}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 40,
          cursor: 'pointer',
          border: '1px solid var(--panel-border)',
          borderRadius: '999px',
          backgroundColor: 'var(--panel-bg)',
          color: 'var(--panel-text)',
          height: '34px',
          padding: '0 14px',
          fontSize: '0.85rem',
          fontWeight: '700',
          boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
        }}
      >
        적용하기
      </button>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', minWidth: 0 }}>
        <MermaidCodeEditor value={value} onChange={onChange} />
      </div>
    </div>
  );
};

export default DiagramEditorPanel;
