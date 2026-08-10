import GitHistoryChart from './GitHistoryChart';

const GitHistoryWorkspace = () => (
  <div className="analysis-panel-shell" style={{ width: '100%', overflow: 'auto' }}>
    <div style={{ width: 'min(1180px, 100%)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ textAlign: 'left', padding: '4px 0 8px' }}>
        <h2 style={{ margin: 0, color: 'var(--panel-text)', fontWeight: 800, fontSize: '1.2rem' }}>Git 히스토리 차트 분석</h2>
        <p style={{ marginTop: '8px', color: 'var(--panel-muted)', fontSize: '0.88rem', lineHeight: 1.55 }}>
          로컬 프로젝트 폴더를 선택하면 브라우저 안에서 .git 히스토리를 읽어 커밋별 추가/삭제 라인과 누적 변화량을 시각화합니다.
          GitHub Pages 같은 정적 배포 환경에서도 동작합니다.
        </p>
      </div>
      <GitHistoryChart />
    </div>
  </div>
);

export default GitHistoryWorkspace;
