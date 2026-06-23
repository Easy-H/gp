import React from 'react';
import MermaidCodeEditor from './MermaidCodeEditor';

const DiagramEditorPanel = ({ value, onChange, onApply }) => {
  return (
    <div className="analysis-panel-shell flush" style={{ position: 'relative', flex: 1 }}>
      <button
        className="app-btn app-btn-primary"
        onClick={onApply}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 40,
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
