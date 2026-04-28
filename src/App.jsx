import React, { useEffect, useState } from 'react';
import { CodeAnalyzer } from './CodeAnalyzer';
import { ProjectExtractor } from './services/ProjectExtractor';
import { toMermaid, toPlantUML, toDOT } from './Exporter';

// 분리된 컴포넌트들
import TabMenu from './components/TabMenu';
import ZipUpload from './components/ZipUpload';
import GitFolderUpload from './components/GitFolderUpload';
import CodeInput from './components/CodeInput';
import ControlPanel from './components/ControlPanel';
import MermaidDiagramDisplay from './components/DiagramDisplay';
import ClassSearch from './components/ClassSearch';
import Modal from './components/Modal';
import ClassDetailView from './components/ClassDetailView';
import { SAMPLE_CODE } from './constants/SampleCode';

const App = () => {
  const [code, setCode] = useState('');
  const [analyzer, setAnalyzer] = useState(null);
  const [currentClasses, setCurrentClasses] = useState([]); // 현재 분석된 클래스 목록 저장
  const [extension, setExtension] = useState('js'); // 기본 언어 설정
  const [layoutDir, setLayoutDir] = useState('TB'); // 레이아웃 방향 상태 (TB 또는 LR)
  const [gitUrl, setGitUrl] = useState(''); // 원격 Git URL 상태
  const [activeTab, setActiveTab] = useState('input'); // 'input', 'zip', 'git'
  const [isProcessing, setIsProcessing] = useState(false);
  const [showText, setShowText] = useState(false); // Mermaid 텍스트 표시 여부
  const [showAnalysisModal, setShowAnalysisModal] = useState(true); // 분석 입력 모달 표시 여부 (기본 true)
  const [showExportModal, setShowExportModal] = useState(false); // 내보내기 모달 표시 여부
  const [selectedClassName, setSelectedClassName] = useState(null); // 현재 선택된 상세 보기 클래스
  const [navigationHistory, setNavigationHistory] = useState([]); // 내비게이션 히스토리 스택
  const [processingStatus, setProcessingStatus] = useState({
    current: 0,
    total: 0,
    fileName: ''
  });

  const loadSample = () => {
    setCode(SAMPLE_CODE);
    // 샘플 로드 후 즉시 분석 시도 (analyzer가 있을 때만)
    if (analyzer) {
      // 샘플은 JS이므로 JS 언어팩 로드 확인 후 분석
      analyzer.loadLanguage('js').then(() => {
        const metadata = analyzer.extractClassMetadata(SAMPLE_CODE, 'js');
        const classes = analyzer.analyze(SAMPLE_CODE, 'js', metadata);

        // 중복 및 Anonymous 필터링 적용
        const filtered = Array.from(
          classes.reduce((map, obj) => (obj.name !== 'Anonymous' ? map.set(obj.name, obj) : map), new Map()).values()
        );
        setCurrentClasses(refineClasses(filtered, metadata));
        setShowAnalysisModal(false); // 분석 완료 시 모달 닫기
      });
    }
  };

  // 분석기 초기화
  useEffect(() => {
    const initAnalyzer = async () => {
      const instance = new CodeAnalyzer();
      await instance.init();
      setAnalyzer(instance);
    };
    initAnalyzer();
  }, []);

  // 분석 실행
  const handleAnalyze = () => {
    if (!analyzer || !code) return;
    analyzer.loadLanguage(extension).then(() => {
      try {
        const metadata = analyzer.extractClassMetadata(code, extension);
        const classes = analyzer.analyze(code, extension, metadata);

        // 중복 및 Anonymous 필터링 적용
        const filtered = Array.from(
          classes.reduce((map, obj) => (obj.name !== 'Anonymous' ? map.set(obj.name, obj) : map), new Map()).values()
        );
        setCurrentClasses(refineClasses(filtered, metadata));
        setShowAnalysisModal(false); // 분석 완료 시 모달 닫기
        alert("코드 분석이 완료되었습니다.");
      } catch (err) {
        console.error("Analysis failed:", err);
        alert("코드 분석 중 오류가 발생했습니다.");
      }
    });
  };

  // 언어 선택 변경 시 미리 로드 (UX 최적화)
  useEffect(() => {
    if (analyzer && activeTab === 'input') {
      analyzer.loadLanguage(extension);
    }
  }, [extension, analyzer, activeTab]);

  // 공통 분석 파이프라인 로직 (Stage 2 & 3)
  const runAnalysisPipeline = (projectMap, metadata) => {
    let allParsedClasses = [];
    for (const [path, data] of projectMap.entries()) {
      try {
        const classes = analyzer.analyze(data.content, data.ext, metadata);
        allParsedClasses = [...allParsedClasses, ...classes];
      } catch (e) {
        console.warn(`Analysis failed for ${path}`, e);
      }
    }
    const uniqueClasses = Array.from(
      allParsedClasses.reduce((map, obj) => (obj.name !== 'Anonymous' ? map.set(obj.name, obj) : map), new Map()).values()
    );
    setCurrentClasses(refineClasses(uniqueClasses, metadata));
    setShowAnalysisModal(false); // 분석 완료 시 모달 닫기
  };

  // 분석 결과 후처리: 타입 교정 및 자손 클래스 맵핑
  const refineClasses = (classes, metadataMap) => {
    const classMap = new Map(classes.map(c => [c.name, c]));

    // 1. 타입 기반 관계 교정 (상속 -> 구현)
    classes.forEach(cls => {
      const correctedParents = [];
      cls.parents.forEach(pName => {
        if (metadataMap.get(pName) === 'interface') {
          if (!cls.implements.includes(pName)) cls.implements.push(pName);
        } else {
          correctedParents.push(pName);
        }
      });
      cls.parents = correctedParents;
      cls.children = []; // 초기화
    });

    // 2. 자손 클래스(Children) 정보 수집
    classes.forEach(cls => {
      const allBaseTypes = [...cls.parents, ...cls.implements];
      allBaseTypes.forEach(baseName => {
        const baseClass = classMap.get(baseName);
        if (baseClass) {
          if (!baseClass.children.includes(cls.name)) {
            baseClass.children.push(cls.name);
          }
        }
      });
    });

    return [...classes];
  };

  // 파일 업로드 핸들러
  const handleZipUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !analyzer) return;
    try {
      setIsProcessing(true);
      const extractor = new ProjectExtractor();
      const { projectMap, metadata } = await extractor.fromZip(file, analyzer, setProcessingStatus);
      runAnalysisPipeline(projectMap, metadata);
    } catch (err) {
      alert(`Zip 분석 실패: ${err.message}`);
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  // 원격 Git 저장소 클론 및 분석 핸들러
  const handleRemoteGitAnalysis = async (url) => {
    try {
      setIsProcessing(true);
      const extractor = new ProjectExtractor();
      const { projectMap, metadata } = await extractor.fromRemoteGit(url, analyzer, setProcessingStatus);
      runAnalysisPipeline(projectMap, metadata);
    } catch (err) {
      alert(`원격 Git 분석 실패: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 로컬 .git 폴더 또는 폴더 선택 분석 핸들러
  const handleGitDirectoryAnalysis = async (files) => {
    try {
      setIsProcessing(true);
      const extractor = new ProjectExtractor();
      const { projectMap, metadata } = await extractor.fromLocalGit(files, analyzer, setProcessingStatus);
      runAnalysisPipeline(projectMap, metadata);
    } catch (err) {
      alert(`로컬 Git 분석 실패: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 클래스 선택 및 히스토리 관리
  const handleSelectClass = (name) => {
    if (name === null) {
      setSelectedClassName(null);
      setNavigationHistory([]); // 닫을 때 히스토리 초기화
      return;
    }

    // 현재 보고 있는 클래스가 있다면 히스토리에 추가 (중복 이동 방지)
    if (selectedClassName && selectedClassName !== name) {
      setNavigationHistory(prev => [...prev, selectedClassName]);
    }
    setSelectedClassName(name);
  };

  // 뒤로 가기 수행
  const handleGoBack = () => {
    if (navigationHistory.length === 0) return;
    const newHistory = [...navigationHistory];
    const prevClass = newHistory.pop();
    setNavigationHistory(newHistory);
    setSelectedClassName(prevClass);
  };

  // 클래스 정보 수정 시 상태 업데이트
  const handleUpdateClass = (updatedClass) => {
    setCurrentClasses(prev => prev.map(cls =>
      cls.name === updatedClass.name ? updatedClass : cls
    ));
  };

  const exportData = (type) => {
    if (!currentClasses || currentClasses.length === 0) {
      alert("먼저 분석을 진행해주세요.");
      return;
    }
    if (type === 'mmd') downloadFile(toMermaid(currentClasses, layoutDir), 'diagram.mmd');
    if (type === 'puml') downloadFile(toPlantUML(currentClasses, layoutDir), 'diagram.puml');
    if (type === 'dot') downloadFile(toDOT(currentClasses), 'diagram.dot');
  };

  // PNG 내보내기 구현
  const handlePngExport = () => {
    const svg = document.querySelector('.mermaid svg');
    if (!svg) {
      alert("다이어그램이 렌더링되지 않았습니다.");
      return;
    }
    const canvas = document.createElement('canvas');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngUrl = canvas.toDataURL('image/png');
      downloadFile(null, 'diagram.png', pngUrl);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // 공통 다운로드 함수 (URL 직접 지원 추가)
  const downloadFile = (content, filename, urlOverride = null) => {
    const url = urlOverride || URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    if (!urlOverride) URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '0 2rem 2rem 2rem', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '6px'
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#3b82f6', letterSpacing: '-0.02em' }}>GP</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowExportModal(true)}
              style={{ padding: '10px 20px', backgroundColor: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.borderColor = '#e2e8f0'; }}
            >저장 및 내보내기</button>
            <button
              onClick={() => setShowAnalysisModal(true)}
              style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#059669'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#10b981'; e.target.style.transform = 'translateY(0)'; }}
            >새 프로젝트 분석하기</button>
          </div>
        </div>

        {/* 분석 입력 모달 */}
        {showAnalysisModal && (
          <Modal onClose={() => !isProcessing && setShowAnalysisModal(false)}>
            <div style={{ padding: '32px' }}>
              <h2 style={{ marginTop: 0, marginBottom: '8px', color: '#0f172a', fontWeight: '800' }}>프로젝트 분석 시작</h2>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>분석할 소스 코드의 소스를 선택해주세요.</p>
              <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />
              <div style={{ marginTop: '24px' }}>
                {activeTab === 'zip' && (
                  <ZipUpload isProcessing={isProcessing} processingStatus={processingStatus} onUpload={handleZipUpload} />
                )}
                {activeTab === 'git' && (
                  <GitFolderUpload
                    onUpload={handleGitDirectoryAnalysis}
                    onRemoteAnalyze={handleRemoteGitAnalysis}
                    gitUrl={gitUrl} setGitUrl={setGitUrl}
                    isProcessing={isProcessing} processingStatus={processingStatus}
                  />
                )}
                {activeTab === 'input' && (
                  <CodeInput
                    extension={extension} setExtension={setExtension}
                    code={code} setCode={setCode}
                    onAnalyze={handleAnalyze} onLoadSample={loadSample}
                  />
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* 클래스 검색 및 상세 정보 영역 */}
        <div style={{ marginTop: '10px' }}>
          <style>{`
            .dashboard-container {
              display: flex;
              flex-direction: column;
              gap: 20px;
            }
            .class-detail-card {
              max-height: none;
              overflow-y: visible;
            }
            @media (min-width: 1024px) {
              .dashboard-container {
                flex-direction: row;
                align-items: flex-start;
              }
              .detail-pane {
                flex: 1;
                min-width: 0;
                position: sticky;
                top: 24px;
              }
              .class-detail-card {
                max-height: calc(100vh - 160px);
                overflow-y: auto;
              }
              .diagram-pane {
                flex: 1.5;
                min-width: 0;
              }
            }
          `}</style>

          <div className="dashboard-container">
            <div className="detail-pane">
              <ClassSearch classes={currentClasses} onSelectClass={handleSelectClass} />
              <ClassDetailView
                classInfo={currentClasses.find(c => c.name === selectedClassName)}
                onSelectClass={handleSelectClass}
                extension={extension}
                onBack={handleGoBack}
                hasHistory={navigationHistory.length > 0}
                onUpdate={handleUpdateClass}
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
              />
            </div>
          </div>
        </div>

        {/* 내보내기 옵션 모달 */}
        {showExportModal && (
          <Modal onClose={() => setShowExportModal(false)}>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <h3 style={{ marginTop: 0, color: '#0f172a', fontWeight: '800' }}>다이어그램 내보내기</h3>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>원하는 파일 형식을 선택하여 저장하세요.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button className='secondary-btn' onClick={() => { exportData('mmd'); setShowExportModal(false); }}>Mermaid (.mmd)</button>
                <button className='secondary-btn' onClick={() => { handlePngExport(); setShowExportModal(false); }}>이미지 (.png)</button>
                <button className='secondary-btn' onClick={() => { exportData('puml'); setShowExportModal(false); }}>PlantUML (.puml)</button>
                <button className='secondary-btn' onClick={() => { exportData('dot'); setShowExportModal(false); }}>Graphviz (.dot)</button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default App;