import React from 'react';
import MermaidDiagramDisplay from '../features/analysis-result/diagram/DiagramDisplay';
import ClassSearch from '../features/analysis-result/source/ClassSearch';
import ClassDetailView from '../features/analysis-result/details/ClassDetailView';

const WorkspaceDashboard = ({
  currentClasses,
  selectedClassName,
  onSelectClass,
  onGoBack,
  navigationHistory,
  onUpdateClass,
  extension,
  layoutDir,
  setLayoutDir,
  showText,
  setShowText,
  maxTextSize,
  setMaxTextSize,
}) => {
  return (
    <>
      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .class-detail-card {
          display: flex;
          flex-direction: column;
        }
        .internal-split-layout {
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 1024px) {
          .internal-split-layout {
            flex-direction: row;
            align-items: stretch;
          }
          .internal-split-layout > * {
            flex: 1;
            min-width: 0;
          }
          .class-detail-card {
            height: 750px;
            max-height: calc(100vh - 160px);
            overflow: hidden;
          }
          .detail-pane, .diagram-pane {
            width: 100%;
          }
        }
      `}</style>
      <div className="dashboard-container">
        <div className="detail-pane">
          <ClassSearch classes={currentClasses} onSelectClass={onSelectClass} />
          <ClassDetailView
            classInfo={currentClasses.find(c => c.name === selectedClassName)}
            onSelectClass={onSelectClass}
            extension={extension}
            onBack={onGoBack}
            hasHistory={navigationHistory.length > 0}
            onUpdate={onUpdateClass}
            allClassNames={currentClasses.map(c => c.name)}
          />
        </div>
        <div className="diagram-pane">
          <MermaidDiagramDisplay
            classes={currentClasses}
            layoutDir={layoutDir}
            setLayoutDir={setLayoutDir}
            showText={showText}
            setShowText={setShowText}
            selectedClassName={selectedClassName}
            maxTextSize={maxTextSize}
            setMaxTextSize={setMaxTextSize}
          />
        </div>
      </div>
    </>
  );
};

export default WorkspaceDashboard;
