import React, { useState, useEffect } from 'react';

const ClassDetailView = ({ classInfo, onSelectClass, onBack, hasHistory, onUpdate, allClassNames, extension }) => {
  const [data, setData] = useState(classInfo);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setData(classInfo);
  }, [classInfo]);

  useEffect(() => {
    setIsEditing(false); // 클래스 이름이 바뀔 때(즉, 다른 클래스로 이동 시)만 편집 모드 해제
  }, [classInfo?.name]);

  // 가시성 아이콘/기호 매핑
  const getVisibilityBadge = (v) => {
    const colors = { public: '#10b981', private: '#ef4444', protected: '#f59e0b', internal: '#6366f1' };
    const char = { public: '+', private: '-', protected: '#', internal: '~' };
    return <span style={{ color: colors[v] || '#666', fontWeight: 'bold', marginRight: '8px', fontSize: '1.1rem' }}>{char[v] || '•'}</span>;
  };

  const handleFieldChange = (index, key, value) => {
    const newFields = [...data.fields];
    newFields[index] = { ...newFields[index], [key]: value };
    const updated = { ...data, fields: newFields };
    setData(updated);
    onUpdate(updated);
  };

  const addField = () => {
    const updated = { ...data, fields: [...data.fields, { name: 'newField', type: 'string', visibility: 'public' }] };
    setData(updated);
    onUpdate(updated);
  };

  const removeField = (index) => {
    const newFields = data.fields.filter((_, i) => i !== index);
    const updated = { ...data, fields: newFields };
    setData(updated);
    onUpdate(updated);
  };

  const handleMethodChange = (index, key, value) => {
    const newMethods = [...data.methods];
    newMethods[index] = { ...newMethods[index], [key]: value };
    const updated = { ...data, methods: newMethods };
    setData(updated);
    onUpdate(updated);
  };

  const addMethod = () => {
    const updated = { ...data, methods: [...data.methods, { name: 'newMethod', type: 'void', visibility: 'public' }] };
    setData(updated);
    onUpdate(updated);
  };

  const removeMethod = (index) => {
    const newMethods = data.methods.filter((_, i) => i !== index);
    const updated = { ...data, methods: newMethods };
    setData(updated);
    onUpdate(updated);
  };

  const handleRelationItemChange = (type, index, value) => {
    const newList = [...data[type]];
    newList[index] = value;
    const updated = { ...data, [type]: newList };
    setData(updated);
    onUpdate(updated);
  };

  const handleAssocChange = (index, key, value) => {
    const newAssocs = [...data.associations];
    newAssocs[index] = { ...newAssocs[index], [key]: value };
    const updated = { ...data, associations: newAssocs };
    setData(updated);
    onUpdate(updated);
  };

  const addParent = () => {
    const updated = { ...data, parents: [...data.parents, ''] };
    setData(updated);
    onUpdate(updated);
  };

  const removeParent = (index) => {
    const newParents = data.parents.filter((_, i) => i !== index);
    const updated = { ...data, parents: newParents };
    setData(updated);
    onUpdate(updated);
  };

  const addImplement = () => {
    const updated = { ...data, implements: [...data.implements, ''] };
    setData(updated);
    onUpdate(updated);
  };

  const removeImplement = (index) => {
    const newImplements = data.implements.filter((_, i) => i !== index);
    const updated = { ...data, implements: newImplements };
    setData(updated);
    onUpdate(updated);
  };

  const addAssociation = () => {
    const updated = { ...data, associations: [...data.associations, { target: '', label: '', relationType: 'association' }] };
    setData(updated);
    onUpdate(updated);
  };

  const removeAssociation = (index) => {
    const newAssocs = data.associations.filter((_, i) => i !== index);
    const updated = { ...data, associations: newAssocs };
    setData(updated);
    onUpdate(updated);
  };

  const addComposition = () => {
    const updated = { ...data, associations: [...data.associations, { target: '', label: '', relationType: 'composition' }] };
    setData(updated);
    onUpdate(updated);
  };

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

  // 다중 상속 허용 여부 체크
  const canAddMultipleParents = () => {
    if (data.type === 'interface') return true; // 인터페이스는 대부분 다중 상속 허용
    return ['py', 'cpp'].includes(extension);   // Python, C++만 클래스 다중 상속 허용
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

  return (
    <div className="class-detail-card" style={{ 
      padding: '24px', 
      position: 'relative', 
      backgroundColor: '#fff', 
      border: '1px solid #e2e8f0', 
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
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
      {/* Top right action buttons */}
      <div style={{ 
        position: 'absolute', top: '24px', right: '24px', 
        display: 'flex', gap: '8px', alignItems: 'center',
        zIndex: 10
      }}>
        {hasHistory && (
          <button 
            onClick={onBack}
            style={{ 
              cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '6px', 
              backgroundColor: '#fff', color: '#64748b', padding: '6px 12px', 
              fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.2s'
            }}
          >← 뒤로</button>
        )}
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
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
        {isEditing && (!data.children || data.children.length === 0) && (!data.associations || data.associations.length === 0) ? (
          <select 
            value={data.type} 
            onChange={(e) => {
              const updated = { ...data, type: e.target.value };
              setData(updated);
              onUpdate(updated);
            }}
            style={{ ...inputBaseStyle, width: '110px', fontSize: '0.75rem', fontWeight: 'bold', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}
          >
            <option value="class">Class</option>
            <option value="interface">Interface</option>
          </select>
        ) : (
          <span style={{ ...itemBaseStyle, width: '110px', justifyContent: 'left', border: '1px solid transparent', fontSize: '0.75rem', fontWeight: 'bold', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {data.type === 'interface' ? 'Interface' : 'Class'}
          </span>
        )}
        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a', fontWeight: '800', maxWidth: '70%' }}>
          {data.name}
        </h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Hierarchy & Relations Section */}
        <section>
          <h4 style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>Hierarchy & Relations</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Parents */}
            <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <strong style={{ color: '#64748b' }}>상속(Parents):</strong>
            {isEditing ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                {data.parents.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    <input value={p} onChange={e => handleRelationItemChange('parents', i, e.target.value)} style={{ ...inputBaseStyle, width: '80px' }} />
                    <button onClick={() => removeParent(i)} style={removeBtnStyle}>×</button>
                  </div>
                ))}
                {(canAddMultipleParents() || data.parents.length === 0) && (
                  <button onClick={addParent} style={addBtnStyle}>+ Add</button>
                )}
              </div>
            ) : (
              data.parents.length > 0 ? data.parents.map(renderLink) : <span style={{ ...itemBaseStyle, color: '#94a3b8' }}>없음</span>
            )}
          </div>

          {/* Implements */}
            <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <strong style={{ color: '#64748b' }}>구현(Implements):</strong>
            {isEditing ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                {data.implements.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    <input value={p} onChange={e => handleRelationItemChange('implements', i, e.target.value)} style={{ ...inputBaseStyle, width: '80px' }} />
                    <button onClick={() => removeImplement(i)} style={removeBtnStyle}>×</button>
                  </div>
                ))}
                <button onClick={addImplement} style={addBtnStyle}>+ Add</button>
              </div>
            ) : (
              data.implements.length > 0 ? data.implements.map(renderLink) : <span style={{ ...itemBaseStyle, color: '#94a3b8' }}>없음</span>
            )}
          </div>

          {/* Associations */}
            <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <strong style={{ color: '#64748b' }}>연관(Associations):</strong>
            {isEditing ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                {data.associations.map((a, i) => a.relationType === 'association' && (
                  <div key={i} style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    <input value={a.target} onChange={e => handleAssocChange(i, 'target', e.target.value)} placeholder="클래스" style={{ ...inputBaseStyle, width: '80px' }} />
                    <input value={a.label || ''} onChange={e => handleAssocChange(i, 'label', e.target.value)} placeholder="역할" style={{ ...inputBaseStyle, width: '60px' }} />
                    <button onClick={() => removeAssociation(i)} style={removeBtnStyle}>×</button>
                  </div>
                ))}
                <button onClick={addAssociation} style={addBtnStyle}>+ Add</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                {data.associations.filter(a => a.relationType === 'association').length > 0 ? (
                  data.associations.map((a, i) => a.relationType === 'association' && (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', color: '#334155' }}>
                      <span style={{ color: '#94a3b8', marginRight: '4px' }}>→</span>
                      {renderLink(a.target)}
                      {a.label && <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '4px' }}>[{a.label}]</span>}
                    </div>
                  ))
                ) : (
                  <span style={{ ...itemBaseStyle, color: '#94a3b8' }}>없음</span>
                )}
              </div>
            )}
          </div>

          {/* Compositions */}
            <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <strong style={{ color: '#64748b' }}>포함(Compositions):</strong>
            {isEditing ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                {data.associations.map((a, i) => a.relationType === 'composition' && (
                  <div key={i} style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    <input value={a.target} onChange={e => handleAssocChange(i, 'target', e.target.value)} placeholder="클래스" style={{ ...inputBaseStyle, width: '80px' }} />
                    <input value={a.label || ''} onChange={e => handleAssocChange(i, 'label', e.target.value)} placeholder="역할" style={{ ...inputBaseStyle, width: '60px' }} />
                    <button onClick={() => removeAssociation(i)} style={removeBtnStyle}>×</button>
                  </div>
                ))}
                <button onClick={addComposition} style={addBtnStyle}>+ Add</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                {data.associations.filter(a => a.relationType === 'composition').length > 0 ? (
                  data.associations.map((a, i) => a.relationType === 'composition' && (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', color: '#334155' }}>
                      <span style={{ color: '#94a3b8', marginRight: '4px' }}>◆</span>
                      {renderLink(a.target)}
                      {a.label && <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '4px' }}>[{a.label}]</span>}
                    </div>
                  ))
                ) : (
                  <span style={{ ...itemBaseStyle, color: '#94a3b8' }}>없음</span>
                )}
              </div>
            )}
          </div>
            
            {/* Descendants */}
            <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', minHeight: '24px' }}>
            <strong style={{ color: '#64748b' }}>자손 클래스(Descendants):</strong>
            {data.children && data.children.length > 0 ? data.children.map(renderLink) : <span style={{ ...itemBaseStyle, color: '#94a3b8' }}>없음</span>}
          </div>
          </div>
        </section>

        {/* Members Section */}
        <section>
          <h4 style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>Members</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Fields */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '0.9rem', color: '#475569' }}>필드 (Fields)</strong>
              {isEditing && <button onClick={addField} style={addBtnStyle}>+ Add</button>}
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.fields.length === 0 && <div style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '4px 0' }}>정의된 필드가 없습니다.</div>}
              {data.fields.map((f, i) => (
                <div key={i}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <input 
                        value={f.name} 
                        onChange={e => handleFieldChange(i, 'name', e.target.value)} 
                        style={{ ...inputBaseStyle, flex: 1, minWidth: '0' }} 
                      /> : 
                      <input 
                        value={f.type || ''} 
                        onChange={e => handleFieldChange(i, 'type', e.target.value)} 
                        placeholder="타입" 
                        style={{ ...inputBaseStyle, width: '100px' }} 
                      />
                    <button onClick={() => removeField(i)} style={removeBtnStyle}>×</button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', color: '#334155' }}>
                      {getVisibilityBadge(f.visibility)}
                      <span style={{ fontWeight: '500' }}>{f.name}</span>
                      {f.type && <span style={{ color: '#64748b', marginLeft: '4px' }}>: {f.type}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Methods */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '0.9rem', color: '#475569' }}>메서드 (Methods)</strong>
              {isEditing && <button onClick={addMethod} style={addBtnStyle}>+ Add</button>}
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.methods.length === 0 && <div style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '4px 0' }}>정의된 메서드가 없습니다.</div>}
              {data.methods.map((m, i) => (
                <div key={i}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <select
                        value={m.visibility || 'public'}
                        onChange={e => handleMethodChange(i, 'visibility', e.target.value)}
                        style={{ ...inputBaseStyle, width: '45px', padding: '4px', cursor: 'pointer' }}
                      >
                        <option value="public">+</option>
                        <option value="private">-</option>
                        <option value="protected">#</option>
                        <option value="internal">~</option>
                      </select>
                      <input 
                        value={m.name} 
                        onChange={e => handleMethodChange(i, 'name', e.target.value)} 
                        style={{ ...inputBaseStyle, flex: 1, minWidth: '0' }} 
                      />() : 
                    <input value={m.type || ''} onChange={e => handleMethodChange(i, 'type', e.target.value)} placeholder="반환형" style={{ ...inputBaseStyle, width: '100px' }} />
                      <button onClick={() => removeMethod(i)} style={removeBtnStyle}>×</button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', color: '#334155' }}>
                      {getVisibilityBadge(m.visibility)}
                      <span style={{ fontWeight: '500' }}>{m.name}()</span>
                      {m.type && <span style={{ color: '#64748b', marginLeft: '4px' }}>: {m.type}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          </div>
        </section>
      </div>
        </>
      )}
    </div>
  );
};

export default ClassDetailView;