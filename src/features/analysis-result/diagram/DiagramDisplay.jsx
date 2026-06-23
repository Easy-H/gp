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
          background-color: var(--panel-bg-2) !important;
          border-color: var(--app-primary) !important;
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
          width: auto;
          min-width: 90px;
        }
        .diagram-header-btn {
          min-height: var(--control-height-sm);
        }
        .diagram-header-btn:hover {
          border-color: var(--app-primary);
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
            className="app-select app-select-sm diagram-header-select"
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
            className="app-input app-input-sm diagram-header-select"
            style={{ width: '90px' }}
            value={maxTextSize}
            onChange={(e) => setMaxTextSize(Number(e.target.value))}
          />
        </div>
        <div className="diagram-scrollbar-hidden" style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', justifyContent: 'flex-end', overflowX: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {onOpenExport && (
            <button className="app-btn app-btn-sm diagram-header-btn" onClick={onOpenExport}>내보내기</button>
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
