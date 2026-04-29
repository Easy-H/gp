import React, { useState, useEffect } from 'react';
import ClassDetailHeader from './ClassDetailHeader';
import ClassDetailRelations from './ClassDetailRelations';
import ClassDetailMembers from './ClassDetailMembers';
import ClassFileViewer from './ClassFileViewer';

const ClassDetailView = ({ classInfo, onSelectClass, onBack, hasHistory, onUpdate, allClassNames, extension }) => {
  const [data, setData] = useState(classInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    setData(classInfo);
  }, [classInfo]);

  useEffect(() => {
    setIsEditing(false); // 클래스 이름이 바뀔 때(즉, 다른 클래스로 이동 시)만 편집 모드 해제
    setShowCode(false);    // 다른 클래스 선택 시 코드 보기 상태 초기화
  }, [classInfo?.name]);

  // 클래스 링크와 "없음" 표시의 높이 및 정렬을 완전히 통일하기 위한 스타일
  const itemBaseStyle = {
    padding: '2px 6px',
    fontSize: '0.9rem',
    lineHeight: '1.2',
    display: 'inline-flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    height: '26px', // 26px로 표준화
    verticalAlign: 'middle'
  };

  // 입력창(input)과 선택창(select)을 위한 공통 스타일
  const inputBaseStyle = {
    ...itemBaseStyle,
    display: 'block', // input은 flex 보다는 block/width 100%가 안정적
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    backgroundColor: '#fff',
    outline: 'none'
  };

  // Add 버튼의 높이를 itemBaseStyle과 맞추기 위한 스타일
  const addBtnStyle = {
    ...itemBaseStyle,
    fontSize: '0.7rem',
    cursor: 'pointer',
    border: '1px solid #e2e8f0',
    background: '#fff',
    fontWeight: '600'
  };

  // 삭제(x) 버튼의 통일된 스타일
  const removeBtnStyle = {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    padding: '0 4px',
    lineHeight: '1',
    display: 'inline-flex',
    alignItems: 'center',
    height: '26px'
  };

  // 가시성 아이콘/기호 매핑
  const getVisibilityBadge = (v) => {
    const colors = { public: '#10b981', private: '#ef4444', protected: '#f59e0b', internal: '#6366f1' };
    const char = { public: '+', private: '-', protected: '#', internal: '~' };
    return <span style={{ color: colors[v] || '#666', fontWeight: 'bold', marginRight: '8px', fontSize: '1.1rem' }}>{char[v] || '•'}</span>;
  };

  const renderLink = (name) => {
    const exists = allClassNames.includes(name);
    return (
      <button
        key={name}
        onClick={() => exists && onSelectClass(name)}
        style={{
          ...itemBaseStyle,
          background: exists ? '#eff6ff' : 'none',
          border: 'none',
          borderRadius: '4px',
          color: exists ? '#2563eb' : '#94a3b8',
          cursor: exists ? 'pointer' : 'default',
        }}
      >
        {name}
      </button>
    );
  };

  // Helper to update data and then call onUpdate
  const updateDataAndNotify = (updated) => {
    setData(updated);
    onUpdate(updated);
  };

  return (
    <div className="class-detail-card" style={{
      padding: '24px',
      position: 'relative',
      backgroundColor: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Buttons for navigation and editing */}
      {!data ? (
        <div style={{ textAlign: 'center', padding: '40px 10px', color: '#666' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '15px', opacity: 0.5 }}>🧩</div>
          <h4 style={{ color: '#1e293b', marginBottom: '8px' }}>클래스 인스펙터</h4>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.5' }}>
            위 검색창을 이용해 클래스 이름을 검색하거나,<br />
            다이어그램에서 클래스를 선택하여 상세 정보를 편집할 수 있습니다.
          </p>
          {allClassNames.length > 0 && (
            <p style={{ fontSize: '0.8rem', color: '#999' }}>현재 {allClassNames.length}개의 클래스가 분석되었습니다.</p>
          )}
        </div>
      ) : (
        <>
          <div style={{
            position: 'absolute', top: '24px', right: '24px',
            display: 'flex', gap: '8px', alignItems: 'center',
            zIndex: 10
          }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                fontSize: '0.8rem', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px',
                border: 'none', backgroundColor: isEditing ? '#10b981' : '#3b82f6',
                color: '#fff', fontWeight: '600', transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              {isEditing ? '✔ 편집 완료' : '✎ 정보 편집'}
            </button>
          </div>

          <div className="internal-split-layout" style={{ flex: 1, overflow: 'hidden' }}>
            {/* 왼쪽 섹션: 클래스 상세 정보 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '10px', paddingTop: '10px' }}>
              <ClassDetailHeader
                data={data}
                isEditing={isEditing}
                onUpdate={updateDataAndNotify}
                onBack={onBack}
                hasHistory={hasHistory}
                itemBaseStyle={itemBaseStyle}
                inputBaseStyle={inputBaseStyle}
                extension={extension}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <ClassDetailRelations
                  data={data}
                  isEditing={isEditing}
                  onUpdate={updateDataAndNotify}
                  allClassNames={allClassNames}
                  extension={extension}
                  itemBaseStyle={itemBaseStyle}
                  inputBaseStyle={inputBaseStyle}
                  addBtnStyle={addBtnStyle}
                  removeBtnStyle={removeBtnStyle}
                  renderLink={renderLink}
                />
                <ClassDetailMembers
                  data={data}
                  isEditing={isEditing}
                  onUpdate={updateDataAndNotify}
                  itemBaseStyle={itemBaseStyle}
                  inputBaseStyle={inputBaseStyle}
                  addBtnStyle={addBtnStyle}
                  removeBtnStyle={removeBtnStyle}
                  getVisibilityBadge={getVisibilityBadge}
                />
              </div>
            </div>
              {/* 오른쪽 섹션: 파일 정보 및 코드 내용 */}
              <ClassFileViewer
                data={data}
                showCode={showCode}
                setShowCode={setShowCode}
              />
            </div>
        </>
      )}
    </div>
  );
};

export default ClassDetailView;