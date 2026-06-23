import React, { useEffect, useMemo, useState } from 'react';
import { GenericPanelLayout } from '../../../@packages/panel-layout/components/GenericPanelLayout';
import MermaidDiagramDisplay from './diagram/DiagramDisplay';
import DiagramEditorPanel from './diagram/DiagramEditorPanel';
import ClassSearch from './source/ClassSearch';
import ClassDetailView from './details/ClassDetailView';
import Modal from '../../components/Modal';
import { toMermaid } from '../../Exporter';

const PANEL_TYPES = {
  source: { title: '소스' },
  details: { title: '상세' },
  diagram: { title: '다이어그램' },
  diagramEditor: { title: '다이어그램 편집' },
};

const createPanel = (type) => ({
  id: `${type}-${Math.random().toString(36).slice(2, 9)}`,
  type,
  title: PANEL_TYPES[type]?.title ?? type,
});

const panelColors = {
  background: 'var(--panel-layout-bg)',
  box: 'var(--panel-layout-box)',
  surface: 'var(--panel-layout-surface)',
  text: 'var(--panel-layout-text)',
  primary: 'var(--app-primary)',
};

const renderPanelTabLabel = (item, isActive) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: 24,
      fontSize: 13,
      lineHeight: '18px',
      fontWeight: isActive ? 800 : 600,
      letterSpacing: '-0.01em',
      color: isActive ? 'var(--app-primary)' : 'var(--panel-layout-text)',
      opacity: isActive ? 1 : 0.72,
    }}
  >
    {item.title}
  </span>
);

const searchBoxStyle = {
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
};

const searchDropdownStyle = {
  width: '100%',
  backgroundColor: 'var(--panel-bg)',
  border: '1px solid var(--panel-border)',
  boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)',
  maxHeight: '220px',
  overflowY: 'auto',
  borderRadius: 12,
};

