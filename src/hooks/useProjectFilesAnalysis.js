import { useCallback, useState } from 'react';
import { ProjectExtractor } from '../services/ProjectExtractor';
import { dedupeAnonymous, refineClasses } from './projectAnalysisHelpers';

export const useProjectFilesAnalysis = ({ analyzer, setShowAnalysisModal, setCurrentClasses }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({
    current: 0,
    total: 0,
    fileName: ''
  });

  const runAnalysisPipeline = useCallback((projectMap, metadata) => {
    let allParsedClasses = [];
    for (const [path, data] of projectMap.entries()) {
      try {
        const classes = analyzer.analyze(data.content, data.ext, metadata);
        const enriched = classes.map((cls) => ({ ...cls, filePath: path, fileContent: data.content }));
        allParsedClasses = [...allParsedClasses, ...enriched];
      } catch (e) {
        console.warn(`Analysis failed for ${path}`, e);
      }
    }

    const uniqueClasses = dedupeAnonymous(allParsedClasses);
    setCurrentClasses(refineClasses(uniqueClasses, metadata));
    setShowAnalysisModal(false);
  }, [analyzer, setCurrentClasses, setShowAnalysisModal]);

  const analyzeZip = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file || !analyzer) return;
    try {
      setIsProcessing(true);
      const extractor = new ProjectExtractor();
      const { projectMap, metadata } = await extractor.fromZip(file, analyzer, setProcessingStatus);
      runAnalysisPipeline(projectMap, metadata);
    } catch (err) {
      alert(`Zip 분석 실패: ${err.message}`);
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  }, [analyzer, runAnalysisPipeline]);

  const analyzeRemoteGit = useCallback(async (url) => {
    try {
      setIsProcessing(true);
      const extractor = new ProjectExtractor();
      const { projectMap, metadata } = await extractor.fromRemoteGit(url, analyzer, setProcessingStatus);
      runAnalysisPipeline(projectMap, metadata);
    } catch (err) {
      alert(`원격 Git 분석 실패: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [analyzer, runAnalysisPipeline]);

  const analyzeLocalGit = useCallback(async (files) => {
    try {
      setIsProcessing(true);
      const extractor = new ProjectExtractor();
      const { projectMap, metadata } = await extractor.fromLocalGit(files, analyzer, setProcessingStatus);
      runAnalysisPipeline(projectMap, metadata);
    } catch (err) {
      alert(`로컬 Git 분석 실패: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [analyzer, runAnalysisPipeline]);

  return {
    isProcessing,
    processingStatus,
    analyzeZip,
    analyzeRemoteGit,
    analyzeLocalGit,
  };
};

