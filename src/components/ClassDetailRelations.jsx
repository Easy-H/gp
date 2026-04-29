import React from 'react';

const ClassDetailRelations = ({
  data, isEditing, onUpdate, allClassNames, extension,
  itemBaseStyle, inputBaseStyle, addBtnStyle, removeBtnStyle, renderLink
}) => {

  const handleRelationItemChange = (type, index, value) => {
    const newList = [...data[type]];
    newList[index] = value;
    const updated = { ...data, [type]: newList };
    onUpdate(updated);
  };

  const handleAssocChange = (index, key, value) => {
    const newAssocs = [...data.associations];
    newAssocs[index] = { ...newAssocs[index], [key]: value };
    const updated = { ...data, associations: newAssocs };
    onUpdate(updated);
  };

  const addParent = () => {
    const updated = { ...data, parents: [...data.parents, ''] };
    onUpdate(updated);
  };

  const removeParent = (index) => {
    const newParents = data.parents.filter((_, i) => i !== index);
    const updated = { ...data, parents: newParents };
    onUpdate(updated);
  };

  const addImplement = () => {
    const updated = { ...data, implements: [...data.implements, ''] };
    onUpdate(updated);
  };

  const removeImplement = (index) => {
    const newImplements = data.implements.filter((_, i) => i !== index);
    const updated = { ...data, implements: newImplements };
    onUpdate(updated);
  };

  const addAssociation = () => {
    const updated = { ...data, associations: [...data.associations, { target: '', label: '', relationType: 'association' }] };
    onUpdate(updated);
  };

  const removeAssociation = (index) => {
    const newAssocs = data.associations.filter((_, i) => i !== index);
    const updated = { ...data, associations: newAssocs };
    onUpdate(updated);
  };

  const addComposition = () => {
    const updated = { ...data, associations: [...data.associations, { target: '', label: '', relationType: 'composition' }] };
    onUpdate(updated);
  };

  // 다중 상속 허용 여부 체크
  const canAddMultipleParents = () => {
    if (data.type === 'interface') return true; // 인터페이스는 대부분 다중 상속 허용
    return ['py', 'cpp'].includes(extension);   // Python, C++만 클래스 다중 상속 허용
  };

  return (
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
  );
};

export default ClassDetailRelations;