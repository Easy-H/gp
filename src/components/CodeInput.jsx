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
          <select className="app-select" value={extension} onChange={(e) => setExtension(e.target.value)} style={{ width: 'auto' }}>
            <option value="js">JavaScript</option>
            <option value="java">Java</option>
            <option value="py">Python</option>
            <option value="cpp">C++</option>
            <option value="cs">C#</option>
            <option value="ts">TypeScript</option>
          </select>
        </div>


        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="app-btn app-btn-primary" onClick={onAnalyze}>
            다이어그램 생성
          </button>
          <button className="app-btn" onClick={onLoadSample}>
            샘플 로드
          </button>
        </div>
      </div>
      <div
        style={{ width: '100%', display: 'flex' }}>
        <textarea
          className="app-textarea app-textarea-code"
          rows="12"
          wrap="soft"
          style={{ flex: 1 }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="여기에 코드를 입력하세요 (여러 클래스 가능)..."
        />
      </div>
    </div>
  );
};

export default CodeInput;
