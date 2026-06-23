import React, { useState, useEffect } from 'react';
import ClassDetailHeader from './ClassDetailHeader';
import ClassDetailRelations from './ClassDetailRelations';
import ClassDetailMembers from './ClassDetailMembers';

const ClassDetailView = ({ classInfo, onSelectClass, onBack, hasHistory, onUpdate, allClassNames, extension }) => {
  const [data, setData] = useState(classInfo);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setData(classInfo);
  }, [classInfo]);

  useEffect(() => {
    setIsEditing(false); // 클래스 이름이 바뀔 때(즉, 다른 클래스로 이동 시)만 편집 모드 해제
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
    verticalAlign: 'middle',
    color: 'var(--panel-text)',
  };

  // 입력창(input)과 선택창(select)을 위한 공통 스타일
  const inputBaseStyle = {
    ...itemBaseStyle,
    display: 'block', // input은 flex 보다는 block/width 100%가 안정적
    border: '1px solid var(--panel-border)',
    borderRadius: 'var(--control-radius)',
    backgroundColor: 'var(--panel-bg)',
    outline: 'none',
    minHeight: 'var(--control-height-sm)',
    height: 'var(--control-height-sm)',
    padding: '0 8px',
    color: 'var(--panel-text)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  // Add 버튼의 높이를 itemBaseStyle과 맞추기 위한 스타일
  const addBtnStyle = {
    minHeight: 'var(--control-height-sm)',
    height: 'var(--control-height-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    border: '1px solid var(--panel-border)',
    background: 'var(--panel-bg)',
    borderRadius: 'var(--control-radius)',
    color: 'var(--panel-text)',
    fontWeight: '600',
    boxShadow: 'var(--control-shadow)',
    whiteSpace: 'nowrap',
  };

  // 삭제(x) 버튼의 통일된 스타일
  const removeBtnStyle = {
    width: 'var(--control-height-sm)',
    minWidth: 'var(--control-height-sm)',
    height: 'var(--control-height-sm)',
    border: '1px solid var(--panel-border)',
    borderRadius: 'var(--control-radius)',
    background: 'var(--panel-bg)',
    cursor: 'pointer',
    color: 'var(--app-danger)',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    padding: 0,
    lineHeight: '1',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--control-shadow)',
  };

  // 가시성 아이콘/기호 매핑
  const getVisibilityBadge = (v) => {
    const colors = { public: 'var(--app-success)', private: 'var(--app-danger)', protected: 'var(--app-warning)', internal: 'var(--app-info)' };
    const char = { public: '+', private: '-', protected: '#', internal: '~' };
    return <span style={{ color: colors[v] || 'var(--panel-muted)', fontWeight: 'bold', marginRight: '8px', fontSize: '1.1rem' }}>{char[v] || '•'}</span>;
  };

  const renderLink = (name) => {
    const exists = allClassNames.includes(name);
    return (
      <button
        key={name}
        onClick={() => exists && onSelectClass(name)}
        style={{
          ...itemBaseStyle,
          background: exists ? 'var(--app-link-bg)' : 'none',
          border: 'none',
          borderRadius: '4px',
          color: exists ? 'var(--app-link-text)' : 'var(--panel-muted)',
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
      padding: 0,
      position: 'relative',
      backgroundColor: 'var(--panel-bg)',
      border: 'none',
      borderRadius: 0,
      boxShadow: 'none',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Buttons for navigation and editing */}
      {!data ? (
      <div className="analysis-panel-scroll">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--panel-section-gap)' }}>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--panel-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}>
              클래스 선택
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 'var(--panel-gap)',
              minHeight: 0,
              alignContent: 'start',
            }}>
              {allClassNames.map((name) => (
                <button
                  className="app-btn"
                  key={name}
                  onClick={() => onSelectClass(name)}
                  style={{
                    justifyContent: 'flex-start',
                    minHeight: 44,
                    textAlign: 'left',
                  }}
                >
                  {name}
                </button>
              ))}
              {allClassNames.length === 0 && (
                <div style={{ color: 'var(--panel-muted)', fontSize: '0.9rem' }}>선택 가능한 클래스가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="analysis-panel-scroll">
          <div style={{ marginBottom: 'var(--panel-section-gap)' }}>
            <ClassDetailHeader
              data={data}
              isEditing={isEditing}
              onUpdate={updateDataAndNotify}
              onBack={onBack}
              hasHistory={hasHistory}
              itemBaseStyle={itemBaseStyle}
              inputBaseStyle={inputBaseStyle}
              extension={extension}
              marginBottom={0}
              actions={(
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, marginLeft: 'auto' }}>
              <button
                className={`app-btn ${isEditing ? '' : 'app-btn-primary'}`}
                onClick={() => setIsEditing(!isEditing)}
                style={isEditing ? { backgroundColor: 'var(--app-success)', borderColor: 'var(--app-success)', color: 'var(--app-on-accent)' } : undefined}
              >
                {isEditing ? '✔ 편집 완료' : '✎ 정보 편집'}
              </button>
              <button
                className="app-btn"
                onClick={onBack}
              >
                ← 뒤로
              </button>
                </div>
              )}
            />
          </div>
            <div className="internal-split-layout" style={{ flex: 1, overflow: 'visible', minHeight: 0, padding: 'var(--panel-space) var(--panel-space) 8px', alignItems: 'stretch' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'visible', minHeight: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--panel-gap)', flex: 1, minHeight: 0, overflow: 'visible' }}>
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
            </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetailView;
