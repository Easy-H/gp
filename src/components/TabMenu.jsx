import React from 'react';

const TabMenu = ({ activeTab, setActiveTab }) => {
  const buttonStyle = (tab) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid #007bff' : 'none',
    color: 'black',
    background: 'none',
    fontWeight: activeTab === tab ? 'bold' : 'normal'
  });

  return (
    <div style={{ display: 'flex', gap: '5px', paddingBottom: '10px' }}>
      <button onClick={() => setActiveTab('input')} style={buttonStyle('input')}>
        코드 직접 입력
      </button>
      <button onClick={() => setActiveTab('git')} style={buttonStyle('git')}>
        Git 저장소 (.git)
      </button>
      <button onClick={() => setActiveTab('zip')} style={buttonStyle('zip')}>
        프로젝트 업로드 (Zip)
      </button>
    </div>
  );
};

export default TabMenu;