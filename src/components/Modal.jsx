import React from 'react';

const Modal = ({ children, onClose }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '12px', width: '90%', 
        maxWidth: '1000px', maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)', position: 'relative',
        padding: '5px'
      }} onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '10px', right: '15px',
            border: 'none', background: 'none', fontSize: '24px',
            cursor: 'pointer', color: '#888', zIndex: 1001,
            lineHeight: '1'
          }}
        >&times;</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;