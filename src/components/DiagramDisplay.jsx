import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { toMermaid } from '../Exporter';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  useMaxWidth: false,
  class: { useMaxWidth: false },
  classDiagram: { useMaxWidth: false },
});

const MermaidDiagramDisplay = ({ classes, layoutDir, setLayoutDir, showText, setShowText }) => {
  const [mermaidScript, setMermaidScript] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const mermaidRef = useRef(null);
  const transformComponentRef = useRef(null);

  // 분석 결과나 레이아웃 방향이 바뀔 때 스크립트 갱신
  useEffect(() => {
    if (classes && classes.length > 0) {
      const script = toMermaid(classes, layoutDir);
      setMermaidScript(script);
    } else {
      setMermaidScript('');
    }
  }, [classes, layoutDir]);

  // Mermaid 스크립트가 준비되면 렌더링 수행
  useEffect(() => {
    const renderMermaid = async () => {
      if (mermaidScript && mermaidRef.current) {
        try {
          setIsRendering(true);
          
          // 1. 텍스트 렌더링 및 가시성 확보를 위해 줌 상태를 1:1(1.0)로 초기화
          if (transformComponentRef.current) {
            transformComponentRef.current.setTransform(0, 0, 1);
          }

          // UI 업데이트를 위해 0ms 지연
          await new Promise(resolve => setTimeout(resolve, 0));
          
          mermaidRef.current.removeAttribute('data-processed');
          mermaidRef.current.textContent = mermaidScript;
          
          await mermaid.run({
            nodes: [mermaidRef.current],
          });

          const svg = mermaidRef.current.querySelector('svg');
          if (svg) {
            svg.style.maxWidth = 'none';
            svg.style.height = 'auto';
            // viewBox를 기준으로 실제 너비를 픽셀로 고정하여 축소 방지
            if (svg.viewBox && svg.viewBox.baseVal) {
              const { width } = svg.viewBox.baseVal;
              if (width > 0) svg.style.width = `${width}px`;
            }
            
            // 2. 렌더링 완료 후 다이어그램이 화면에 꽉 차도록 자동 피팅
            // 즉시 호출 시 SVG 크기 계산이 미완료일 수 있어 브라우저 프레임에 맞게 지연 실행합니다.
            requestAnimationFrame(() => {
              transformComponentRef.current?.zoomToElement(svg);
            });
          }
        } catch (err) {
          console.error("Mermaid rendering failed:", err);
        } finally {
          setIsRendering(false);
        }
      }
    };
    renderMermaid();
  }, [mermaidScript]);

  // 툴바 스타일
  const toolbarStyle = {
    position: 'absolute',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    gap: '8px',
    padding: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 20
  };

  const btnStyle = {
    padding: '8px 14px',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  return (
    <>
      <style>{`
        .mermaid svg {
          display: inline-block !important;
        }
        .mermaid g.node rect {
          min-width: 100px !important;
        }
        .diagram-toolbar-btn:hover {
          background-color: #f8fafc !important;
          border-color: #cbd5e1 !important;
          transform: translateY(-1px);
        }
        .diagram-header-select {
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          font-size: 0.8rem;
          font-weight: 500;
          color: #334155;
          outline: none;
          cursor: pointer;
        }
        .diagram-header-btn {
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }
        .diagram-header-btn:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }
      `}</style>

      {/* Diagram Header Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderBottom: 'none',
        borderRadius: '12px 12px 0 0',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Layout</label>
          <select 
            className="diagram-header-select"
            value={layoutDir} 
            onChange={(e) => setLayoutDir(e.target.value)}
          >
            <option value="TB">상하 (TB)</option>
            <option value="LR">좌우 (LR)</option>
            <option value="BT">하상 (BT)</option>
            <option value="RL">우좌 (RL)</option>
          </select>
        </div>
        <button className="diagram-header-btn" onClick={() => setShowText(!showText)}>
          {showText ? '📜 텍스트 숨기기' : '📜 텍스트 보기'}
        </button>
      </div>

      {showText && (
        <div style={{ width: '100%', display: 'flex'}}>
          <textarea
            rows="10"
            style={{ flex: 1, padding: '16px', fontFamily: 'monospace', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '10px', fontSize: '13px', color: '#334155' }}
            value={mermaidScript}
            onChange={(e) => setMermaidScript(e.target.value)}
            placeholder="Mermaid 스크립트 디버깅용..."
          />
        </div>
      )}
      <div 
        style={{ 
          border: '1px solid #e2e8f0',
          background: '#f8fafc',
          backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          overflow: 'hidden', // 줌 기능을 위해 내부 스크롤 대신 hidden 사용
          width: '100%',
          height: '500px', // 시각적 확보를 위해 높이를 약간 늘림
          position: 'relative',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <TransformWrapper
          ref={transformComponentRef}
          initialScale={1}
          minScale={0.1}
          maxScale={8}
          centerOnInit={true}
          wrapperStyle={{ width: "100%", height: "100%", overflow: "hidden" }}
          limitToBounds={true} // 사용자의 요청대로 이동 제한을 다시 활성화하여 다이어그램 밖으로 나가지 않게 합니다.
          panning={{
            velocityDisabled: false, // 이동 후 가속도를 유지하여 더 부드러운 체감을 제공합니다.
            allowLeftClickPan: true
          }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div style={toolbarStyle}>
                <button className="diagram-toolbar-btn" style={btnStyle} onClick={() => zoomIn()}><span>➕</span> 확대</button>
                <button className="diagram-toolbar-btn" style={btnStyle} onClick={() => zoomOut()}><span>➖</span> 축소</button>
                <button className="diagram-toolbar-btn" style={btnStyle} onClick={() => resetTransform()}><span>🔄</span> 리셋</button>
                <button className="diagram-toolbar-btn" style={btnStyle} onClick={() => {
                  const svg = mermaidRef.current.querySelector('svg');
                  if (svg) transformComponentRef.current.zoomToElement(svg);
                }}><span>🔍</span> 맞춤</button>
              </div>
              
              {isRendering && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(2px)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  zIndex: 10, fontWeight: '700', color: '#3b82f6',
                  borderRadius: '12px'
                }}>
                  <div style={{ padding: '12px 24px', backgroundColor: '#fff', borderRadius: '30px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                    다이어그램 생성 중...
                  </div>
                </div>
              )}

              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }} // 부모의 제한된 높이를 가득 채우도록 수정
                contentStyle={{ cursor: isRendering ? 'wait' : 'grab' }}
              >
                <div style={{ padding: '100px', display: 'inline-block', minWidth: 'max-content', minHeight: 'max-content' }}>
                  <div ref={mermaidRef} className="mermaid">
                    {!mermaidScript && (
                      <div style={{ textAlign: 'center', color: '#888', width: '100%' }}>
                        코드를 입력하거나 프로젝트를 업로드하고 버튼을 눌러주세요.
                      </div>
                    )}
                  </div>
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </>
  );
};

export default MermaidDiagramDisplay;