const SourcePanel = ({ selectedClass, classes, onSelectClass }) => {
  const [sourceQuery, setSourceQuery] = useState('');
  const sourceText = selectedClass?.fileContent || '';
  const sourceLines = sourceText.split(/\r?\n/);
  const matchedLines = sourceQuery
    ? sourceLines
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => line.toLowerCase().includes(sourceQuery.toLowerCase()))
    : [];

  return (
    <div className="analysis-panel-shell">
      <div className="analysis-panel-stack">
        {!selectedClass ? (
          <div className="analysis-panel-stack">
            <input className="app-input app-input-lg" value={sourceQuery} onChange={(e) => setSourceQuery(e.target.value)} placeholder="원본 코드 검색" style={searchBoxStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--panel-gap)', overflow: 'auto', minHeight: 0, alignContent: 'start' }}>
              {classes.filter((c) => c.name.toLowerCase().includes(sourceQuery.toLowerCase())).map((c) => (
                <button key={c.name} className="app-btn" onClick={() => onSelectClass(c.name)} style={{ justifyContent: 'flex-start', minHeight: 44, textAlign: 'left' }}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="analysis-panel-stack" style={{ position: 'relative' }}>
            <input className="app-input app-input-lg" value={sourceQuery} onChange={(e) => setSourceQuery(e.target.value)} placeholder="원본 코드 검색" style={searchBoxStyle} />
            <div style={{ background: 'var(--panel-code-bg)', borderRadius: 'var(--control-radius)', border: '1px solid var(--panel-border)', overflow: 'hidden', minHeight: 0, flex: sourceQuery ? '0 0 auto' : '1 1 auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <button
                className="app-btn app-icon-btn"
                onClick={() => onSelectClass(null)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  zIndex: 40,
                }}
                aria-label="초기 화면으로 닫기"
                title="초기 화면으로 닫기"
              >
                ×
              </button>
              <pre style={{ margin: 0, padding: '14px 48px 14px 14px', color: 'var(--panel-text)', fontSize: '0.85rem', fontFamily: 'monospace', overflow: 'auto', lineHeight: '1.6', flex: 1, minHeight: 0 }}>
                {sourceText || '// No content available'}
              </pre>
            </div>
            {sourceQuery && (
              <div style={searchDropdownStyle}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--panel-border)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--panel-muted)' }}>검색 결과 {matchedLines.length}개</div>
                {matchedLines.length > 0 ? matchedLines.map(({ line, index }) => (
                  <div key={index} style={{ padding: '12px', borderBottom: '1px solid var(--panel-border)', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--panel-text)' }}>
                    <span style={{ color: 'var(--panel-muted)', marginRight: 8 }}>{index + 1}</span>
                    {line}
                  </div>
                )) : <div style={{ padding: 12, color: 'var(--panel-muted)', fontSize: '0.85rem' }}>일치하는 코드가 없습니다.</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AnalysisPanelWorkspace = (props) => {
  const { panels, setPanels, currentClasses, selectedClassName, handleSelectClass, handleGoBack, navigationHistory, handleUpdateClass, extension, layoutDir, setLayoutDir, showText, setShowText, maxTextSize, setMaxTextSize, onOpenExport } = props;
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [diagramScript, setDiagramScript] = useState('');
  const [diagramDraft, setDiagramDraft] = useState('');
  const items = useMemo(() => panels.map((panel) => ({ ...panel })), [panels]);
  const addPanel = (type) => setPanels((prev) => [...prev, createPanel(type)]);
  const selectedClass = currentClasses.find((c) => c.name === selectedClassName);

  useEffect(() => {
    if (currentClasses.length > 0) {
      const script = toMermaid(currentClasses, layoutDir);
      setDiagramScript(script);
      setDiagramDraft(script);
    } else {
      setDiagramScript('');
      setDiagramDraft('');
    }
  }, [currentClasses, layoutDir]);

  const renderPanel = (item) => {
    if (item.type === 'source') return <SourcePanel selectedClass={selectedClass} classes={currentClasses} onSelectClass={handleSelectClass} />;
    if (item.type === 'search') return <div className="analysis-panel-shell"><ClassSearch classes={currentClasses} onSelectClass={handleSelectClass} /></div>;
    if (item.type === 'details') return <div className="analysis-panel-shell"><div style={{ marginBottom: 'var(--panel-gap)', flexShrink: 0 }}><ClassSearch classes={currentClasses} onSelectClass={handleSelectClass} /></div><div style={{ flex: 1, minHeight: 0, display: 'flex' }}><ClassDetailView classInfo={selectedClass} onSelectClass={handleSelectClass} extension={extension} onBack={handleGoBack} hasHistory={navigationHistory.length > 0} onUpdate={handleUpdateClass} allClassNames={currentClasses.map((c) => c.name)} /></div></div>;
    if (item.type === 'diagram') return <div className="analysis-panel-shell flush"><div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}><MermaidDiagramDisplay mermaidScript={diagramScript} selectedClassName={selectedClassName} maxTextSize={maxTextSize} setMaxTextSize={setMaxTextSize} onOpenExport={onOpenExport} isRendering={false} setIsRendering={() => {}} layoutDir={layoutDir} setLayoutDir={setLayoutDir} /></div></div>;
    if (item.type === 'diagramEditor') return <DiagramEditorPanel value={diagramDraft} onChange={setDiagramDraft} onApply={() => setDiagramScript(diagramDraft)} />;
    return null;
  };

  return <>
      <div style={{ width: '100%', height: '100%', maxHeight: '100%', minHeight: 0, overflow: 'hidden' }}>
        <GenericPanelLayout items={items} colors={panelColors} renderTabLabel={renderPanelTabLabel} renderItem={(item) => renderPanel(item)} onAddItem={async () => { setAddModalOpen(true); return undefined; }} onRemoveItem={(item) => setPanels((prev) => prev.filter((panel) => panel.id !== item.id))} labels={{ toVertical: '세로', toHorizontal: '가로' }} maxColumns={4} maxRows={3} />
      </div>
    {addModalOpen && (
      <Modal
        onClose={() => setAddModalOpen(false)}
        maxWidth="420px"
        title="추가할 패널을 선택하세요"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
          {Object.entries(PANEL_TYPES).map(([key, meta]) => (
            <button
              key={key}
              className="secondary-btn"
              onClick={() => {
                addPanel(key);
                setAddModalOpen(false);
              }}
            >
              {meta.title}
            </button>
          ))}
        </div>
      </Modal>
    )}
  </>;
};

export default AnalysisPanelWorkspace;
