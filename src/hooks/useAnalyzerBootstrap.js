import { useEffect } from 'react';
import { CodeAnalyzer } from '../CodeAnalyzer';

export const useAnalyzerBootstrap = ({ analyzer, setAnalyzer, extension, activeTab }) => {
  useEffect(() => {
    const initAnalyzer = async () => {
      const instance = new CodeAnalyzer();
      await instance.init();
      setAnalyzer(instance);
    };
    initAnalyzer();
  }, [setAnalyzer]);

  useEffect(() => {
    if (analyzer && activeTab === 'input') {
      analyzer.loadLanguage(extension);
    }
  }, [extension, analyzer, activeTab]);
};

