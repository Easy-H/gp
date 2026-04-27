import React from 'react';

const ControlPanel = ({ layoutDir, setLayoutDir, showText, setShowText, onExport }) => {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
      <label>레이아웃 방향: </label>
      <select value={layoutDir} onChange={(e) => setLayoutDir(e.target.value)}>
        <option value="TB">상하</option>
        <option value="LR">좌우</option>
        <option value="BT">하상</option>
        <option value="RL">우좌</option>
      </select>
      <div style={{ flexGrow: 1 }} />
      <button className='primary-btn' onClick={() => setShowText(!showText)}>
        {showText ? '텍스트 숨기기' : '텍스트로 보기'}
      </button>
      <button className='secondary-btn' onClick={() => onExport('mmd')}>Mermaid 저장</button>
      <button className='secondary-btn' onClick={() => onExport('puml')}>PlantUML 저장</button>
      <button className='secondary-btn' onClick={() => onExport('dot')}>Graphviz(DOT) 저장</button>
    </div>
  );
};

export default ControlPanel;