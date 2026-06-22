import React from 'react';
import { View } from 'react-native';

export interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  colors: {
    primary: string;
  };
}

export const ResizeHandle: React.FC<ResizeHandleProps> = () => {
  return null;
};
