import React from 'react';

const ClassDetailMembers = ({
  data, isEditing, onUpdate,
  itemBaseStyle, inputBaseStyle, addBtnStyle, removeBtnStyle, getVisibilityBadge
}) => {

  const handleFieldChange = (index, key, value) => {
    const newFields = [...data.fields];
    newFields[index] = { ...newFields[index], [key]: value };
    const updated = { ...data, fields: newFields };
    onUpdate(updated);
  };

  const addField = () => {
    const updated = { ...data, fields: [...data.fields, { name: 'newField', type: 'string', visibility: 'public' }] };
    onUpdate(updated);
  };

  const removeField = (index) => {
    const newFields = data.fields.filter((_, i) => i !== index);
    const updated = { ...data, fields: newFields };
    onUpdate(updated);
  };

  const handleMethodChange = (index, key, value) => {
    const newMethods = [...data.methods];
    newMethods[index] = { ...newMethods[index], [key]: value };
    const updated = { ...data, methods: newMethods };
    onUpdate(updated);
  };

  const addMethod = () => {
    const updated = { ...data, methods: [...data.methods, { name: 'newMethod', type: 'void', visibility: 'public' }] };
    onUpdate(updated);
  };

  const removeMethod = (index) => {
    const newMethods = data.methods.filter((_, i) => i !== index);
    const updated = { ...data, methods: newMethods };
    onUpdate(updated);
  };

  return (
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
  );
};

export default ClassDetailMembers;