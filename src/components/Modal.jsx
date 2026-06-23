import React from 'react';

const Modal = ({ children, onClose, maxWidth = '1000px', title, description, align = 'left', fixedContent = null }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      padding: '16px',
      boxSizing: 'border-box',
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--panel-bg)', color: 'var(--panel-text)', border: '1px solid var(--panel-border)', borderRadius: 'var(--control-radius)', width: '90%',
        maxWidth, maxHeight: '85vh', overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)', position: 'relative',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
      }} onClick={e => e.stopPropagation()}>
        <style>{`
          .modal-scroll-container {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .modal-scroll-container::-webkit-scrollbar {
            width: 0;
            height: 0;
          }
        `}</style>
        <button 
          onClick={onClose}
          className="app-btn app-icon-btn"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 1001,
          }}
        >&times;</button>
        {(title || description) && (
          <div style={{
            padding: fixedContent ? '28px 56px 14px 28px' : '28px 56px 18px 28px',
            textAlign: align,
            position: 'relative',
            zIndex: 2,
            background: fixedContent ? 'var(--panel-bg)' : 'linear-gradient(to bottom, var(--panel-bg) 0%, var(--panel-bg) 72%, color-mix(in srgb, var(--panel-bg) 82%, transparent) 100%)',
          }}>
            {title && <h2 style={{ margin: 0, color: 'var(--panel-text)', fontWeight: 800, fontSize: '1.25rem' }}>{title}</h2>}
            {description && <p style={{ color: 'var(--panel-muted)', margin: title ? '8px 0 0' : 0 }}>{description}</p>}
          </div>
        )}
        {fixedContent && (
          <div style={{
            padding: '0 28px 18px',
            position: 'relative',
            zIndex: 2,
            background: 'linear-gradient(to bottom, var(--panel-bg) 0%, var(--panel-bg) 78%, color-mix(in srgb, var(--panel-bg) 82%, transparent) 100%)',
          }}>
            {fixedContent}
          </div>
        )}
        <div className="modal-scroll-container" style={{
          padding: title || description || fixedContent ? '8px 28px 28px' : '28px',
          overflowY: 'auto',
          minHeight: 0,
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
