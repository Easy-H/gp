import React from 'react';

const AppHeader = ({ onOpenExport, onOpenAnalysis }) => {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #e2e8f0',
      marginBottom: '6px'
    }}>
      <div style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#3b82f6', letterSpacing: '-0.02em' }}>Notation</span>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onOpenExport}
          style={{ padding: '10px 20px', backgroundColor: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; }}
          onMouseLeave={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.borderColor = '#e2e8f0'; }}
        >저장 및 내보내기</button>
        <button
          onClick={onOpenAnalysis}
          style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}
          onMouseEnter={(e) => { e.target.style.backgroundColor = '#059669'; e.target.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.target.style.backgroundColor = '#10b981'; e.target.style.transform = 'translateY(0)'; }}
        >새 프로젝트 분석하기</button>
      </div>
    </div>
  );
};

export default AppHeader;

