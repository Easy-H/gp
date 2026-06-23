# Notation Design System Principles

이 문서는 Notation의 UI를 앞으로 수정하거나 확장할 때 반드시 지켜야 하는 디자인 철칙이다.

목표는 화려한 장식을 추가하는 것이 아니라, 분석 도구답게 조작이 명확하고 패널 간 위계가 안정적인 제품 경험을 유지하는 것이다.

## 핵심 철칙

- 화면 전체에는 페이지 스크롤이 생기면 안 된다.
- 스크롤은 필요한 컨텐츠 영역 내부에만 허용한다.
- 라이트 모드와 다크 모드는 같은 컴포넌트 위계를 유지해야 한다.
- 주요 색상은 CSS 변수 토큰을 통해서만 사용한다.
- 새 UI를 만들 때 기존 버튼, 입력, 패널, 모달 규칙을 우선 재사용한다.
- `@packages/panel-layout`는 가능한 한 수정하지 않는다.
- 패널 레이아웃 관련 색상은 앱에서 주입하는 토큰과 렌더링 옵션으로 해결한다.
- 기능 패널마다 다른 제품처럼 보이면 안 된다.

## 토큰

색상은 하드코딩하지 말고 아래 토큰 계층을 사용한다.

- 앱 배경과 기본 표면: `--app-bg`, `--app-surface`, `--app-surface-2`
- 앱 텍스트와 경계: `--app-text`, `--app-muted`, `--app-border`
- 핵심 강조색: `--app-primary`
- 상태색: `--app-success`, `--app-danger`, `--app-warning`, `--app-info`
- 코드 영역: `--app-code-bg`, `--panel-code-bg`
- 패널 표면: `--panel-bg`, `--panel-bg-2`, `--panel-border`, `--panel-text`, `--panel-muted`
- 패널 레이아웃: `--panel-layout-bg`, `--panel-layout-box`, `--panel-layout-surface`, `--panel-layout-text`
- 컨트롤 크기: `--control-height-sm`, `--control-height-md`, `--control-height-lg`
- 컨트롤 형태: `--control-radius`, `--control-shadow`
- 패널 여백: `--panel-space`, `--panel-gap`, `--panel-section-gap`

예외적으로 `rgba()`나 `color-mix()`는 토큰을 기반으로 한 투명도, 그림자, 그라디언트 표현에만 사용한다.

## 레이아웃

Notation은 전체 화면 앱이다.

- `html`, `body`, `#root`는 화면 높이에 고정되어야 한다.
- 앱 최상위 컨테이너는 `height`와 `max-height`를 함께 가져야 한다.
- 최상위 앱과 패널 작업 영역은 `overflow: hidden`을 유지한다.
- 컨텐츠 내부에서 스크롤이 필요하면 해당 컨텐츠 래퍼에만 `overflow: auto`를 둔다.
- flex 자식이 있는 영역은 `min-height: 0`을 명시한다.
- 패널, 다이어그램, 소스, 상세 화면은 주어진 컨텐츠 영역을 최소한 모두 차지해야 한다.
- 헤더는 `flex-shrink: 0`으로 고정 높이 영역처럼 동작해야 한다.

## 버튼

버튼은 공통 클래스를 우선 사용한다.

- 기본 버튼: `app-btn`
- 주요 버튼: `app-btn app-btn-primary`
- 아이콘 버튼: `app-btn app-icon-btn`
- 큰 아이콘 버튼: `app-btn app-btn-primary app-icon-btn-lg`
- 작은 버튼: `app-btn app-btn-sm`
- 기존 보조 버튼 호환: `secondary-btn`

새 버튼을 만들 때 직접 `padding`, `height`, `border`, `background`를 반복해서 정의하지 않는다.

상태 표현이 필요한 버튼은 상태 토큰을 사용한다.

- 저장, 완료, 성공: `--app-success`
- 삭제, 경고성 실패: `--app-danger`
- 주의: `--app-warning`
- 정보성 보조 강조: `--app-info`

## 입력 요소

입력 요소는 공통 클래스를 우선 사용한다.

- 일반 입력: `app-input`
- 큰 검색 입력: `app-input app-input-lg`
- 작은 입력: `app-input app-input-sm`
- 선택창: `app-select`
- 텍스트 영역: `app-textarea`
- 코드 텍스트 영역: `app-textarea app-textarea-code`

textarea에는 불필요한 좌우 스크롤이 생기지 않아야 한다.

긴 코드 입력은 `white-space: pre-wrap`, `overflow-wrap: anywhere`, `overflow-x: hidden` 규칙을 따른다.

