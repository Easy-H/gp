import React from 'react';

const ClassFileViewer = ({ data, showCode, setShowCode }) => {
  return (
    <div style={{
      flex: 1,
      borderLeft: '1px solid #f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      overflow: 'hidden' /* Contain inner scroll */
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: '15px', paddingTop: '10px', overflow: 'hidden' }}>
        <h4 style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>File Information</h4>

        <div
          onClick={() => setShowCode(!showCode)}
          style={{
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            cursor: 'pointer',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s',
            marginTop: '16px',
            flexShrink: 0 // Prevent toggle from shrinking
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📁</span> {data.filePath || 'Unknown Path'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            {showCode ? 'Click to hide source code' : 'Click to view source code'}
          </div>
        </div>

        {showCode && (
          <div style={{ 
            flex: 1, 
            minHeight: 0, // Critical for internal scroll in flexbox
            backgroundColor: '#1e293b', 
            borderRadius: '8px', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column', 
            marginTop: '16px',
            marginBottom: '10px',
            border: '1px solid #334155'
          }}>
            <div style={{ padding: '8px 16px', backgroundColor: '#334155', color: '#f8fafc', fontSize: '0.75rem', fontWeight: '600', borderBottom: '1px solid #475569' }}>Source Preview</div>
            <pre style={{
              margin: 0, padding: '16px', color: '#e2e8f0', fontSize: '0.85rem', fontFamily: 'monospace', overflow: 'auto', flex: 1, lineHeight: '1.5'
            }}>
              {data.fileContent || '// No content available'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassFileViewer;