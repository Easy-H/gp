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
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', lineHeight: 1 }}>
        <span style={{ color: 'var(--app-text)', letterSpacing: '-0.02em' }}>Notation</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? '라이트모드로 전환' : '다크모드로 전환'}
          aria-label={theme === 'dark' ? '라이트모드로 전환' : '다크모드로 전환'}
          style={{ width: 38, height: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--app-surface)', color: 'var(--app-text)', border: '1px solid var(--app-border)', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', lineHeight: 1, transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <button
          onClick={onOpenExport}
          title="저장 및 내보내기"
          aria-label="저장 및 내보내기"
          style={{ width: 38, height: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--app-surface)', color: 'var(--app-text)', border: '1px solid var(--app-border)', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '18px', lineHeight: 1, transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >⇩</button>
        <button
          onClick={onOpenAnalysis}
          title="새 프로젝트 분석하기"
          aria-label="새 프로젝트 분석하기"
          style={{
            width: 40,
            height: 40,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--app-primary)',
            color: 'white',
            border: '1px solid color-mix(in srgb, var(--app-primary) 70%, black)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '800',
            fontSize: '20px',
            lineHeight: 1,
            transition: 'all 0.2s',
            boxShadow: '0 10px 18px -8px color-mix(in srgb, var(--app-primary) 55%, transparent)',
            position: 'relative',
            zIndex: 1,
          }}
        >＋</button>
      </div>
    </div>
  );
};

export default AppHeader;
