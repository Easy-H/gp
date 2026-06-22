import React from 'react';

const ControlPanel = ({ layoutDir, setLayoutDir, showText, setShowText }) => {
  return (
    <>
      <style>{`
        .control-panel-btn {
          padding: 8px 16px;
          background-color: var(--panel-bg);
          border: 1px solid var(--panel-border);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--panel-text);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .control-panel-btn:hover {
          background-color: var(--panel-bg-2);
          border-color: var(--app-primary);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .control-select {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--panel-border);
          background-color: var(--panel-bg);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--panel-text);
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .control-select:hover {
          border-color: var(--app-primary);
        }
        .control-select:focus {
          border-color: var(--app-primary);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--app-primary) 18%, transparent);
        }
      `}</style>
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        alignItems: 'center', 
        padding: '5px 20px', 
        backgroundColor: 'var(--panel-bg)', 
        border: '1px solid var(--panel-border)', 
        borderRadius: '12px', 
        marginBottom: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ 
            fontSize: '0.75rem', 
            fontWeight: '700', 
            color: 'var(--panel-muted)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em' 
          }}>
            레이아웃 방향
          </label>
          <select 
            className="control-select"
            value={layoutDir} 
            onChange={(e) => setLayoutDir(e.target.value)}
          >
            <option value="TB">상하 (Top-Bottom)</option>
            <option value="LR">좌우 (Left-Right)</option>
            <option value="BT">하상 (Bottom-Top)</option>
            <option value="RL">우좌 (Right-Left)</option>
          </select>
        </div>
        <div style={{ flexGrow: 1 }} />
        <button 
          className="control-panel-btn"
          onClick={() => setShowText(!showText)}
        >
          {showText ? '텍스트 숨기기' : '텍스트 보기'}
        </button>
      </div>
    </>
  );
};

export default ControlPanel;
