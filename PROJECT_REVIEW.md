# Notation 프로젝트 분석 및 개선 제안

작성 기준: 현재 코드베이스를 기준으로 정적 분석한 결과입니다. 실행 테스트는 별도로 수행하지 않았습니다.

## 1. 프로젝트 개요

Notation은 소스 코드를 분석해 클래스 관계를 시각화하는 웹 앱입니다. 현재 구현은 다음 흐름으로 구성되어 있습니다.

1. 사용자가 코드 입력, ZIP 업로드, Git 폴더/원격 저장소 분석 중 하나를 선택한다.
2. `web-tree-sitter`로 언어별 AST를 파싱한다.
3. 클래스, 인터페이스, 멤버, 상속, 구현, 연관 관계를 추출한다.
4. Mermaid, PlantUML, DOT, PNG로 내보낸다.

핵심 파일은 다음과 같습니다.

- [`src/App.jsx`](src/App.jsx)
- [`src/CodeAnalyzer.ts`](src/CodeAnalyzer.ts)
- [`src/services/ProjectExtractor.ts`](src/services/ProjectExtractor.ts)
- [`src/Exporter.js`](src/Exporter.js)
- [`src/_future/configs.ts`](src/_future/configs.ts)

## 2. 잘 되어 있는 점

### 2.1 분석 경로가 명확하다

