import React, { useEffect } from 'react';
import MermaidRenderer from './MermaidRenderer';

const MermaidDiagramDisplay = ({
  mermaidScript,
  selectedClassName,
  maxTextSize,
  setMaxTextSize,
  onOpenExport,
  isRendering,
  setIsRendering,
  layoutDir,
  setLayoutDir,
}) => {
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
        .diagram-scrollbar-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .diagram-scrollbar-hidden::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .diagram-header-select {
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid var(--panel-border);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--panel-text);
          outline: none;
          cursor: pointer;
          background: var(--panel-bg);
        }
        .diagram-header-btn {
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid var(--panel-border);
          background: var(--panel-bg);
          color: var(--panel-text);
          cursor: pointer;
          transition: all 0.2s;
        }
        .diagram-header-btn.apply-btn {
          background-color: #3b82f6;
          color: white;
          border-color: #2563eb;
        }
        .diagram-header-btn.apply-btn:hover {
          background-color: #2563eb;
        }
        .diagram-header-btn:hover {
          border-color: #94a3b8;
          background: var(--panel-bg-2);
        }
      `}</style>

      {/* Diagram Header Controls */}
      <div className="diagram-scrollbar-hidden" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        backgroundColor: 'transparent',
        borderBottom: '1px solid var(--panel-border)',
        gap: '12px',
        overflowX: 'auto',
        overflowY: 'hidden',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, whiteSpace: 'nowrap' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--panel-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Layout</label>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, whiteSpace: 'nowrap' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--panel-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Size</label>
          <input
            type="number"
            className="diagram-header-select"
            style={{ width: '90px' }}
            value={maxTextSize}
            onChange={(e) => setMaxTextSize(Number(e.target.value))}
          />
        </div>
        <div className="diagram-scrollbar-hidden" style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', justifyContent: 'flex-end', overflowX: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {onOpenExport && (
            <button className="diagram-header-btn" onClick={onOpenExport}>내보내기</button>
          )}
        </div>
      </div>
      <div style={{ overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <MermaidRenderer
            mermaidScript={mermaidScript}
            isRendering={isRendering}
            setIsRendering={setIsRendering}
            selectedClassName={selectedClassName}
            maxTextSize={maxTextSize}
          />
        </div>
      </div>
    </>
  );
};

export default MermaidDiagramDisplay;
