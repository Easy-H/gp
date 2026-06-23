import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const MermaidRenderer = ({ mermaidScript, isRendering, setIsRendering, selectedClassName, maxTextSize }) => {
  const mermaidRef = useRef(null);
  const transformComponentRef = useRef(null);

  // maxTextSize가 변경될 때마다 Mermaid 재설정
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      maxTextSize: maxTextSize || 500000,
      useMaxWidth: false,
      class: { useMaxWidth: false },
      classDiagram: { useMaxWidth: false },
    });
  }, [maxTextSize]);

  useEffect(() => {
    const renderMermaid = async () => {
      if (mermaidScript && mermaidRef.current) {
        try {
          setIsRendering(true);

          if (transformComponentRef.current) {
            transformComponentRef.current.resetTransform(0);
          }

          await new Promise(resolve => setTimeout(resolve, 100));

          mermaidRef.current.removeAttribute('data-processed');
          mermaidRef.current.textContent = mermaidScript;

          await mermaid.run({
            nodes: [mermaidRef.current],
          });

          const svg = mermaidRef.current.querySelector('svg');
          if (svg) {
            svg.style.maxWidth = '100%';
            svg.style.width = '100%';
            svg.style.height = 'auto';
            svg.style.display = 'block';

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
  }, [mermaidScript, setIsRendering]);

  // 특정 클래스가 선택되었을 때 해당 위치로 이동 및 확대
  useEffect(() => {
    if (!isRendering && selectedClassName && mermaidRef.current) {
      const svg = mermaidRef.current.querySelector('svg');
      if (svg) {
        // Mermaid 클래스 다이어그램에서 노드는 보통 .node 클래스를 가짐
        const nodes = Array.from(svg.querySelectorAll('.node'));
        
        // 클래스 이름을 포함하는 텍스트 요소를 가진 노드 찾기
        const targetNode = nodes.find(node => {
          const labels = Array.from(node.querySelectorAll('text, .classTitle'));
          return labels.some(label => label.textContent.trim() === selectedClassName);
        });

        if (targetNode) {
          // 해당 요소로 이동 (scale을 조절하여 적절히 확대 가능)
          setTimeout(() => {
            // zoomToElement(node, scale, animationTime)
            transformComponentRef.current?.zoomToElement(targetNode, 1.2, 500);
          }, 50);
        }
      }
    }
  }, [selectedClassName, isRendering]);

  const toolbarStyle = {
    position: 'absolute',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    gap: '8px',
    padding: '6px',
    backgroundColor: 'color-mix(in srgb, var(--panel-bg) 88%, transparent)',
    backdropFilter: 'blur(8px)',
    border: '1px solid var(--panel-border)',
    borderRadius: '10px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 20,
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
    overflowX: 'auto',
    overflowY: 'hidden',
    maxWidth: 'calc(100% - 48px)',
  };

  const btnStyle = {
    minHeight: 'var(--control-height-md)',
    padding: '0 14px',
    backgroundColor: 'var(--panel-bg)',
    border: '1px solid var(--panel-border)',
    borderRadius: 'var(--control-radius)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--panel-text)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: 'var(--control-shadow)',
    whiteSpace: 'nowrap',
  };

  const hideScrollbarStyle = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const toolbarScrollbarStyle = {
    ...hideScrollbarStyle,
    WebkitOverflowScrolling: 'touch',
  };

  return (
    <div
      style={{
        background: 'var(--panel-bg)',
        backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.18) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        minHeight: 0,
        position: 'relative',
      }}
    >
      <style>{`
        .diagram-control-scrollbar-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .diagram-control-scrollbar-hidden::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
      `}</style>
      <TransformWrapper
        ref={transformComponentRef}
        initialScale={1}
        minScale={0.1}
        maxScale={8}
        centerOnInit={true}
        wrapperStyle={{ width: "100%", height: "100%", overflow: "hidden" }}
        limitToBounds={true}
        panning={{
          velocityDisabled: false,
          allowLeftClickPan: true
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="diagram-control-scrollbar-hidden" style={{ ...toolbarStyle, ...toolbarScrollbarStyle }}>
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
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'color-mix(in srgb, var(--panel-bg) 70%, transparent)', backdropFilter: 'blur(2px)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 10, fontWeight: '700', color: '#3b82f6', borderRadius: '12px'
              }}>
                <div style={{ padding: '12px 24px', backgroundColor: 'var(--panel-bg)', color: 'var(--panel-text)', borderRadius: '30px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                  다이어그램 생성 중...
                </div>
              </div>
            )}

            <TransformComponent wrapperStyle={{ width: "100%", height: "100%", ...hideScrollbarStyle }} contentStyle={{ cursor: isRendering ? 'wait' : 'grab', width: '100%', height: '100%', minWidth: '100%' }}>
              <div style={{ padding: '12px', display: 'block', minWidth: '100%', minHeight: '100%', width: '100%', height: '100%', boxSizing: 'border-box' }}>
                <div ref={mermaidRef} className="mermaid" />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default MermaidRenderer;
