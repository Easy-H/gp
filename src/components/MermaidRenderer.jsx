import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  useMaxWidth: false,
  class: { useMaxWidth: false },
  classDiagram: { useMaxWidth: false },
});

const MermaidRenderer = ({ mermaidScript, isRendering, setIsRendering }) => {
  const mermaidRef = useRef(null);
  const transformComponentRef = useRef(null);

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
            svg.style.maxWidth = 'none';
            svg.style.height = 'auto';
            if (svg.viewBox && svg.viewBox.baseVal) {
              const { width } = svg.viewBox.baseVal;
              if (width > 0) svg.style.width = `${width}px`;
            }

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
    <div
      style={{
        border: '1px solid #e2e8f0',
        background: '#f8fafc',
        backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        overflow: 'hidden',
        width: '100%',
        height: '500px',
        position: 'relative',
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
        limitToBounds={true}
        panning={{
          velocityDisabled: false,
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
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(2px)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 10, fontWeight: '700', color: '#3b82f6', borderRadius: '12px'
              }}>
                <div style={{ padding: '12px 24px', backgroundColor: '#fff', borderRadius: '30px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                  다이어그램 생성 중...
                </div>
              </div>
            )}

            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ cursor: isRendering ? 'wait' : 'grab' }}>
              <div style={{ padding: '100px', display: 'inline-block', minWidth: 'max-content', minHeight: 'max-content' }}>
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