입력 방식별로 추출 로직이 분리되어 있고, 최종적으로 `runAnalysisPipeline`으로 모이는 구조라서 기능 확장이 비교적 쉽습니다.  
관련 위치: [`src/App.jsx:111`](src/App.jsx#L111), [`src/services/ProjectExtractor.ts:57`](src/services/ProjectExtractor.ts#L57)

### 2.2 언어 확장 기반 설계가 되어 있다

`LANGUAGE_CONFIG`로 언어별 노드 타입을 분리해서, 새 언어를 추가할 때 전체 코드를 크게 흔들지 않게 되어 있습니다.  
관련 위치: [`src/_future/configs.ts:11`](src/_future/configs.ts#L11)

### 2.3 내보내기 포맷이 다양하다

Mermaid, PlantUML, DOT를 모두 지원해서 결과물 활용도가 높습니다.  
관련 위치: [`src/Exporter.js`](src/Exporter.js)

### 2.4 UI가 기능별로 분리되어 있다

탭, 업로드, 상세 보기, 다이어그램 렌더링이 컴포넌트로 나뉘어 있어 화면 단위 유지보수는 가능한 구조입니다.

## 3. 개선이 필요한 점

### 3.1 분석 로직이 너무 한 파일에 집중되어 있다

`CodeAnalyzer` 안에 파서 초기화, 클래스 메타데이터 수집, 멤버 추출, 관계 추출, 가시성 추론이 모두 들어 있습니다.  
이 구조는 현재는 동작하지만, 언어별 예외나 규칙이 늘어날수록 수정 범위가 커지고 회귀 가능성이 높아집니다.  
관련 위치: [`src/CodeAnalyzer.ts:72`](src/CodeAnalyzer.ts#L72), [`src/CodeAnalyzer.ts:160`](src/CodeAnalyzer.ts#L160)

권장 개선:

- 메타데이터 수집과 클래스 추출을 별도 모듈로 분리
- 언어별 rule set을 더 작은 단위로 쪼개기
- 공통 AST traversal 헬퍼를 두고 언어별 차이만 주입

### 3.2 타입/런타임 안전성이 부족하다

코드에 TypeScript 파일이 섞여 있지만, 앱의 주요 상태와 컴포넌트는 여전히 느슨한 `any`와 암묵적 타입에 의존합니다.  
예를 들어 `CodeAnalyzer`와 `ProjectExtractor` 내부에는 `any`가 많고, 일부 객체는 구조가 강제되지 않습니다.  
관련 위치: [`src/CodeAnalyzer.ts:82`](src/CodeAnalyzer.ts#L82), [`src/services/ProjectExtractor.ts:90`](src/services/ProjectExtractor.ts#L90)

권장 개선:

- `ClassInfo`, `ExtractedFile`, `ProgressInfo`를 UI까지 공유하는 공통 타입으로 정리
- `any`를 점진적으로 제거
- 분석 결과에 대한 validation 레이어 추가

### 3.3 분석 정확도에 한계가 있다

현재 관계 추출은 `new_expression`과 일부 부모 노드 탐색에 의존합니다. 이 방식은 간단한 예제에는 잘 맞지만, 다음 경우 정확도가 떨어질 수 있습니다.

- 팩토리 메서드 패턴
- DI 컨테이너 기반 생성
- 익명 클래스/클로저
- 대규모 코드에서 동일 이름 클래스 충돌

관련 위치: [`src/CodeAnalyzer.ts:171`](src/CodeAnalyzer.ts#L171), [`src/App.jsx:128`](src/App.jsx#L128)

권장 개선:

- 관계 추출 근거를 더 풍부하게 저장
- 파일 경로와 네임스페이스/패키지를 함께 키로 사용
- 동일 이름 클래스 dedup 정책을 “덮어쓰기”가 아니라 “스코프 기반 식별”로 변경

### 3.4 Git 원격 분석 방식이 환경 의존적이다

원격 Git 분석은 `corsProxy`에 의존하고, 로컬 폴더 분석은 브라우저의 `webkitdirectory`와 `.git` 접근 여부에 영향을 받습니다.  
즉, 사용자의 브라우저/네트워크 환경에 따라 성공률이 달라질 수 있습니다.  
관련 위치: [`src/services/ProjectExtractor.ts:119`](src/services/ProjectExtractor.ts#L119), [`src/services/ProjectExtractor.ts:153`](src/services/ProjectExtractor.ts#L153)

권장 개선:

- 원격 저장소 분석 시 프록시 실패 케이스를 더 명확히 표시
- `.git` 기반 복원과 단순 소스 업로드를 분리된 UX로 안내
- 큰 저장소는 파일 수 제한과 예상 시간 안내 추가

### 3.5 UI 상태 관리가 App 컴포넌트에 과밀하다

`App.jsx`가 모달 상태, 분석 상태, 내보내기, 선택된 클래스, 히스토리, 레이아웃, 샘플 로드까지 모두 가지고 있습니다.  
이 정도 상태는 앞으로 기능이 조금만 더 늘어도 유지보수가 어려워집니다.  
관련 위치: [`src/App.jsx:18`](src/App.jsx#L18), [`src/App.jsx:292`](src/App.jsx#L292)

권장 개선:

- 분석 상태와 UI 상태를 분리
- custom hook으로 `useAnalyzer`, `useExport`, `useSelection` 분리
- 상태가 많은 영역은 reducer 도입 검토

### 3.6 에러 처리와 사용자 안내가 단순하다

현재는 실패 시 `alert()` 중심으로 알려주고 있어, 어떤 파일에서 왜 실패했는지 추적하기 어렵습니다.  
관련 위치: [`src/App.jsx:96`](src/App.jsx#L96), [`src/App.jsx:179`](src/App.jsx#L179)

권장 개선:

- toast 또는 inline error panel로 전환
- 실패한 파일 목록과 원인을 요약해서 보여주기
- 분석 완료 후 성공/부분 실패를 구분해서 표시

### 3.7 스타일이 컴포넌트 안에 분산되어 있다

인라인 스타일과 `<style>` 블록이 여러 컴포넌트에 흩어져 있습니다. 현재 규모에서는 괜찮지만, 테마 변경과 공통 UI 정리에 비용이 커질 수 있습니다.  
관련 위치: [`src/App.jsx:293`](src/App.jsx#L293), [`src/components/DiagramDisplay.jsx:15`](src/components/DiagramDisplay.jsx#L15)

권장 개선:

- 공통 스타일을 `src/styles/` 또는 CSS module로 분리
- 버튼/카드/모달 같은 기본 컴포넌트 토큰화
- 다이어그램 관련 스타일은 한 곳에서 관리

## 4. 우선순위 로드맵

### 바로 해야 할 것

1. `App.jsx`의 상태와 핸들러를 custom hook으로 분리
2. 분석 실패/부분 실패를 화면에 표시하는 에러 UI 추가
3. 동일 이름 클래스 충돌 처리 정책을 개선

### 다음 단계

1. `CodeAnalyzer`를 언어별 strategy 구조로 분해
2. 타입 정의를 정리하고 `any` 축소
3. 테스트 추가

### 장기 개선

1. 대규모 저장소 대응을 위한 스트리밍/배치 분석
2. 분석 정확도 개선을 위한 관계 추론 고도화
3. 설정 화면과 프로젝트 저장 기능 추가

## 5. 권장 테스트 범위

현재 저장소에는 명시적인 테스트가 보이지 않습니다. 최소한 아래는 자동화하는 것이 좋습니다.

- 언어별 클래스/인터페이스 추출 단위 테스트
- ZIP 및 Git 입력 파이프라인 테스트
- Mermaid/PlantUML/DOT export 스냅샷 테스트
- 동일 이름 클래스 충돌 케이스 테스트

## 6. 결론

Notation은 “소스 코드에서 클래스 다이어그램을 뽑는” 핵심 목적에 맞게 이미 꽤 좋은 방향으로 만들어져 있습니다. 다만 지금 상태는 기능 확장보다도 먼저, 분석 로직과 UI 상태를 정리해서 복잡도를 낮추는 작업이 가장 효과적입니다.

우선순위를 한 줄로 정리하면 이렇습니다.

1. 상태와 분석 로직 분리
2. 타입 안정성 강화
3. 분석 정확도와 실패 처리 개선
4. 테스트 추가

## 7. 진행 상태

- ✓ `CodeAnalyzer` 분리 작업 완료
- ✓ `ProjectExtractor` 타입 정리 완료
- ✓ `App.jsx` 선택 상태 분리 완료
- ✓ `App.jsx` 분석 및 내보내기 로직 분리 완료
- ✓ `App.jsx` 프로젝트 분석 훅 분리 완료
- ✓ `App.jsx` UI 상태 훅 분리 완료
- ✓ `App.jsx` core 상태 훅 분리 완료
- ✓ `App.jsx` analyzer bootstrap 훅 분리 완료
- ✓ `useProjectAnalysis` 공통 헬퍼 분리 완료
- ✓ `useProjectAnalysis` 입력 방식별 훅 분리 완료
- ✓ `App.jsx` 렌더링 컴포넌트 분리 완료
- ✓ `App.jsx` 스타일 분리 완료
