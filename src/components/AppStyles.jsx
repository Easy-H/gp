import React from 'react';

const AppStyles = () => (
  <style>{`
    body {
      margin: 0;
      background-color: #f8fafc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    /* 현대적인 커스텀 스크롤바 */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    .secondary-btn {
      padding: 12px;
      background-color: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      color: #475569;
      transition: all 0.2s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .secondary-btn:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }
  `}</style>
);

export default AppStyles;

