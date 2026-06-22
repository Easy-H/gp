import React from 'react';
import { SAMPLE_CODE } from './constants/SampleCode';
import { useAppCoreState } from './hooks/useAppCoreState';
import { useClassSelection } from './hooks/useClassSelection';
import { useAppUiState } from './hooks/useAppUiState';
import { useProjectAnalysis } from './hooks/useProjectAnalysis';
import { useExportActions } from './hooks/useExportActions';
import { useAnalyzerBootstrap } from './hooks/useAnalyzerBootstrap';
import AppHeader from './components/AppHeader';
import AnalysisModal from './components/AnalysisModal';
import WorkspaceDashboard from './components/WorkspaceDashboard';
import ExportModal from './components/ExportModal';
import AppStyles from './components/AppStyles';

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

  useAnalyzerBootstrap({ analyzer, setAnalyzer, extension, activeTab });

  return (
    <div style={{ padding: '0 2rem 2rem 2rem', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AppStyles />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <AppHeader
          onOpenExport={() => setShowExportModal(true)}
          onOpenAnalysis={() => setShowAnalysisModal(true)}
        />

        <AnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => !isProcessing && setShowAnalysisModal(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isProcessing={isProcessing}
          processingStatus={processingStatus}
          gitUrl={gitUrl}
          setGitUrl={setGitUrl}
          extension={extension}
          setExtension={setExtension}
          code={code}
          setCode={setCode}
          onAnalyze={() => handleAnalyze(code, extension)}
          onLoadSample={handleLoadSample}
          onZipUpload={handleZipUpload}
          onRemoteAnalyze={handleRemoteGitAnalysis}
          onGitUpload={handleGitDirectoryAnalysis}
        />

        <div style={{ marginTop: '10px' }}>
          <WorkspaceDashboard
            currentClasses={currentClasses}
            selectedClassName={selectedClassName}
            onSelectClass={handleSelectClass}
            onGoBack={handleGoBack}
            navigationHistory={navigationHistory}
            onUpdateClass={handleUpdateClass}
            extension={extension}
            layoutDir={layoutDir}
            setLayoutDir={setLayoutDir}
            showText={showText}
            setShowText={setShowText}
            maxTextSize={maxTextSize}
            setMaxTextSize={setMaxTextSize}
          />

          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            onExportData={exportData}
            onExportPng={handlePngExport}
          />
        </div>
      </div>
    </div>
  );
};

      export default App;
