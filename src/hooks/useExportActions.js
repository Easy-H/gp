import { toMermaid, toPlantUML, toDOT } from '../Exporter';

export const useExportActions = ({ currentClasses, layoutDir, onAlert }) => {
  const downloadFile = (content, filename, urlOverride = null) => {
    const url = urlOverride || URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    if (!urlOverride) URL.revokeObjectURL(url);
  };

  const exportData = (type) => {
    if (!currentClasses || currentClasses.length === 0) {
      onAlert('먼저 분석을 진행해주세요.');
      return;
    }
    if (type === 'mmd') downloadFile(toMermaid(currentClasses, layoutDir), 'diagram.mmd');
    if (type === 'puml') downloadFile(toPlantUML(currentClasses, layoutDir), 'diagram.puml');
    if (type === 'dot') downloadFile(toDOT(currentClasses), 'diagram.dot');
  };

  const handlePngExport = () => {
    const svg = document.querySelector('.mermaid svg');
    if (!svg) {
      onAlert('다이어그램이 렌더링되지 않았습니다.');
      return;
    }
    const canvas = document.createElement('canvas');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngUrl = canvas.toDataURL('image/png');
      downloadFile(null, 'diagram.png', pngUrl);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return { exportData, handlePngExport };
};

