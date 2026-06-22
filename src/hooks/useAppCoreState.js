import { useState } from 'react';

export const useAppCoreState = () => {
  const [code, setCode] = useState('');
  const [analyzer, setAnalyzer] = useState(null);

  return {
    code,
    setCode,
    analyzer,
    setAnalyzer,
  };
};

