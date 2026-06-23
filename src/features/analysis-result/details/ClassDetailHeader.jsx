import React from 'react';

const ClassDetailHeader = ({ data, isEditing, onUpdate, itemBaseStyle, inputBaseStyle, extension, marginBottom = '24px', actions = null }) => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom }}>
        {isEditing && (!data.children || data.children.length === 0) && (!data.associations || data.associations.length === 0) ? (
          <select
            value={data.type}
            onChange={(e) => {
              const updated = { ...data, type: e.target.value };
              onUpdate(updated);
            }}
            style={{ ...inputBaseStyle, width: '110px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--app-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
          >
            <option value="class">Class</option>
            <option value="interface">Interface</option>
          </select>
        ) : (
          <span style={{ ...itemBaseStyle, width: '110px', justifyContent: 'left', border: '1px solid transparent', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--app-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {data.type === 'interface' ? 'Interface' : 'Class'}
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--panel-gap)', flexWrap: 'nowrap', width: '100%' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--panel-text)', fontWeight: '800' }}>
            {data.name}
          </h3>
          {actions}
        </div>
      </div>
    </>
  );
};

export default ClassDetailHeader;
