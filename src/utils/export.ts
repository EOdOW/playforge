import Konva from 'konva';
import jsPDF from 'jspdf';

export function exportAsPng(stage: Konva.Stage, playName: string): void {
  const dataUrl = stage.toDataURL({ pixelRatio: 2 });
  const link = document.createElement('a');
  link.download = `${playName || 'play'}.png`;
  link.href = dataUrl;
  link.click();
}

export function exportAsPdf(stage: Konva.Stage, playName: string): void {
  const dataUrl = stage.toDataURL({ pixelRatio: 2 });
  const pdf = new jsPDF('landscape', 'pt', 'letter');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Title
  pdf.setFontSize(18);
  pdf.text(playName || 'Untitled Play', 40, 40);

  // Image — fit to page with margins
  const margin = 40;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (imgWidth * stage.height()) / stage.width();

  pdf.addImage(dataUrl, 'PNG', margin, 60, imgWidth, Math.min(imgHeight, pageHeight - 100));
  pdf.save(`${playName || 'play'}.pdf`);
}
