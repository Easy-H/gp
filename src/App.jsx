import React, { useEffect } from 'react';
import { CodeAnalyzer } from './CodeAnalyzer';

// 분리된 컴포넌트들
import TabMenu from './components/TabMenu';
import ZipUpload from './components/ZipUpload';
import GitFolderUpload from './components/GitFolderUpload';
import CodeInput from './components/CodeInput';
import ControlPanel from './components/ControlPanel';
import MermaidDiagramDisplay from './components/DiagramDisplay';
import ClassSearch from './components/ClassSearch';
import Modal from './components/Modal';
import ClassDetailView from './components/ClassDetailView';
import { SAMPLE_CODE } from './constants/SampleCode';
import { useAppCoreState } from './hooks/useAppCoreState';
import { useClassSelection } from './hooks/useClassSelection';
import { useAppUiState } from './hooks/useAppUiState';
import { useProjectAnalysis } from './hooks/useProjectAnalysis';
import { useExportActions } from './hooks/useExportActions';

const App = () => {
  const {
    code,
    setCode,
    analyzer,
    setAnalyzer,
  } = useAppCoreState();
  const {
    extension,
    setExtension,
    layoutDir,
    setLayoutDir,
    maxTextSize,
    setMaxTextSize,
    gitUrl,
    setGitUrl,
    activeTab,
    setActiveTab,
    showText,
    setShowText,
    showAnalysisModal,
    setShowAnalysisModal,
    showExportModal,
    setShowExportModal,
  } = useAppUiState();

  const {
    selectedClassName,
    navigationHistory,
    handleSelectClass,
    handleGoBack,
  } = useClassSelection();

  const {
    currentClasses,
    isProcessing,
    processingStatus,
    loadSample,
    handleAnalyze,
    handleZipUpload,
    handleRemoteGitAnalysis,
    handleGitDirectoryAnalysis,
    handleUpdateClass,
  } = useProjectAnalysis({
    code,
    extension,
    analyzer,
    setShowAnalysisModal,
  });

  const { exportData, handlePngExport } = useExportActions({
    currentClasses,
    layoutDir,
    onAlert: (message) => alert(message),
  });

  const handleLoadSample = () => {
    setCode(SAMPLE_CODE);
    void loadSample(SAMPLE_CODE);
  };

  // 분석기 초기화
  useEffect(() => {
    const initAnalyzer = async () => {
      const instance = new CodeAnalyzer();
      await instance.init();
      setAnalyzer(instance);
    };
    initAnalyzer();
  }, []);

  // 언어 선택 변경 시 미리 로드 (UX 최적화)
  useEffect(() => {
    if (analyzer && activeTab === 'input') {
      analyzer.loadLanguage(extension);
    }
  }, [extension, analyzer, activeTab]);

  return (
    <div style={{ padding: '0 2rem 2rem 2rem', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <style>{`
        body {
          margin: 0;
          background-color: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        /* 현대적인 커스텀 스크롤바 */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .secondary-btn {
          padding: 12px;
          background-color: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          color: #475569;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .secondary-btn:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
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
              onClick={() => setShowExportModal(true)}
              style={{ padding: '10px 20px', backgroundColor: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.borderColor = '#e2e8f0'; }}
            >저장 및 내보내기</button>
            <button
              onClick={() => setShowAnalysisModal(true)}
              style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#059669'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#10b981'; e.target.style.transform = 'translateY(0)'; }}
            >새 프로젝트 분석하기</button>
          </div>
        </div>

        {/* 분석 입력 모달 */}
        {showAnalysisModal && (
          <Modal onClose={() => !isProcessing && setShowAnalysisModal(false)}>
            <div style={{ padding: '32px' }}>
              <h2 style={{ marginTop: 0, marginBottom: '8px', color: '#0f172a', fontWeight: '800' }}>프로젝트 분석 시작</h2>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>분석할 소스 코드의 소스를 선택해주세요.</p>
              <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />
              <div style={{ marginTop: '24px' }}>
                {activeTab === 'zip' && (
                  <ZipUpload isProcessing={isProcessing} processingStatus={processingStatus} onUpload={handleZipUpload} />
                )}
                {activeTab === 'git' && (
                  <GitFolderUpload
                    onUpload={handleGitDirectoryAnalysis}
                    onRemoteAnalyze={handleRemoteGitAnalysis}
                    gitUrl={gitUrl} setGitUrl={setGitUrl}
                    isProcessing={isProcessing} processingStatus={processingStatus}
                  />
                )}
                {activeTab === 'input' && (
                  <CodeInput
                    extension={extension} setExtension={setExtension}
                    code={code} setCode={setCode}
                    onAnalyze={() => handleAnalyze(code, extension)} onLoadSample={handleLoadSample}
                  />
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* 클래스 검색 및 상세 정보 영역 */}
        <div style={{ marginTop: '10px' }}>
          <style>{`
            .dashboard-container {
              display: flex;
              flex-direction: column;
              gap: 32px;
            }
            .class-detail-card {
              display: flex;
              flex-direction: column;
            }
            /* 내부 컴포넌트(상세보기, 다이어그램)를 위한 반응형 그리드 클래스 */
            .internal-split-layout {
              display: flex;
              flex-direction: column;
            }
            @media (min-width: 1024px) {
              .internal-split-layout {
                flex-direction: row;
                align-items: stretch;
              }
              .internal-split-layout > * {
                flex: 1;
                min-width: 0;
              }
              .class-detail-card {
                height: 750px; /* 고정 높이 부여 */
                max-height: calc(100vh - 160px); /* 화면 높이보다 작게 제한 */
                overflow: hidden; /* 내부 영역에서 개별 스크롤 처리 */
              }
              .detail-pane, .diagram-pane {
                width: 100%;
              }
            }
          `}</style>

          <div className="dashboard-container">
            <div className="detail-pane">
              <ClassSearch classes={currentClasses} onSelectClass={handleSelectClass} />
              <ClassDetailView
                classInfo={currentClasses.find(c => c.name === selectedClassName)}
                onSelectClass={handleSelectClass}
                extension={extension}
                onBack={handleGoBack}
                hasHistory={navigationHistory.length > 0}
                onUpdate={handleUpdateClass}
                allClassNames={currentClasses.map(c => c.name)}
              />
            </div>

            <div className="diagram-pane">
              <MermaidDiagramDisplay
                classes={currentClasses}
                layoutDir={layoutDir}
                setLayoutDir={setLayoutDir}
                showText={showText}
                setShowText={setShowText}
                selectedClassName={selectedClassName}
                maxTextSize={maxTextSize}
                setMaxTextSize={setMaxTextSize}
              />
            </div>
          </div>

          {/* 내보내기 옵션 모달 */}
          {showExportModal && (
            <Modal onClose={() => setShowExportModal(false)}>
              <div style={{ padding: '30px', textAlign: 'center' }}>
                <h3 style={{ marginTop: 0, color: '#0f172a', fontWeight: '800' }}>다이어그램 내보내기</h3>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>원하는 파일 형식을 선택하여 저장하세요.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button className='secondary-btn' onClick={() => { exportData('mmd'); setShowExportModal(false); }}>Mermaid (.mmd)</button>
                  <button className='secondary-btn' onClick={() => { handlePngExport(); setShowExportModal(false); }}>이미지 (.png)</button>
                  <button className='secondary-btn' onClick={() => { exportData('puml'); setShowExportModal(false); }}>PlantUML (.puml)</button>
                  <button className='secondary-btn' onClick={() => { exportData('dot'); setShowExportModal(false); }}>Graphviz (.dot)</button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

      export default App;
