# Notation

Notation은 소스 코드를 분석해 클래스 구조와 관계를 시각화하는 웹 애플리케이션입니다.  
코드 입력, ZIP 업로드, 로컬 Git 폴더, 원격 Git 저장소를 대상으로 분석할 수 있으며, 결과를 Mermaid, PlantUML, Graphviz DOT, PNG 형태로 내보낼 수 있습니다.

현재 구현은 분석 책임과 화면 책임이 분리되어 있습니다.

- `CodeAnalyzer`: Tree-sitter 기반 AST 분석
- `ProjectExtractor`: ZIP, 로컬 Git, 원격 Git 입력 처리
- `useProjectAnalysis`: 코드 입력과 파일 기반 분석 조립
- `useAppUiState`, `useAppCoreState`, `useClassSelection`: 화면 상태 관리
- `AppHeader`, `AnalysisModal`, `WorkspaceDashboard`, `ExportModal`: 화면 조립 컴포넌트

## 주요 기능

- 코드에서 클래스, 인터페이스, 멤버, 상속, 구현, 연관 관계 추출
- 단일 파일 코드 입력 분석
- ZIP 프로젝트 업로드 분석
- 로컬 Git 폴더 분석
- 원격 Git 저장소 분석
- Mermaid 다이어그램 렌더링 및 텍스트 편집
- Mermaid, PlantUML, Graphviz DOT, PNG 내보내기
- 클래스 검색 및 상세 정보 확인
- 분석기 초기화, 입력 방식별 분석, 결과 렌더링의 분리된 구조

## 기술 스택

- Vite
- React
- `web-tree-sitter`
- Mermaid
- `isomorphic-git`
- JSZip

## 지원 언어

현재 설정 기준으로 다음 언어를 분석할 수 있습니다.

- JavaScript
- JSX
- TypeScript
- TSX
- Java
- Python
- C++
- C#

## 실행 방법

```bash
npm install
npm run dev
```

빌드가 필요하면 다음을 실행합니다.

```bash
npm run build
```

## 사용 방법

1. 앱을 실행한 뒤 `새 프로젝트 분석하기`를 선택합니다.
2. 아래 입력 방식 중 하나를 고릅니다.
   - `직접 입력`: 코드 조각을 붙여넣고 언어를 선택한 뒤 분석합니다.
   - `ZIP 업로드`: 프로젝트를 압축 파일로 업로드해 분석합니다.
   - `Git 폴더`: 로컬 폴더 또는 `.git` 디렉터리를 포함한 프로젝트를 선택합니다.
   - `원격 Git`: Git 저장소 URL을 입력해 분석합니다.
3. 분석이 끝나면 클래스 목록과 다이어그램이 표시됩니다.
4. 필요하면 Mermaid 텍스트를 직접 수정하거나, 다이어그램을 PNG 또는 텍스트 포맷으로 내보낼 수 있습니다.

## 내부 구조

프로젝트는 다음 흐름으로 동작합니다.

1. `App`이 전체 화면을 조립한다.
2. `useAnalyzerBootstrap`이 Tree-sitter 분석기를 초기화하고 언어 팩을 미리 로드한다.
3. `useProjectAnalysis`가 입력 방식별 분석을 수행한다.
4. `WorkspaceDashboard`가 클래스 검색과 다이어그램을 보여준다.
5. `ExportModal`이 결과 내보내기를 담당한다.

## 출력 형식

- `.mmd`
- `.puml`
- `.dot`
- `.png`

## 관련 문서

- [프로젝트 분석 및 개선 제안](PROJECT_REVIEW.md)
