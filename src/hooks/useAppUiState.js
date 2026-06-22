import { useState } from 'react';

export const useAppUiState = () => {
  const [extension, setExtension] = useState('js');
  const [layoutDir, setLayoutDir] = useState('TB');
  const [maxTextSize, setMaxTextSize] = useState(50000);
  const [gitUrl, setGitUrl] = useState('');
  const [activeTab, setActiveTab] = useState('input');
  const [showText, setShowText] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  return {
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
  };
};

