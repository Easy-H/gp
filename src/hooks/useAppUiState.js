import { useState } from 'react';

const getInitialGitUrl = () => {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('gitUrl') || '';
};

const getInitialActiveTab = () => {
  if (typeof window === 'undefined') return 'input';
  return new URLSearchParams(window.location.search).get('gitUrl') ? 'git' : 'input';
};

export const useAppUiState = () => {
  const [extension, setExtension] = useState('js');
  const [layoutDir, setLayoutDir] = useState('TB');
  const [maxTextSize, setMaxTextSize] = useState(50000);
  const [gitUrl, setGitUrl] = useState(getInitialGitUrl);
  const [activeTab, setActiveTab] = useState(getInitialActiveTab);
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
