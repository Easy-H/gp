import React, { useEffect, useState } from 'react';
import { SAMPLE_CODE } from './constants/SampleCode';
import { useAppCoreState } from './hooks/useAppCoreState';
import { useClassSelection } from './hooks/useClassSelection';
import { useAppUiState } from './hooks/useAppUiState';
import { useProjectAnalysis } from './hooks/useProjectAnalysis';
import { useExportActions } from './hooks/useExportActions';
import { useAnalyzerBootstrap } from './hooks/useAnalyzerBootstrap';
import AppHeader from './components/AppHeader';
import AnalysisModal from './components/AnalysisModal';
import ExportModal from './components/ExportModal';
import AppStyles from './components/AppStyles';
import AnalysisPanelWorkspace from './features/analysis-result/AnalysisPanelWorkspace';

const App = () => {
  const {
    code,
    setCode,
    analyzer,
    setAnalyzer,
  } = useAppCoreState();
  const [panels, setPanels] = useState([
    { id: 'source-1', type: 'source', title: '소스' },
    { id: 'details-1', type: 'details', title: '상세' },
    { id: 'diagram-1', type: 'diagram', title: '다이어그램' },
  ]);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return window.localStorage.getItem('notation-theme') || 'light';
  });
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

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';
    const vars = isDark
        ? {
          '--app-bg': '#0b1220',
          '--app-surface': '#111827',
          '--app-surface-2': '#0f172a',
          '--app-border': '#243244',
          '--app-text': '#e5e7eb',
          '--app-muted': '#94a3b8',
          '--app-header-bg': 'rgba(11, 18, 32, 0.92)',
          '--app-code-bg': '#0b1120',
          '--app-primary': '#60a5fa',
        }
      : {
          '--app-bg': '#f8fafc',
          '--app-surface': '#ffffff',
          '--app-surface-2': '#f8fafc',
          '--app-border': '#e2e8f0',
          '--app-text': '#0f172a',
          '--app-muted': '#64748b',
          '--app-header-bg': 'rgba(248, 250, 252, 0.92)',
          '--app-code-bg': '#f1f5f9',
          '--app-primary': '#3b82f6',
        };

    Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
    root.dataset.theme = theme;
    document.body.dataset.theme = theme;
    document.body.style.backgroundColor = vars['--app-bg'];
    document.body.style.color = vars['--app-text'];
    window.localStorage.setItem('notation-theme', theme);
  }, [theme]);

  return (
    <div style={{ padding: 0, margin: 0, width: '100%', minHeight: '100vh', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--app-bg)', color: 'var(--app-text)', display: 'flex', flexDirection: 'column' }}>
      <AppStyles />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <AppHeader
          onOpenExport={() => setShowExportModal(true)}
          onOpenAnalysis={() => setShowAnalysisModal(true)}
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
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

        <div style={{ marginTop: 0, flex: 1, minHeight: 0, display: 'flex' }}>
        <AnalysisPanelWorkspace
          panels={panels}
          setPanels={setPanels}
          theme={theme}
          currentClasses={currentClasses}
            selectedClassName={selectedClassName}
            handleSelectClass={handleSelectClass}
            handleGoBack={handleGoBack}
            navigationHistory={navigationHistory}
            handleUpdateClass={handleUpdateClass}
            extension={extension}
            layoutDir={layoutDir}
            setLayoutDir={setLayoutDir}
            showText={showText}
            setShowText={setShowText}
            maxTextSize={maxTextSize}
            setMaxTextSize={setMaxTextSize}
            onOpenExport={() => setShowExportModal(true)}
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
