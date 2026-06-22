import { useEffect, useState } from 'react';
import { ProjectExtractor } from '../services/ProjectExtractor';

const dedupeAnonymous = (classes) =>
  Array.from(
    classes.reduce((map, obj) => (obj.name !== 'Anonymous' ? map.set(obj.name, obj) : map), new Map()).values()
  );

const refineClasses = (classes, metadataMap) => {
  const classMap = new Map(classes.map((c) => [c.name, c]));

  classes.forEach((cls) => {
    const correctedParents = [];
    cls.parents.forEach((pName) => {
      if (metadataMap.get(pName) === 'interface') {
        if (!cls.implements.includes(pName)) cls.implements.push(pName);
      } else {
        correctedParents.push(pName);
      }
    });
    cls.parents = correctedParents;
    cls.children = [];
  });

  classes.forEach((cls) => {
    const allBaseTypes = [...cls.parents, ...cls.implements];
    allBaseTypes.forEach((baseName) => {
      const baseClass = classMap.get(baseName);
      if (baseClass && !baseClass.children.includes(cls.name)) {
        baseClass.children.push(cls.name);
      }
    });
  });

  return [...classes];
};

export const useProjectAnalysis = ({
  code,
  extension,
  analyzer,
  setShowAnalysisModal,
}) => {
  const [currentClasses, setCurrentClasses] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({
    current: 0,
    total: 0,
    fileName: ''
  });

  const loadSample = async (sampleCode) => {
    if (!analyzer) return;
    await analyzer.loadLanguage('js');
    const metadata = analyzer.extractClassMetadata(sampleCode, 'js');
    const classes = analyzer.analyze(sampleCode, 'js', metadata);
    const enriched = classes.map((cls) => ({ ...cls, filePath: 'sample.js', fileContent: sampleCode }));
    setCurrentClasses(refineClasses(dedupeAnonymous(enriched), metadata));
    setShowAnalysisModal(false);
  };

  const handleAnalyze = async (sourceCode = code, ext = extension) => {
    if (!analyzer || !sourceCode) return;
    try {
      await analyzer.loadLanguage(ext);
      const metadata = analyzer.extractClassMetadata(sourceCode, ext);
      const classes = analyzer.analyze(sourceCode, ext, metadata);
      const enriched = classes.map((cls) => ({ ...cls, filePath: `input.${ext}`, fileContent: sourceCode }));
      setCurrentClasses(refineClasses(dedupeAnonymous(enriched), metadata));
      setShowAnalysisModal(false);
      alert('코드 분석이 완료되었습니다.');
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('코드 분석 중 오류가 발생했습니다.');
    }
  };

  const runAnalysisPipeline = (projectMap, metadata) => {
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
  };

  const handleZipUpload = async (event) => {
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
  };

  const handleRemoteGitAnalysis = async (url) => {
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
  };

  const handleGitDirectoryAnalysis = async (files) => {
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
  };

  const handleUpdateClass = (updatedClass) => {
    setCurrentClasses((prev) => prev.map((cls) => (cls.name === updatedClass.name ? updatedClass : cls)));
  };

  return {
    currentClasses,
    setCurrentClasses,
    isProcessing,
    processingStatus,
    loadSample,
    handleAnalyze,
    handleZipUpload,
    handleRemoteGitAnalysis,
    handleGitDirectoryAnalysis,
    handleUpdateClass,
  };
};
