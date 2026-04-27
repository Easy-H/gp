import React from 'react';

const CodeInput = ({ extension, setExtension, code, setCode, onAnalyze, onLoadSample }) => {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        flexDirection: 'row',
      }}>
        <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          <label>언어 선택: </label>
          <select value={extension} onChange={(e) => setExtension(e.target.value)}>
            <option value="js">JavaScript</option>
            <option value="java">Java</option>
            <option value="py">Python</option>
            <option value="cpp">C++</option>
            <option value="cs">C#</option>
            <option value="ts">TypeScript</option>
          </select>
        </div>


        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onAnalyze} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            다이어그램 생성
          </button>
          <button onClick={onLoadSample} style={{ padding: '10px 20px', backgroundColor: '#e1f5fe', border: 'none', borderRadius: '4px' }}>
            샘플 로드
          </button>
        </div>
      </div>
      <div
        style={{ width: '100%', display: 'flex' }}>
        <textarea
          rows="12"
          style={{ flex: 1, padding: '10px', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #ccc' }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="여기에 코드를 입력하세요 (여러 클래스 가능)..."
        />
      </div>
    </div>
  );
};

export default CodeInput;