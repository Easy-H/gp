import React from 'react';

const GitFolderUpload = ({ onUpload, onRemoteAnalyze, gitUrl, setGitUrl, isProcessing, processingStatus }) => {
  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div style={{ padding: '30px', border: '2px dashed #28a745', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fff9', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 원격 저장소 섹션 */}
      <div>
        <p style={{ margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>방법 1: 원격 Git URL 입력</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <input 
            style={{ width: '60%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="https://github.com/username/project.git"
            value={gitUrl}
            onChange={(e) => setGitUrl(e.target.value)}
          />
          <button onClick={() => onRemoteAnalyze(gitUrl)} disabled={isProcessing || !gitUrl} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>분석 시작</button>
        </div>
      </div>

      <hr style={{ width: '100%', border: '0', borderTop: '1px solid #eee' }} />

      {/* 로컬 폴더 섹션 */}
      <div>
        <p style={{ margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>방법 2: 로컬 프로젝트 폴더 선택</p>
      <input 
        type="file" 
        webkitdirectory="true" 
        onChange={handleChange} 
        disabled={isProcessing}
      />
      <div style={{ fontSize: '12px', color: '#666', marginTop: '10px', lineHeight: '1.6' }}>
        <p>* 선택한 폴더의 최신 커밋(HEAD) 상태를 분석합니다.</p>
        <p style={{ color: '#d9534f', fontWeight: 'bold' }}>
          주의: 브라우저 설정에 따라 .git 폴더가 무시될 수 있습니다.<br/>
          분석이 안 될 경우 프로젝트를 .zip으로 압축하여 업로드하세요.
        </p>
      </div>
      </div>

      {isProcessing && processingStatus && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ marginBottom: '5px', fontSize: '14px', color: '#555' }}>
            {processingStatus.fileName}
          </div>
          <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '10px', height: '10px' }}>
            <div 
              style={{ 
                width: `${(processingStatus.current / (processingStatus.total || 1)) * 100}%`, 
                backgroundColor: '#28a745', 
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

export default GitFolderUpload;