## 패널

패널 내부 컨텐츠는 공통 구조를 사용한다.

- 패널 기본 래퍼: `analysis-panel-shell`
- 패널 내부 세로 스택: `analysis-panel-stack`
- 패널 내부 스크롤 영역: `analysis-panel-scroll`
- 여백 없는 패널: `analysis-panel-shell flush`

패널 내부에 다시 큰 카드 외곽선을 만드는 것은 피한다.

패널 간 분리는 패널 내부 카드가 아니라 `panel-layout` 배경, 탭 헤더, resize handle, 패널 표면 차이로 인식되게 한다.

## 패널 레이아웃

패널 레이아웃은 `GenericPanelLayout`의 `colors`와 `renderTabLabel`로 제어한다.

- 레이아웃 배경은 앱 배경보다 살짝 더 어둡거나 진해야 한다.
- 라이트 모드에서도 패널 탭과 배경이 구분되어야 한다.
- active 탭은 `--app-primary`를 사용한다.
- inactive 탭은 `--panel-layout-text`를 낮은 opacity로 사용한다.
- 추가 버튼과 resize handle은 `colors.surface`, `colors.text`, `colors.primary` 위계 안에서 움직여야 한다.
- `@packages/panel-layout` 내부 스타일을 직접 바꾸기 전에 앱 주입 방식으로 해결 가능한지 먼저 확인한다.

## 모달

모달은 공통 `Modal` 컴포넌트를 사용한다.

- 제목, 설명, 닫기 버튼은 스크롤 컨텐츠 밖에 있어야 한다.
- 긴 내용은 본문 컨텐츠 영역에만 스크롤을 허용한다.
- 분석 시작 모달처럼 탭이 계속 보여야 하는 경우 `fixedContent` 영역을 사용한다.
- 모달 제목 아래는 갑자기 잘려 보이지 않도록 패딩 또는 그라디언트로 부드럽게 이어지게 한다.
- 모달 폭은 목적에 맞게 `maxWidth`로 제한한다.
- 도구 추가, 내보내기처럼 선택지가 적은 모달은 한 열 구성을 기본으로 한다.

## 분석 결과 패널

분석 결과는 패널마다 독립적인 검색/선택 상태를 가질 수 있다.

- 클래스 상세보기 검색과 소스 코드 보기 검색은 서로 독립적으로 동작해야 한다.
- 클래스 상세보기에서 선택된 클래스가 없으면 전체 선택 가능한 클래스를 보여준다.
- 소스 코드 보기는 선택된 클래스의 source preview 역할을 한다.
- 소스 코드 보기의 닫기 버튼은 코드 영역 우상단에 있어야 한다.
- 클래스 상세보기의 편집/뒤로 버튼은 클래스명 행의 오른쪽 끝에 있어야 하며, 상세 스크롤 영역 안에 있어야 한다.

## 다이어그램

다이어그램 표시와 편집은 분리된 패널 타입으로 유지한다.

- 다이어그램 표시 패널은 상단 툴바, 중앙 다이어그램, 하단 제어바 구조를 유지한다.
- 상단 툴바와 하단 제어바는 작은 패널에서 가로 스크롤은 허용하되 스크롤바는 숨긴다.
- 다이어그램 편집 패널은 편집 textarea가 패널 전체를 차지해야 한다.
- 다이어그램 편집의 적용 버튼은 편집 영역 위에 오버레이처럼 배치한다.
- 다이어그램 자체 바깥에 불필요한 카드 색상이나 둥근 외곽을 덧씌우지 않는다.

## 검증

디자인 변경 후 최소한 아래를 확인한다.

- `npm run build`가 통과해야 한다.
- 라이트 모드와 다크 모드에서 주요 화면이 같은 위계를 유지하는지 확인한다.
- 브라우저 페이지 전체에 스크롤이 생기지 않는지 확인한다.
- 모달에서 제목, 닫기 버튼, 고정 탭이 스크롤로 사라지지 않는지 확인한다.
- 작은 패널 크기에서 버튼 텍스트가 줄바꿈으로 깨지지 않는지 확인한다.
- 다이어그램 상단 툴바와 하단 제어바가 가로로 넘칠 때 스크롤바가 보이지 않는지 확인한다.

현재 `npm run lint`는 기존 규칙 위반이 남아 있어 디자인 변경 검증 기준으로 사용하지 않는다. lint를 검증 기준에 포함하려면 React 기본 import 정리, 미사용 props 정리, `react-hooks/set-state-in-effect`, `vite.config.js`의 `__dirname` 문제를 먼저 별도 해결한다.
