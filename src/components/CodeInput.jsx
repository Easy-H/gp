import React from 'react';

const CodeInput = ({ extension, setExtension, code, setCode, onAnalyze, onLoadSample }) => {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--panel-text)'}}>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        flexDirection: 'row',
      }}>
        <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          <label>언어 선택: </label>
          <select value={extension} onChange={(e) => setExtension(e.target.value)} style={{ background: 'var(--panel-bg)', color: 'var(--panel-text)', border: '1px solid var(--panel-border)', borderRadius: '4px' }}>
            <option value="js">JavaScript</option>
            <option value="java">Java</option>
            <option value="py">Python</option>
            <option value="cpp">C++</option>
            <option value="cs">C#</option>
            <option value="ts">TypeScript</option>
          </select>
        </div>


        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onAnalyze} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: 'var(--app-primary)', color: 'white', border: 'none', borderRadius: '4px' }}>
            다이어그램 생성
          </button>
          <button onClick={onLoadSample} style={{ padding: '10px 20px', backgroundColor: 'var(--panel-bg-2)', color: 'var(--panel-text)', border: '1px solid var(--panel-border)', borderRadius: '4px' }}>
            샘플 로드
          </button>
        </div>
      </div>
      <div
        style={{ width: '100%', display: 'flex' }}>
        <textarea
          rows="12"
          wrap="soft"
          style={{ flex: 1, padding: '10px', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid var(--panel-border)', background: 'var(--panel-bg)', color: 'var(--panel-text)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', overflowX: 'hidden', boxSizing: 'border-box' }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="여기에 코드를 입력하세요 (여러 클래스 가능)..."
        />
      </div>
    </div>
  );
};

export default CodeInput;
