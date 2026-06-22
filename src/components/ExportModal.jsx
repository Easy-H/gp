import React from 'react';
import Modal from './Modal';

const ExportModal = ({ isOpen, onClose, onExportData, onExportPng }) => {
  if (!isOpen) return null;
  return (
    <Modal onClose={onClose}>
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a', fontWeight: '800' }}>다이어그램 내보내기</h3>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>원하는 파일 형식을 선택하여 저장하세요.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className='secondary-btn' onClick={() => { onExportData('mmd'); onClose(); }}>Mermaid (.mmd)</button>
          <button className='secondary-btn' onClick={() => { onExportPng(); onClose(); }}>이미지 (.png)</button>
          <button className='secondary-btn' onClick={() => { onExportData('puml'); onClose(); }}>PlantUML (.puml)</button>
          <button className='secondary-btn' onClick={() => { onExportData('dot'); onClose(); }}>Graphviz (.dot)</button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;

