import React from 'react';
import TabMenu from './TabMenu';
import ZipUpload from './ZipUpload';
import GitFolderUpload from './GitFolderUpload';
import CodeInput from './CodeInput';
import Modal from './Modal';

const AnalysisModal = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  isProcessing,
  processingStatus,
  gitUrl,
  setGitUrl,
  extension,
  setExtension,
  code,
  setCode,
  onAnalyze,
  onLoadSample,
  onZipUpload,
  onRemoteAnalyze,
  onGitUpload,
}) => {
  if (!isOpen) return null;
  return (
    <Modal onClose={onClose}>
      <div style={{ padding: '32px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '8px', color: '#0f172a', fontWeight: '800' }}>프로젝트 분석 시작</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>분석할 소스 코드의 소스를 선택해주세요.</p>
        <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />
        <div style={{ marginTop: '24px' }}>
          {activeTab === 'zip' && (
            <ZipUpload isProcessing={isProcessing} processingStatus={processingStatus} onUpload={onZipUpload} />
          )}
          {activeTab === 'git' && (
            <GitFolderUpload
              onUpload={onGitUpload}
              onRemoteAnalyze={onRemoteAnalyze}
              gitUrl={gitUrl} setGitUrl={setGitUrl}
              isProcessing={isProcessing} processingStatus={processingStatus}
            />
          )}
          {activeTab === 'input' && (
            <CodeInput
              extension={extension} setExtension={setExtension}
              code={code} setCode={setCode}
              onAnalyze={onAnalyze} onLoadSample={onLoadSample}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AnalysisModal;

