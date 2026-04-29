import React, { useEffect, useState } from 'react';
import { toMermaid } from '../Exporter';
import MermaidCodeEditor from './MermaidCodeEditor';
import MermaidRenderer from './MermaidRenderer';

const MermaidDiagramDisplay = ({ classes, layoutDir, setLayoutDir, showText, setShowText }) => {
  const [mermaidScript, setMermaidScript] = useState('');
  const [isRendering, setIsRendering] = useState(false);

  // 분석 결과나 레이아웃 방향이 바뀔 때 스크립트 갱신
  useEffect(() => {
    if (classes && classes.length > 0) {
      const script = toMermaid(classes, layoutDir);
      setMermaidScript(script);
    } else {
      setMermaidScript('');
    }
  }, [classes, layoutDir]);

  return (
    <>
      <style>{`
        .mermaid svg {
          display: inline-block !important;
        }
        .mermaid g.node rect {
          min-width: 100px !important;
        }
        .diagram-toolbar-btn:hover {
          background-color: #f8fafc !important;
          border-color: #cbd5e1 !important;
          transform: translateY(-1px);
        }
        .diagram-header-select {
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          font-size: 0.8rem;
          font-weight: 500;
          color: #334155;
          outline: none;
          cursor: pointer;
        }
        .diagram-header-btn {
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }
        .diagram-header-btn:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }
      `}</style>

      {/* Diagram Header Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderBottom: 'none',
        borderRadius: '12px 12px 0 0',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Layout</label>
          <select
            className="diagram-header-select"
            value={layoutDir}
            onChange={(e) => setLayoutDir(e.target.value)}
          >
            <option value="TB">상하 (TB)</option>
            <option value="LR">좌우 (LR)</option>
            <option value="BT">하상 (BT)</option>
            <option value="RL">우좌 (RL)</option>
          </select>
        </div>
        <button className="diagram-header-btn" onClick={() => setShowText(!showText)}>
          {showText ? '📜 텍스트 숨기기' : '📜 텍스트 보기'}
        </button>
      </div>
      <div style={{
        borderRadius: '0 0 12px 12px',
        overflow: 'hidden', 
        border: '1px solid #e2e8f0',}}>
        <div className={showText ? "internal-split-layout" : ""}>
          {showText && (
            <MermaidCodeEditor value={mermaidScript} onChange={setMermaidScript} />
          )}
          <MermaidRenderer
            mermaidScript={mermaidScript}
            isRendering={isRendering}
            setIsRendering={setIsRendering}
          />
        </div>
      </div>
    </>
  );
};

export default MermaidDiagramDisplay;