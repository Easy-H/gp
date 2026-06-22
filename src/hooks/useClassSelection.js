import { useState } from 'react';

export const useClassSelection = () => {
  const [selectedClassName, setSelectedClassName] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);

  const handleSelectClass = (name) => {
    if (name === null) {
      setSelectedClassName(null);
      setNavigationHistory([]);
      return;
    }

    setNavigationHistory((prev) => {
      if (selectedClassName && selectedClassName !== name) {
        return [...prev, selectedClassName];
      }
      return prev;
    });

    setSelectedClassName(name);
  };

  const handleGoBack = () => {
    setNavigationHistory((prev) => {
      if (prev.length === 0) return prev;
      const nextHistory = [...prev];
      const prevClass = nextHistory.pop();
      setSelectedClassName(prevClass ?? null);
      return nextHistory;
    });
  };

  return {
    selectedClassName,
    navigationHistory,
    handleSelectClass,
    handleGoBack,
    setSelectedClassName,
    setNavigationHistory,
  };
};

