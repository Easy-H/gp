import React from 'react';

const ZipUpload = ({ isProcessing, processingStatus, onUpload }) => {
  return (
    <div style={{ padding: '30px', border: '2px dashed #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f0f4f8' }}>
      <p style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>분석할 프로젝트(.zip)를 선택하세요.</p>
      <input 
        type="file" 
        accept=".zip" 
        onChange={onUpload} 
        disabled={isProcessing}
      />
      
      {isProcessing && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ marginBottom: '5px', fontSize: '14px', color: '#555' }}>
            {processingStatus.fileName}
          </div>
          <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '10px', height: '10px' }}>
            <div 
              style={{ 
                width: `${(processingStatus.current / (processingStatus.total || 1)) * 100}%`, 
                backgroundColor: '#007bff', 
                height: '100%', 
                borderRadius: '10px',
                transition: 'width 0.3s ease'
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ZipUpload;