import { useCallback } from 'react';
import { dedupeAnonymous, refineClasses } from './projectAnalysisHelpers';

export const useCodeInputAnalysis = ({ analyzer, setShowAnalysisModal, setCurrentClasses }) => {
  const loadSample = useCallback(async (sampleCode) => {
    if (!analyzer) return;
    await analyzer.loadLanguage('js');
    const metadata = analyzer.extractClassMetadata(sampleCode, 'js');
    const classes = analyzer.analyze(sampleCode, 'js', metadata);
    const enriched = classes.map((cls) => ({ ...cls, filePath: 'sample.js', fileContent: sampleCode }));
    setCurrentClasses(refineClasses(dedupeAnonymous(enriched), metadata));
    setShowAnalysisModal(false);
  }, [analyzer, setCurrentClasses, setShowAnalysisModal]);

  const analyzeCodeInput = useCallback(async (sourceCode, ext) => {
    if (!analyzer || !sourceCode) return;
    await analyzer.loadLanguage(ext);
    const metadata = analyzer.extractClassMetadata(sourceCode, ext);
    const classes = analyzer.analyze(sourceCode, ext, metadata);
    const enriched = classes.map((cls) => ({ ...cls, filePath: `input.${ext}`, fileContent: sourceCode }));
    setCurrentClasses(refineClasses(dedupeAnonymous(enriched), metadata));
    setShowAnalysisModal(false);
    alert('코드 분석이 완료되었습니다.');
  }, [analyzer, setCurrentClasses, setShowAnalysisModal]);

  return { loadSample, analyzeCodeInput };
};

