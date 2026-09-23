import { jsPDF } from 'jspdf';
import { Participant } from '../types';

interface PDFExportOptions {
  schoolName: string;
  lang: 'kn' | 'en';
  participants: Participant[];
}

/**
 * Generates an official, print-ready PDF document for the Aashubhashana Spardhe
 * (Pick and Speech Competition) with official Parishath header, winners podium,
 * detailed 5-criteria marks breakdown, and signature blocks.
 * 
 * Uses an offscreen high-DPI canvas to render complex Kannada Unicode typography
 * with 100% fidelity (all ligatures, ottakshara, and symbols), then compiles into jsPDF.
 */
export async function generateFinalResultsPDF({
  schoolName,
  lang,
  participants
}: PDFExportOptions): Promise<void> {
  const scored = participants
    .filter(p => p.scores !== undefined)
    .sort((a, b) => (b.scores?.total || 0) - (a.scores?.total || 0));

  // A4 dimensions in mm: 210 x 297. At 2x scale: 1240 x 1754 px
  const canvasWidth = 1240;
  const canvasHeight = Math.max(1754, 750 + Math.max(1, scored.length) * 44 + 320);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // High quality rendering settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. White Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Ornate Heritage Border (Karnataka Golden Amber & Maroon)
  ctx.strokeStyle = '#b45309'; // amber-700
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60);

  ctx.strokeStyle = '#dc2626'; // red-600
  ctx.lineWidth = 1.5;
  ctx.strokeRect(38, 38, canvasWidth - 76, canvasHeight - 76);

  // Decorative corner accents
  const drawCorner = (x: number, y: number) => {
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  };
  drawCorner(46, 46);
  drawCorner(canvasWidth - 46, 46);
  drawCorner(46, canvasHeight - 46);
  drawCorner(canvasWidth - 46, canvasHeight - 46);

  // 3. Official Header
  let currentY = 85;

  // Yellow-Red Karnataka Heritage Pill Badge
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(canvasWidth / 2 - 190, currentY - 26, 380, 32);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1;
  ctx.strokeRect(canvasWidth / 2 - 190, currentY - 26, 380, 32);

  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ ಅಧಿಕೃತ ಅಂತಿಮ ಫಲಿತಾಂಶ ಪಟ್ಟಿ / OFFICIAL RESULTS SHEET ★', canvasWidth / 2, currentY - 5);

  currentY += 35;

  // Main Organization Title
  ctx.fillStyle = '#78350f'; // Dark amber
  ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
  ctx.fillText('ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು', canvasWidth / 2, currentY);

  currentY += 28;
  ctx.fillStyle = '#b91c1c'; // Red
  ctx.font = 'bold 17px "Segoe UI", Arial, sans-serif';
  ctx.fillText('ತಾಂತ್ರಿಕ ಶಿಕ್ಷಕರ ಸಮಿತಿಯ ಸುಂದರ್ ಪಿಚೈ ತಂಡದ ವತಿಯಿಂದ • ಸಹಕಾರ ಸಮಿತಿಯ ಹಂತದ ಕಾರ್ಯಕ್ರಮ', canvasWidth / 2, currentY);

  currentY += 32;
  ctx.fillStyle = '#1c1917';
  ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText('ಆಶುಭಾಷಣ ಸ್ಪರ್ಧೆ - ಅಂತಿಮ ಶ್ರೇಯಾಂಕ ಮತ್ತು ಮೌಲ್ಯಮಾಪನ ಅಂಕಪಟ್ಟಿ', canvasWidth / 2, currentY);

  currentY += 24;
  ctx.fillStyle = '#57534e';
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  const todayStr = new Date().toLocaleDateString('kn-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  ctx.fillText(`ಸ್ಥಳ / ಶಾಲೆ: ${schoolName}  |  ದಿನಾಂಕ: ${todayStr}`, canvasWidth / 2, currentY);

  currentY += 15;
  // Header divider
  ctx.strokeStyle = '#e7e5e4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, currentY);
  ctx.lineTo(canvasWidth - 60, currentY);
  ctx.stroke();

  currentY += 30;

  // 4. Winners Podium Box (Top 3)
  if (scored.length > 0) {
    const first = scored[0];
    const second = scored[1];
    const third = scored[2];

    const podiumBoxWidth = canvasWidth - 120;
    const podiumBoxHeight = 135;
    const podiumX = 60;

    // Background gradient effect
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(podiumX, currentY, podiumBoxWidth, podiumBoxHeight);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(podiumX, currentY, podiumBoxWidth, podiumBoxHeight);

    // Podium Title
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏆 ಅಂತಿಮ ವಿಜೇತರ ವಿವರ (WINNERS PODIUM):', podiumX + 20, currentY + 26);

    const colWidth = (podiumBoxWidth - 40) / 3;

    // 1st Prize
    if (first) {
      const colX = podiumX + 20;
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(colX, currentY + 38, colWidth - 10, 82);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(colX, currentY + 38, colWidth - 10, 82);

      ctx.fillStyle = '#854d0e';
      ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
      ctx.fillText('🥇 ಪ್ರಥಮ ಬಹುಮಾನ (1st)', colX + 10, currentY + 58);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`#{${first.chestNo}} ${first.name}`, colX + 10, currentY + 80);

      ctx.fillStyle = '#475569';
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`${first.schoolOrClass || ''}  |  ಅಂಕ: ${first.scores?.total || 0}/50`, colX + 10, currentY + 102);
    }

    // 2nd Prize
    if (second) {
      const colX = podiumX + 20 + colWidth;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(colX, currentY + 38, colWidth - 10, 82);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(colX, currentY + 38, colWidth - 10, 82);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
      ctx.fillText('🥈 ದ್ವಿತೀಯ ಬಹುಮಾನ (2nd)', colX + 10, currentY + 58);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`#{${second.chestNo}} ${second.name}`, colX + 10, currentY + 80);

      ctx.fillStyle = '#475569';
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`${second.schoolOrClass || ''}  |  ಅಂಕ: ${second.scores?.total || 0}/50`, colX + 10, currentY + 102);
    }

    // 3rd Prize
    if (third) {
      const colX = podiumX + 20 + colWidth * 2;
      ctx.fillStyle = '#ffedd5';
      ctx.fillRect(colX, currentY + 38, colWidth - 10, 82);
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(colX, currentY + 38, colWidth - 10, 82);

      ctx.fillStyle = '#9a3412';
      ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
      ctx.fillText('🥉 ತೃತೀಯ ಬಹುಮಾನ (3rd)', colX + 10, currentY + 58);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`#{${third.chestNo}} ${third.name}`, colX + 10, currentY + 80);

      ctx.fillStyle = '#475569';
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`${third.schoolOrClass || ''}  |  ಅಂಕ: ${third.scores?.total || 0}/50`, colX + 10, currentY + 102);
    }

    currentY += podiumBoxHeight + 25;
  }

  // 5. Results Table
  const tableX = 60;
  const tableWidth = canvasWidth - 120;
  const rowHeight = 38;

  // Table Column definitions
  const columns = [
    { title: 'ಶ್ರೇಯಾಂಕ', width: 75, align: 'center' },
    { title: 'ಚೆಸ್ಟ್ ನಂ', width: 75, align: 'center' },
    { title: 'ಸ್ಪರ್ಧಿಯ ಹೆಸರು (Name)', width: 220, align: 'left' },
    { title: 'ಶಾಲೆ / ತರಗತಿ', width: 190, align: 'left' },
    { title: 'ವಿಷಯ (10)', width: 80, align: 'center' },
    { title: 'ಭಾಷೆ (10)', width: 80, align: 'center' },
    { title: 'ಹಾವಭಾವ (10)', width: 90, align: 'center' },
    { title: 'ಸಮಯ (10)', width: 80, align: 'center' },
    { title: 'ಪ್ರಭಾವ (10)', width: 80, align: 'center' },
    { title: 'ಒಟ್ಟು (50)', width: 90, align: 'center' }
  ];

  // Draw Table Header
  ctx.fillStyle = '#b45309'; // Amber-700
  ctx.fillRect(tableX, currentY, tableWidth, 42);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';

  let currentColX = tableX;
  columns.forEach((col) => {
    ctx.textAlign = col.align as CanvasTextAlign;
    const textX = col.align === 'center' ? currentColX + col.width / 2 : currentColX + 10;
    ctx.fillText(col.title, textX, currentY + 26);
    currentColX += col.width;
  });

  currentY += 42;

  // Draw Table Rows
  if (scored.length === 0) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(tableX, currentY, tableWidth, 60);
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(tableX, currentY, tableWidth, 60);

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 15px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ಇನ್ನೂ ಯಾವುದೇ ಸ್ಪರ್ಧಿಗೆ ಅಂಕಗಳನ್ನು ನೀಡಿಲ್ಲ / No participants scored yet.', canvasWidth / 2, currentY + 36);
    currentY += 60;
  } else {
    scored.forEach((p, index) => {
      const rank = index + 1;
      const s = p.scores!;
      const isTop3 = rank <= 3;

      // Alternating row background
      ctx.fillStyle = isTop3 ? '#fefce8' : index % 2 === 0 ? '#ffffff' : '#f8fafc';
      ctx.fillRect(tableX, currentY, tableWidth, rowHeight);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(tableX, currentY, tableWidth, rowHeight);

      let xOffset = tableX;

      const cells = [
        { text: rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : `${rank}`, align: 'center', bold: true },
        { text: `#${p.chestNo}`, align: 'center', bold: true, color: '#92400e' },
        { text: p.name, align: 'left', bold: true, color: '#0f172a' },
        { text: p.schoolOrClass || '-', align: 'left', bold: false, color: '#475569' },
        { text: `${s.content}`, align: 'center', bold: false },
        { text: `${s.language}`, align: 'center', bold: false },
        { text: `${s.presentation}`, align: 'center', bold: false },
        { text: `${s.timeManagement}`, align: 'center', bold: false },
        { text: `${s.impact}`, align: 'center', bold: false },
        { text: `${s.total}`, align: 'center', bold: true, color: '#b45309' }
      ];

      cells.forEach((cell, cellIdx) => {
        const col = columns[cellIdx];
        ctx.fillStyle = cell.color || (cell.bold ? '#0f172a' : '#334155');
        ctx.font = `${cell.bold ? 'bold' : 'normal'} 13px "Segoe UI", Arial, sans-serif`;
        ctx.textAlign = col.align as CanvasTextAlign;

        const printX = col.align === 'center' ? xOffset + col.width / 2 : xOffset + 10;
        
        // Truncate if long text
        let displayText = cell.text;
        if (ctx.measureText(displayText).width > col.width - 15) {
          while (displayText.length > 3 && ctx.measureText(displayText + '...').width > col.width - 15) {
            displayText = displayText.slice(0, -1);
          }
          displayText += '...';
        }

        ctx.fillText(displayText, printX, currentY + 24);
        xOffset += col.width;
      });

      currentY += rowHeight;
    });
  }

  currentY += 45;

  // 6. Official Signatures Section
  const sigBoxY = Math.max(currentY, canvasHeight - 200);

  ctx.strokeStyle = '#d6d3d1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, sigBoxY - 20);
  ctx.lineTo(canvasWidth - 60, sigBoxY - 20);
  ctx.stroke();

  const sigColWidth = (canvasWidth - 120) / 5;

  const judgesList = [
    { title: 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರು', sub: '೧. ತೀರ್ಪುಗಾರರು - ೧' },
    { title: 'ಸಹ ತೀರ್ಪುಗಾರರು', sub: '೨. ತೀರ್ಪುಗಾರರು - ೨' },
    { title: 'ಸಹ ತೀರ್ಪುಗಾರರು', sub: '೩. ತೀರ್ಪುಗಾರರು - ೩' },
    { title: 'ಸಹ ತೀರ್ಪುಗಾರರು', sub: '೪. ತೀರ್ಪುಗಾರರು - ೪' },
    { title: 'ಅಧ್ಯಕ್ಷರು / ಸಂಚಾಲಕರು', sub: 'ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್' }
  ];

  judgesList.forEach((j, idx) => {
    const colCenter = 60 + sigColWidth * (idx + 0.5);
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(j.title, colCenter, sigBoxY + 15);

    ctx.strokeStyle = '#78716c';
    ctx.beginPath();
    ctx.moveTo(60 + sigColWidth * idx + 15, sigBoxY + 70);
    ctx.lineTo(60 + sigColWidth * (idx + 1) - 15, sigBoxY + 70);
    ctx.stroke();

    ctx.font = '11px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#78716c';
    ctx.fillText(j.sub, colCenter, sigBoxY + 88);
  });

  // Convert canvas to image and add to jsPDF
  const imgData = canvas.toDataURL('image/png', 1.0);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvasHeight * pdfWidth) / canvasWidth;

  // Add the high-res canvas image to the PDF
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  // Auto-download file
  const dateFormatted = new Date().toISOString().slice(0, 10);
  pdf.save(`Ashubhashana_Final_Results_${dateFormatted}.pdf`);
}
