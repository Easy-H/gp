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
    borderRadius: '4px',
    backgroundColor: 'var(--panel-bg)',
    outline: 'none'
  };

  // Add 버튼의 높이를 itemBaseStyle과 맞추기 위한 스타일
  const addBtnStyle = {
    ...itemBaseStyle,
    fontSize: '0.7rem',
    cursor: 'pointer',
    border: '1px solid var(--panel-border)',
    background: 'var(--panel-bg)',
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
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '12px 12px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              gap: 10,
              minHeight: 0,
              alignContent: 'start',
            }}>
              {allClassNames.map((name) => (
                <button
                  key={name}
                  onClick={() => onSelectClass(name)}
                  style={{
                    border: '1px solid var(--panel-border)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    background: 'var(--panel-bg-2)',
                    color: 'var(--panel-text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    fontWeight: 600,
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
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '12px 12px 16px' }}>
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
            <button
              onClick={onBack}
              style={{
                cursor: 'pointer',
                border: '1px solid var(--panel-border)',
                borderRadius: '6px',
                backgroundColor: 'var(--panel-bg)',
                color: 'var(--panel-muted)',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
            >
              ← 뒤로
            </button>
          </div>

          <div className="internal-split-layout" style={{ flex: 1, overflow: 'visible', minHeight: 0, padding: '12px 12px 8px', alignItems: 'stretch' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'visible', minHeight: 0 }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: 0, overflow: 'visible' }}>
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
