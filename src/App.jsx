import React, { useEffect, useState } from 'react';
import { CodeAnalyzer } from './CodeAnalyzer';
import { ProjectExtractor } from './services/ProjectExtractor';
import { toPlantUML, toDOT } from './Exporter';

// 분리된 컴포넌트들
import TabMenu from './components/TabMenu';
import ZipUpload from './components/ZipUpload';
import GitFolderUpload from './components/GitFolderUpload';
import CodeInput from './components/CodeInput';
import ControlPanel from './components/ControlPanel';
import MermaidDiagramDisplay from './components/DiagramDisplay';

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
  const [processingStatus, setProcessingStatus] = useState({
    current: 0,
    total: 0,
    fileName: ''
  });

  const SAMPLE_CODE = `class Shape {
  color = "red";
  getArea() { return 0; }
  display() { console.log('Displaying...'); }
}

class Rectangle extends Shape {
  width = 10;
  height = 20;
  getArea() { return this.width * this.height; }
}

class Circle extends Shape {
  radius = 5;
  getArea() { return Math.PI * this.radius ** 2; }
  getRadius() { return this.radius; }
}

class DrawingApp {
  constructor() {
    this.mainShape = new Circle();
  }
}

class Logger {
  log(msg) { console.log(msg); }
}`;

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
        setCurrentClasses(filtered);
        alert("샘플 코드 분석이 완료되었습니다.");
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
        setCurrentClasses(filtered);
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
    setCurrentClasses(uniqueClasses);
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

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportData = (type) => {
    if (!currentClasses || currentClasses.length === 0) {
      alert("먼저 분석을 진행해주세요.");
      return;
    }
    if (type === 'puml') downloadFile(toPlantUML(currentClasses, layoutDir), 'diagram.puml');
    if (type === 'dot') downloadFile(toDOT(currentClasses), 'diagram.dot');
  };

  return (
    <div style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          flexDirection: 'row',
          borderBottom: '1px solid #ddd',
        }}>
          <div style={{alignContent: 'center'}}>GP</div>
          <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {activeTab === 'zip' && (
          <ZipUpload 
            isProcessing={isProcessing} 
            processingStatus={processingStatus} 
            onUpload={handleZipUpload} 
          />
        )}
        {activeTab === 'git' && (
          <GitFolderUpload 
            onUpload={handleGitDirectoryAnalysis} 
            onRemoteAnalyze={handleRemoteGitAnalysis}
            gitUrl={gitUrl}
            setGitUrl={setGitUrl}
            isProcessing={isProcessing}
            processingStatus={processingStatus} />
        )}
        {activeTab === 'input' && (
          <CodeInput 
            extension={extension} setExtension={setExtension}
            code={code} setCode={setCode}
            onAnalyze={handleAnalyze} onLoadSample={loadSample}
          />
        )}

        <ControlPanel 
          layoutDir={layoutDir} setLayoutDir={setLayoutDir}
          showText={showText} setShowText={setShowText}
          onExport={exportData}
        />

        <MermaidDiagramDisplay 
          classes={currentClasses}
          layoutDir={layoutDir}
          showText={showText}
        />
      </div>
    </div>
  );
};

export default App;