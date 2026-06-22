import React from 'react';

const AppStyles = () => (
  <style>{`
    body {
      margin: 0;
      background-color: var(--app-bg);
      color: var(--app-text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    :root {
      --panel-bg: var(--app-surface);
      --panel-bg-2: var(--app-surface-2);
      --panel-border: var(--app-border);
      --panel-text: var(--app-text);
      --panel-muted: var(--app-muted);
      --panel-code-bg: var(--app-code-bg);
      --app-primary: #3b82f6;
    }
    /* 현대적인 커스텀 스크롤바 */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: var(--app-surface-2);
    }
    ::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--app-primary) 30%, var(--app-muted));
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: color-mix(in srgb, var(--app-primary) 50%, var(--app-muted));
    }
    .secondary-btn {
      padding: 12px;
      background-color: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      color: var(--app-text);
      transition: all 0.2s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .secondary-btn:hover {
      background-color: var(--app-surface-2);
      border-color: var(--app-primary);
      transform: translateY(-1px);
    }
  `}</style>
);

export default AppStyles;
