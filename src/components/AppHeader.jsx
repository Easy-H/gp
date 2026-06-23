import React from 'react';

const AppHeader = ({ onOpenExport, onOpenAnalysis, theme, onToggleTheme }) => {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
      borderBottom: '1px solid var(--app-border)',
      backgroundColor: 'var(--app-header-bg)',
      backdropFilter: 'blur(14px)',
      flexShrink: 0,
      boxSizing: 'border-box',
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', lineHeight: 1 }}>
        <span style={{ color: 'var(--app-text)', letterSpacing: '-0.02em' }}>Notation</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          className="app-btn app-icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? '라이트모드로 전환' : '다크모드로 전환'}
          aria-label={theme === 'dark' ? '라이트모드로 전환' : '다크모드로 전환'}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <button
          className="app-btn app-icon-btn"
          onClick={onOpenExport}
          title="저장 및 내보내기"
          aria-label="저장 및 내보내기"
        >⇩</button>
        <button
          className="app-btn app-btn-primary app-icon-btn-lg"
          onClick={onOpenAnalysis}
          title="새 프로젝트 분석하기"
          aria-label="새 프로젝트 분석하기"
        >＋</button>
      </div>
    </div>
  );
};

export default AppHeader;
