import React from 'react';

const ClassDetailHeader = ({ data, isEditing, onUpdate, onBack, hasHistory, itemBaseStyle, inputBaseStyle, extension }) => {
  return (
    <>
      {hasHistory && (
        <button
          onClick={onBack}
          style={{
            cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '6px',
            backgroundColor: '#fff', color: '#64748b', padding: '6px 12px',
            fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.2s',
            position: 'absolute', top: '24px', right: '120px', zIndex: 10
          }}
        >← 뒤로</button>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
        {isEditing && (!data.children || data.children.length === 0) && (!data.associations || data.associations.length === 0) ? (
          <select
            value={data.type}
            onChange={(e) => {
              const updated = { ...data, type: e.target.value };
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
    </>
  );
};

export default ClassDetailHeader;