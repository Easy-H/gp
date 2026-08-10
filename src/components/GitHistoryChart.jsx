import { useEffect, useMemo, useState } from 'react';
import { GitHistoryAnalyzer } from '../services/GitHistoryAnalyzer';

const chartWidth = 980;
const chartHeight = 360;
const pad = { top: 20, right: 64, bottom: 70, left: 82 };

const inputStyle = { minWidth: 0 };

const updateHistoryParam = (updates) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  Object.entries(updates).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
};

const getCacheKey = (filters) => [
  'git-history-v2',
  filters.repoUrl || 'local',
  filters.branch || 'HEAD',
  filters.directory || '/',
  filters.executors.join(','),
  filters.startCommit || '',
  filters.endCommit || '',
].join('|');

const readCachedResult = (filters) => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(getCacheKey(filters));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCachedResult = (filters, result) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getCacheKey(filters), JSON.stringify(result));
  } catch {
    /* storage quota can be exceeded on large histories */
  }
};

const GitHistoryChart = () => {
  const [filters, setFilters] = useState(() => GitHistoryAnalyzer.getInitialFilters());
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [localFiles, setLocalFiles] = useState([]);
  const [remoteBranches, setRemoteBranches] = useState([]);
  const [executorMenuOpen, setExecutorMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showCommitIds, setShowCommitIds] = useState(() => {
    if (typeof window === 'undefined') return true;
    return new URLSearchParams(window.location.search).get('showCommitIds') !== 'false';
  });

  const chart = useMemo(() => {
    const commits = result?.commits || [];
    const innerW = chartWidth - pad.left - pad.right;
    const innerH = chartHeight - pad.top - pad.bottom;
    const zeroY = pad.top + innerH / 2;
    const maxBars = Math.max(1, ...commits.flatMap((commit) => [commit.added, commit.deleted]));
    const maxCumulative = Math.max(1, ...commits.map((commit) => Math.abs(commit.cumulative)));
    const step = commits.length > 1 ? innerW / (commits.length - 1) : innerW;
    const barWidth = Math.max(3, Math.min(24, innerW / Math.max(commits.length, 1) * 0.36));

    const xFor = (index) => pad.left + (commits.length > 1 ? index * step : innerW / 2);
    const barScale = (value) => (value / maxBars) * (innerH / 2 - 12);
    const lineY = (value) => zeroY - (value / maxCumulative) * (innerH / 2 - 12);
    const linePoints = commits.length > 0
      ? [`${xFor(0)},${zeroY}`, ...commits.map((commit, index) => `${xFor(index)},${lineY(commit.cumulative)}`)].join(' ')
      : '';

    return { commits, innerW, innerH, zeroY, maxBars, maxCumulative, xFor, barScale, lineY, linePoints, barWidth };
  }, [result]);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const commitOptions = result?.commitOptions || [];
  const executorOptions = result?.executors || [];
  const directoryOptions = result?.directoryOptions || [];
  const branchOptions = useMemo(() => {
    const values = new Set([...(result?.branches || []), ...remoteBranches]);
    if (filters.branch && filters.branch !== 'HEAD') values.add(filters.branch);
    return Array.from(values).filter(Boolean).sort();
  }, [filters.branch, remoteBranches, result]);
  const startOptionIndex = filters.startCommit
    ? commitOptions.findIndex((commit) => commit.oid.startsWith(filters.startCommit))
    : -1;
  const endOptionIndex = filters.endCommit
    ? commitOptions.findIndex((commit) => commit.oid.startsWith(filters.endCommit))
    : -1;

  const formatCommitOption = (commit) => `${commit.shortOid} · ${commit.date} · ${commit.message || '(메시지 없음)'}`;
  const hoveredCommit = hoveredIndex === null ? null : chart.commits[hoveredIndex];
  const hoveredX = hoveredIndex === null ? 0 : chart.xFor(hoveredIndex);
  const formatSigned = (value) => `${value > 0 ? '+' : ''}${value}`;

  const handleChartMove = (event) => {
    if (chart.commits.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * chartWidth;
    const nearest = chart.commits.reduce((bestIndex, _commit, index) => {
      const bestDistance = Math.abs(chart.xFor(bestIndex) - svgX);
      const nextDistance = Math.abs(chart.xFor(index) - svgX);
      return nextDistance < bestDistance ? index : bestIndex;
    }, 0);
    setHoveredIndex(nearest);
  };

  const syncFilterParams = (nextFilters = filters) => {
    updateHistoryParam({
      analysisType: 'gitHistory',
      repo: nextFilters.repoUrl,
      executors: nextFilters.executors.join(','),
      dir: nextFilters.directory,
      branch: nextFilters.branch && nextFilters.branch !== 'HEAD' ? nextFilters.branch : '',
      start: nextFilters.startCommit,
      end: nextFilters.endCommit,
      showCommitIds: showCommitIds ? '' : 'false',
    });
  };

  const showResult = (nextFilters, nextResult, message) => {
    setResult(nextResult);
    writeCachedResult(nextFilters, nextResult);
    setStatus(message || `${nextResult.commits.length}개 커밋 분석 완료`);
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const gitFiles = files.filter((file) => file.webkitRelativePath.includes('.git/'));
    if (gitFiles.length === 0) {
      alert('.git 폴더가 포함된 Git 저장소 폴더를 선택해주세요.');
      event.target.value = '';
      return;
    }
    try {
      setLoading(true);
      setLocalFiles(gitFiles);
      setStatus('Git 히스토리 준비 중');
      syncFilterParams();
      const nextResult = await GitHistoryAnalyzer.analyzeLocalFiles(gitFiles, filters, setStatus);
      showResult(filters, nextResult);
    } catch (error) {
      alert(`Git 히스토리 분석 실패: ${error.message}`);
      setStatus('');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const runRemoteAnalyze = async (nextFilters = filters) => {
    if (!nextFilters.repoUrl) return;
    try {
      setLoading(true);
      setStatus('원격 Git 저장소 복제 중');
      syncFilterParams(nextFilters);
      const nextResult = await GitHistoryAnalyzer.analyzeRemoteRepo(nextFilters.repoUrl, nextFilters, setStatus);
      setRemoteBranches(nextResult.branches || []);
      showResult(nextFilters, nextResult);
    } catch (error) {
      alert(`원격 Git 히스토리 분석 실패: ${error.message}`);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoteAnalyze = () => {
    setLocalFiles([]);
    void runRemoteAnalyze(filters);
  };

  const rerunWithFilters = async (nextFilters) => {
    if (result?.rawCommits) {
      const nextResult = GitHistoryAnalyzer.applyFilters(result, nextFilters);
      showResult(nextFilters, nextResult);
      return;
    }
    if (nextFilters.repoUrl && localFiles.length === 0) {
      await runRemoteAnalyze(nextFilters);
      return;
    }
    if (localFiles.length > 0) {
      try {
        setLoading(true);
        setStatus('Git 히스토리 다시 분석 중');
        syncFilterParams(nextFilters);
        const nextResult = await GitHistoryAnalyzer.analyzeLocalFiles(localFiles, nextFilters, setStatus);
        showResult(nextFilters, nextResult);
      } catch (error) {
        alert(`Git 히스토리 분석 실패: ${error.message}`);
        setStatus('');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRangeChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    syncFilterParams(nextFilters);
    if (result) void rerunWithFilters(nextFilters);
  };

  const handleFilterChange = (updates) => {
    const nextFilters = { ...filters, ...updates };
    setFilters(nextFilters);
    syncFilterParams(nextFilters);
    if (result) void rerunWithFilters(nextFilters);
  };

  const toggleExecutor = (executor) => {
    const selected = filters.executors.includes(executor)
      ? filters.executors.filter((item) => item !== executor)
      : [...filters.executors, executor];
    handleFilterChange({ executors: selected, startCommit: '', endCommit: '' });
  };

  useEffect(() => {
    const cached = readCachedResult(filters);
    if (cached) {
      setResult(cached);
      setRemoteBranches(cached.branches || []);
      setStatus('저장된 히스토리 분석 결과를 불러왔습니다.');
    }
  }, []);

  useEffect(() => {
    if (!filters.repoUrl) return;
    let active = true;
    GitHistoryAnalyzer.listRemoteBranches(filters.repoUrl)
      .then((branches) => {
        if (!active) return;
        setRemoteBranches(branches);
        if (filters.branch !== 'HEAD' && !branches.includes(filters.branch)) {
          setFilters((prev) => ({ ...prev, branch: 'HEAD' }));
        }
      })
      .catch(() => {
        if (active) setRemoteBranches([]);
      });
    return () => { active = false; };
  }, [filters.repoUrl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) minmax(120px, 180px) auto auto', gap: '8px', alignItems: 'center' }}>
        <input
          className="app-input app-input-sm"
          value={filters.repoUrl}
          onChange={(e) => {
            setFilter('repoUrl', e.target.value);
            setRemoteBranches([]);
          }}
          placeholder="대상 Git 저장소 URL"
        />
        <select
          className="app-select app-input-sm"
          style={inputStyle}
          value={filters.branch}
          onChange={(e) => {
            const nextFilters = { ...filters, branch: e.target.value, startCommit: '', endCommit: '' };
            setFilters(nextFilters);
            syncFilterParams(nextFilters);
            setResult(null);
          }}
          disabled={loading || (filters.repoUrl && branchOptions.length === 0)}
          title="브랜치"
        >
          <option value="HEAD">HEAD</option>
          {branchOptions.map((branch) => (
            <option key={branch} value={branch}>{branch}</option>
          ))}
        </select>
        <button className="app-btn app-btn-primary app-btn-sm" onClick={handleRemoteAnalyze} disabled={loading || !filters.repoUrl}>
          원격 분석
        </button>
        <label className="app-btn app-btn-sm" style={{ cursor: loading ? 'not-allowed' : 'pointer' }} title="히스토리 분석에는 .git 데이터만 사용합니다.">
          .git 선택
          <input type="file" webkitdirectory="true" onChange={handleFiles} disabled={loading} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 0.9fr) minmax(120px, 0.9fr) minmax(150px, 1.1fr) minmax(150px, 1.1fr)', gap: '8px' }}>
        <div style={{ position: 'relative', minWidth: 0 }}>
          <button
            type="button"
            className="app-btn app-btn-sm"
            onClick={() => setExecutorMenuOpen((prev) => !prev)}
            disabled={loading || executorOptions.length === 0}
            title="커밋 실행자"
            style={{ width: '100%', justifyContent: 'space-between', minWidth: 0 }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {filters.executors.length === 0 ? '커밋 실행자 전체' : `실행자 ${filters.executors.length}명`}
            </span>
            <span>▾</span>
          </button>
          {executorMenuOpen && (
            <div
              style={{
                position: 'absolute',
                zIndex: 20,
                top: 'calc(100% + 6px)',
                left: 0,
                width: 'min(320px, 80vw)',
                maxHeight: '260px',
                overflow: 'auto',
                padding: '8px',
                border: '1px solid var(--panel-border)',
                borderRadius: '8px',
                background: 'var(--panel-bg)',
                boxShadow: '0 12px 28px rgba(15, 23, 42, 0.18)',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', color: 'var(--panel-text)', fontSize: '0.78rem' }}>
                <input
                  type="checkbox"
                  checked={filters.executors.length === 0}
                  onChange={() => handleFilterChange({ executors: [], startCommit: '', endCommit: '' })}
                />
                전체
              </label>
              {executorOptions.map((executor) => (
                <label key={executor} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', color: 'var(--panel-text)', fontSize: '0.78rem' }}>
                  <input
                    type="checkbox"
                    checked={filters.executors.includes(executor)}
                    onChange={() => toggleExecutor(executor)}
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{executor}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <select
          className="app-select app-select-sm"
          style={inputStyle}
          value={filters.directory}
          onChange={(e) => handleFilterChange({ directory: e.target.value, startCommit: '', endCommit: '' })}
          disabled={loading || directoryOptions.length === 0}
          title="대상 디렉터리"
        >
          <option value="">root</option>
          {directoryOptions.map((directory) => (
            <option key={directory} value={directory}>{directory}</option>
          ))}
        </select>
        <select
          className="app-input app-input-sm"
          style={inputStyle}
          value={filters.startCommit}
          onChange={(e) => handleRangeChange('startCommit', e.target.value)}
          disabled={loading || commitOptions.length === 0}
          title="시작 커밋"
        >
          <option value="">시작 커밋 전체</option>
          {commitOptions.map((commit, index) => (
            <option
              key={commit.oid}
              value={commit.oid}
              disabled={endOptionIndex >= 0 && index < endOptionIndex}
            >
              {formatCommitOption(commit)}
            </option>
          ))}
        </select>
        <select
          className="app-input app-input-sm"
          style={inputStyle}
          value={filters.endCommit}
          onChange={(e) => handleRangeChange('endCommit', e.target.value)}
          disabled={loading || commitOptions.length === 0}
          title="끝 커밋"
        >
          <option value="">끝 커밋 전체</option>
          {commitOptions.map((commit, index) => (
            <option
              key={commit.oid}
              value={commit.oid}
              disabled={startOptionIndex >= 0 && index > startOptionIndex}
            >
              {formatCommitOption(commit)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--panel-muted)', fontSize: '0.78rem' }}>
          <input
            type="checkbox"
            checked={showCommitIds}
            onChange={(e) => {
              setShowCommitIds(e.target.checked);
              updateHistoryParam({ showCommitIds: e.target.checked ? '' : 'false' });
            }}
          />
          커밋 Id 표시
        </label>
        <span style={{ color: 'var(--panel-muted)', fontSize: '0.78rem' }}>{status}</span>
      </div>

      {result && (
        <div style={{ overflowX: 'auto', border: '1px solid var(--panel-border)', borderRadius: '8px', background: 'var(--panel-bg)' }}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            width="100%"
            height="360"
            role="img"
            aria-label="Git 히스토리 코드 라인 변화 차트"
            onMouseMove={handleChartMove}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{ display: 'block' }}
          >
            <line x1={pad.left} y1={chart.zeroY} x2={chartWidth - pad.right} y2={chart.zeroY} stroke="var(--panel-border)" strokeWidth="1.5" />
            <line x1={pad.left} y1={pad.top} x2={pad.left} y2={chartHeight - pad.bottom} stroke="var(--panel-border)" />
            <line x1={chartWidth - pad.right} y1={pad.top} x2={chartWidth - pad.right} y2={chartHeight - pad.bottom} stroke="var(--panel-border)" />
            <text x={pad.left - 12} y={pad.top + 12} fill="var(--panel-muted)" fontSize="12" textAnchor="end">+/- {chart.maxBars}</text>
            <text x={chartWidth - pad.right + 10} y={pad.top + 12} fill="var(--panel-muted)" fontSize="12">누적 {chart.maxCumulative}</text>
            <text x={pad.left - 12} y={chart.zeroY - 6} fill="var(--panel-muted)" fontSize="11" textAnchor="end">0</text>
            {chart.commits.map((commit, index) => {
              const x = chart.xFor(index);
              const addedH = chart.barScale(commit.added);
              const deletedH = chart.barScale(commit.deleted);
              return (
                <g key={commit.oid}>
                  <rect x={x - chart.barWidth / 2} y={chart.zeroY - addedH} width={chart.barWidth} height={addedH} fill="var(--app-success)" />
                  <rect x={x - chart.barWidth / 2} y={chart.zeroY} width={chart.barWidth} height={deletedH} fill="var(--app-danger)" />
                  {showCommitIds && (
                    <text x={x} y={chartHeight - 34} fill="var(--panel-muted)" fontSize="10" textAnchor="end" transform={`rotate(-45 ${x} ${chartHeight - 34})`}>
                      {commit.shortOid}
                    </text>
                  )}
                </g>
              );
            })}
            {chart.commits.length > 0 && (
              <>
                <polyline fill="none" stroke="var(--app-info)" strokeWidth="2.5" points={chart.linePoints} />
                <circle cx={chart.xFor(0)} cy={chart.zeroY} r="3.5" fill="var(--app-info)">
                  <title>누적 0</title>
                </circle>
                {chart.commits.map((commit, index) => (
                  <circle key={`${commit.oid}-line`} cx={chart.xFor(index)} cy={chart.lineY(commit.cumulative)} r="3.5" fill="var(--app-info)" />
                ))}
              </>
            )}
            {hoveredCommit && (
              <>
                <line x1={hoveredX} y1={pad.top} x2={hoveredX} y2={chartHeight - pad.bottom} stroke="var(--app-info)" strokeWidth="1" strokeDasharray="4 4" opacity="0.65" />
                <circle cx={hoveredX} cy={chart.lineY(hoveredCommit.cumulative)} r="5" fill="var(--app-info)" stroke="var(--panel-bg)" strokeWidth="2" />
                <foreignObject
                  x={Math.min(Math.max(hoveredX + 12, pad.left), chartWidth - pad.right - 250)}
                  y={pad.top + 8}
                  width="250"
                  height="150"
                >
                  <div xmlns="http://www.w3.org/1999/xhtml" style={{ background: 'var(--panel-bg)', color: 'var(--panel-text)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '10px', boxShadow: '0 12px 28px rgba(15, 23, 42, 0.18)', fontSize: '12px', lineHeight: 1.45 }}>
                    <div style={{ fontWeight: 800, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {hoveredCommit.shortOid} · {hoveredCommit.date}
                    </div>
                    <div style={{ color: 'var(--panel-muted)', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {hoveredCommit.message || '(메시지 없음)'}
                    </div>
                    <div>커밋 실행자: <strong>{hoveredCommit.executor}</strong></div>
                    <div>추가된 코드 줄 수: <strong style={{ color: 'var(--app-success)' }}>+{hoveredCommit.added}</strong></div>
                    <div>삭제된 코드 줄 수: <strong style={{ color: 'var(--app-danger)' }}>-{hoveredCommit.deleted}</strong></div>
                    <div>시작 커밋 대비 총 변화량: <strong>{formatSigned(hoveredCommit.cumulative)}</strong></div>
                    <div>직전 커밋 대비 변화량: <strong>{formatSigned(hoveredCommit.added - hoveredCommit.deleted)}</strong></div>
                  </div>
                </foreignObject>
              </>
            )}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '8px 12px', borderTop: '1px solid var(--panel-border)', color: 'var(--panel-muted)', fontSize: '0.75rem' }}>
            <span>{result.repoUrl ? `${result.repoUrl} · ` : ''}{result.branch} · {result.directory}</span>
            <span>추가: 초록 막대 · 삭제: 빨강 막대 · 누적 변화량: 파란 선</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHistoryChart;
