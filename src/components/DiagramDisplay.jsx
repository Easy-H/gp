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

const MermaidDiagramDisplay = ({ classes, layoutDir, showText }) => {
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
    bottom: '20px',
    right: '20px',
    display: 'flex',
    gap: '5px',
    zIndex: 20
  };

  const btnStyle = {
    padding: '8px 12px',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
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
      `}</style>
      {showText && (
        <div style={{ width: '100%', display: 'flex'}}>
          <textarea
            rows="10"
            style={{ flex: 1, padding: '10px', fontFamily: 'monospace', backgroundColor: '#fff', border: '2px solid #fff9c4' }}
            value={mermaidScript}
            onChange={(e) => setMermaidScript(e.target.value)}
            placeholder="Mermaid 스크립트 디버깅용..."
          />
        </div>
      )}
      <div 
        style={{ 
          border: '1px solid #ddd', 
          background: '#f9f9f9',
          overflow: 'hidden', // 줌 기능을 위해 내부 스크롤 대신 hidden 사용
          width: '100%',
          height: '500px', // 높이를 500px로 완전히 고정합니다.
          position: 'relative'
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
                <button style={btnStyle} onClick={() => zoomIn()}>확대 (+)</button>
                <button style={btnStyle} onClick={() => zoomOut()}>축소 (-)</button>
                <button style={btnStyle} onClick={() => resetTransform()}>초기화 (1:1)</button>
                <button style={btnStyle} onClick={() => {
                  const svg = mermaidRef.current.querySelector('svg');
                  if (svg) transformComponentRef.current.zoomToElement(svg);
                }}>전체 보기</button>
              </div>
              
              {isRendering && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  zIndex: 10, fontWeight: 'bold', color: '#007bff'
                }}>
                  다이어그램 렌더링 중...
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