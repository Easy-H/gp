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
      --app-danger: #ef4444;
      --app-success: #10b981;
      --app-warning: #f59e0b;
      --app-info: #6366f1;
      --app-link-bg: #eff6ff;
      --app-link-text: #2563eb;
      --app-on-accent: #ffffff;
      --panel-layout-bg: #d9e2ee;
      --panel-layout-box: #ffffff;
      --panel-layout-surface: #c2cedd;
      --panel-layout-text: #1e293b;
      --control-radius: 8px;
      --control-height-sm: 30px;
      --control-height-md: 38px;
      --control-height-lg: 42px;
      --control-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
      --panel-space: 12px;
      --panel-gap: 10px;
      --panel-section-gap: 12px;
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
    .app-btn,
    .secondary-btn {
      min-height: var(--control-height-md);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 14px;
      background-color: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--control-radius);
      cursor: pointer;
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1;
      color: var(--app-text);
      transition: all 0.2s;
      box-shadow: var(--control-shadow);
      white-space: nowrap;
      box-sizing: border-box;
    }
    .app-btn:hover,
    .secondary-btn:hover {
      background-color: var(--app-surface-2);
      border-color: var(--app-primary);
      transform: translateY(-1px);
    }
    .app-btn:disabled,
    .secondary-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
    }
    .app-btn-primary {
      background-color: var(--app-primary);
      border-color: color-mix(in srgb, var(--app-primary) 70%, black);
      color: var(--app-on-accent);
      box-shadow: 0 10px 18px -10px color-mix(in srgb, var(--app-primary) 55%, transparent);
    }
    .app-btn-primary:hover {
      background-color: color-mix(in srgb, var(--app-primary) 88%, black);
      border-color: color-mix(in srgb, var(--app-primary) 74%, black);
    }
    .app-btn-ghost {
      background-color: transparent;
      box-shadow: none;
    }
    .app-icon-btn {
      width: var(--control-height-md);
      height: var(--control-height-md);
      min-height: var(--control-height-md);
      padding: 0;
      font-size: 1rem;
      font-weight: 700;
    }
    .app-icon-btn-lg {
      width: 40px;
      height: 40px;
      min-height: 40px;
      font-size: 1.2rem;
      font-weight: 800;
    }
    .app-btn-sm {
      min-height: var(--control-height-sm);
      padding: 0 10px;
      font-size: 0.75rem;
    }
    .app-input,
    .app-select,
    .app-textarea {
      width: 100%;
      min-height: var(--control-height-md);
      padding: 0 12px;
      border: 1px solid var(--panel-border);
      border-radius: var(--control-radius);
      background: var(--panel-bg);
      color: var(--panel-text);
      font-size: 0.875rem;
      line-height: 1.4;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
    }
    .app-input::placeholder,
    .app-textarea::placeholder {
      color: var(--panel-muted);
      opacity: 0.8;
    }
    .app-input:hover,
    .app-select:hover,
    .app-textarea:hover {
      border-color: color-mix(in srgb, var(--app-primary) 45%, var(--panel-border));
    }
    .app-input:focus,
    .app-select:focus,
    .app-textarea:focus {
      border-color: var(--app-primary);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--app-primary) 18%, transparent);
    }
    .app-input-lg {
      min-height: var(--control-height-lg);
    }
    .app-input-sm,
    .app-select-sm {
      min-height: var(--control-height-sm);
      padding: 0 8px;
      font-size: 0.75rem;
    }
    .app-select {
      cursor: pointer;
    }
    .app-textarea {
      display: block;
      min-height: 0;
      padding: 12px;
      resize: vertical;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      overflow-x: hidden;
    }
    .app-textarea-code {
      background: var(--panel-code-bg);
      font-size: 0.8125rem;
      line-height: 1.55;
    }
    .analysis-panel-shell {
      height: 100%;
      min-height: 0;
      overflow: hidden;
      padding: var(--panel-space);
      background: var(--panel-bg);
      color: var(--panel-text);
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .analysis-panel-shell.flush {
      padding: 0;
    }
    .analysis-panel-stack {
      display: flex;
      flex-direction: column;
      gap: var(--panel-gap);
      flex: 1;
      min-height: 0;
    }
    .analysis-panel-scroll {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding: var(--panel-space);
      box-sizing: border-box;
    }
  `}</style>
);

export default AppStyles;
