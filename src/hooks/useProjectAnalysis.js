import { useState } from 'react';
import { useCodeInputAnalysis } from './useCodeInputAnalysis';
import { useProjectFilesAnalysis } from './useProjectFilesAnalysis';

export const useProjectAnalysis = ({
  analyzer,
  setShowAnalysisModal,
}) => {
  const [currentClasses, setCurrentClasses] = useState([]);
  const { loadSample, analyzeCodeInput } = useCodeInputAnalysis({
    analyzer,
    setShowAnalysisModal,
    setCurrentClasses,
  });

  const {
    isProcessing,
    processingStatus,
    analyzeZip,
    analyzeRemoteGit,
    analyzeLocalGit,
  } = useProjectFilesAnalysis({
    analyzer,
    setShowAnalysisModal,
    setCurrentClasses,
  });

  const handleUpdateClass = (updatedClass) => {
    setCurrentClasses((prev) => prev.map((cls) => (cls.name === updatedClass.name ? updatedClass : cls)));
  };

  return {
    currentClasses,
    setCurrentClasses,
    isProcessing,
    processingStatus,
    loadSample,
    handleAnalyze: analyzeCodeInput,
    handleZipUpload: analyzeZip,
    handleRemoteGitAnalysis: analyzeRemoteGit,
    handleGitDirectoryAnalysis: analyzeLocalGit,
    handleUpdateClass,
  };
};
