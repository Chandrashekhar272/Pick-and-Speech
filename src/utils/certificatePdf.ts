import { jsPDF } from 'jspdf';
import { Participant, CertificateSignatory, CertificateTheme, Language } from '../types';
import { DEFAULT_SIGNATORIES } from '../data/defaultSignatories';

export interface CertificateRenderOptions {
  schoolName: string;
  lang?: Language;
  rank?: number; // 1, 2, 3 or undefined/4+
  theme?: CertificateTheme; // override auto-theme if set
  signatories?: CertificateSignatory[];
  eventDate?: string;
  certNumber?: string;
}

// In-memory cache for loaded signature images
const signatureImageCache = new Map<string, HTMLImageElement>();

// Helper to ensure "GHPS Dehalli" or school variations never appear anywhere on the certificate or UI
export function sanitizeCertificateText(input?: string): string {
  if (!input) return '';
  return input
    .replace(/ಸರ್ಕಾರಿ\s+ಹಿರಿಯ\s+ಪ್ರಾಥಮಿಕ\s+ಶಾಲೆ,?\s*ದೇಹಾ?ಳ್ಳಿ\s*(\(GHPS\s*Dehalli\))?/gi, '')
    .replace(/ಸರ್ಕಾರಿ\s+ಹಿರಿಯ\s+ಪ್ರಾಥಮಿಕ\s+ಶಾಲೆ/gi, '')
    .replace(/g\.?\s*h\.?\s*p\.?\s*s\.?\s*dehalli/gi, '')
    .replace(/ghps\s*dehalli/gi, '')
    .replace(/ದೇಹಾ?ಳ್ಳಿ/gi, '')
    .replace(/ಜಿ\.?\s*ಹೆಚ್\.?\s*ಪಿ\.?\s*ಎಸ್\.?/gi, '')
    .replace(/\bghps\b/gi, '')
    .replace(/\bdehalli\b/gi, '')
    .trim()
    .replace(/^[-–—•,\s/]+|[-–—•,\s/]+$/g, '');
}

/**
 * Standard Noto Serif Kannada font stack
 */
export const FONT_SERIF_KANNADA = '"Noto Serif Kannada", "Tunga", "Kedage", Georgia, serif';

/**
 * Converts Western digits 0-9 to authentic Kannada numerals ೦-೯
 */
export function toKannadaDigits(input: string | number): string {
  // User explicitly instructed: "numbers ellavu english nalliye irali" (all numbers must be in English)
  return String(input);
}

/**
 * Preloads both custom signature images and Noto Serif Kannada webfont
 */
export async function preloadSignatoryImages(signatories: CertificateSignatory[]): Promise<void> {
  // 1. Ensure Noto Serif Kannada web font variations are actively decoded and ready
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await Promise.all([
        document.fonts.load(`bold 64px "Noto Serif Kannada"`),
        document.fonts.load(`bold 48px "Noto Serif Kannada"`),
        document.fonts.load(`bold 90px "Noto Serif Kannada"`),
        document.fonts.load(`bold 38px "Noto Serif Kannada"`),
        document.fonts.load(`bold 33px "Noto Serif Kannada"`),
        document.fonts.load(`bold 29px "Noto Serif Kannada"`),
        document.fonts.load(`bold 25px "Noto Serif Kannada"`),
        document.fonts.load(`bold 20px "Noto Serif Kannada"`),
        document.fonts.ready
      ]);
    } catch {
      // Continue even if font loading times out
    }
  }

  // 2. Preload signature images
  const promises = signatories.map(sig => {
    if (!sig.signatureImage) return Promise.resolve();
    if (signatureImageCache.has(sig.signatureImage)) return Promise.resolve();

    return new Promise<void>(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        signatureImageCache.set(sig.signatureImage!, img);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = sig.signatureImage!;
    });
  });

  await Promise.all(promises);
}

/**
 * Determines theme based on rank:
 * 1 -> Gold (Gold & White Elegant)
 * 2 -> Silver (Silver & Sapphire)
 * 3 -> Bronze (Warm Bronze & Amber)
 * 4+ or unranked participant -> Green (Gold & Deep Emerald Green Elegant)
 */
export function getParticipantCertificateTheme(
  participant: Participant, 
  allParticipants: Participant[]
): { theme: CertificateTheme; rank: number | null } {
  const scored = [...allParticipants]
    .filter(p => p.scores !== undefined)
    .sort((a, b) => (b.scores?.total || 0) - (a.scores?.total || 0));

  const rankIndex = scored.findIndex(p => p.id === participant.id);
  
  if (rankIndex === 0) return { theme: 'gold', rank: 1 };
  if (rankIndex === 1) return { theme: 'silver', rank: 2 };
  if (rankIndex === 2) return { theme: 'bronze', rank: 3 };
  
  return { 
    theme: 'green', 
    rank: rankIndex > 2 ? rankIndex + 1 : null 
  };
}

interface ColorPalette {
  bgPrimary: string;
  bgSecondary: string;
  borderPrimary: string;
  borderSecondary: string;
  borderAccent: string;
  cornerFill: string;
  textHeading: string;
  textSubheading: string;
  textName: string;
  textBody: string;
  accentGold: string;
  sealColor: string;
  sealBorder: string;
  sealRibbon: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  ribbonSashBg: string;
  ribbonSashText: string;
  cartoucheBg: string;
  cartoucheBorder: string;
}

function getThemePalette(theme: CertificateTheme): ColorPalette {
  switch (theme) {
    case 'gold': // 1st Place - Gold & White Elegant
      return {
        bgPrimary: '#ffffff',
        bgSecondary: '#fffdf4',
        borderPrimary: '#854d0e', // Amber 800
        borderSecondary: '#b45309', // Amber 700
        borderAccent: '#d97706', // Amber 600
        cornerFill: '#713f12', // Amber 900
        textHeading: '#713f12',
        textSubheading: '#854d0e',
        textName: '#451a03',
        textBody: '#1f2937',
        accentGold: '#d97706',
        sealColor: '#fbbf24',
        sealBorder: '#854d0e',
        sealRibbon: '#b91c1c',
        badgeBg: '#fef3c7',
        badgeBorder: '#b45309',
        badgeText: '#713f12',
        ribbonSashBg: '#b45309',
        ribbonSashText: '#ffffff',
        cartoucheBg: '#fffbeb',
        cartoucheBorder: '#d97706'
      };

    case 'silver': // 2nd Place - Silver & Sapphire
      return {
        bgPrimary: '#ffffff',
        bgSecondary: '#f8fafc',
        borderPrimary: '#1e3a8a', // Blue 900
        borderSecondary: '#334155', // Slate 700
        borderAccent: '#475569', // Slate 600
        cornerFill: '#0f172a', // Slate 900
        textHeading: '#0f172a',
        textSubheading: '#1e3a8a',
        textName: '#0f172a',
        textBody: '#1f2937',
        accentGold: '#2563eb',
        sealColor: '#e2e8f0',
        sealBorder: '#1e3a8a',
        sealRibbon: '#1d4ed8',
        badgeBg: '#e0f2fe',
        badgeBorder: '#0284c7',
        badgeText: '#0369a1',
        ribbonSashBg: '#1e40af',
        ribbonSashText: '#ffffff',
        cartoucheBg: '#f0f9ff',
        cartoucheBorder: '#0284c7'
      };

    case 'bronze': // 3rd Place - Warm Bronze & Terracotta
      return {
        bgPrimary: '#ffffff',
        bgSecondary: '#fffaf5',
        borderPrimary: '#7c2d12', // Orange 900
        borderSecondary: '#9a3412', // Orange 800
        borderAccent: '#ea580c', // Orange 600
        cornerFill: '#7c2d12', // Orange 900
        textHeading: '#7c2d12',
        textSubheading: '#9a3412',
        textName: '#431407',
        textBody: '#1f2937',
        accentGold: '#c2410c',
        sealColor: '#fed7aa',
        sealBorder: '#7c2d12',
        sealRibbon: '#991b1b',
        badgeBg: '#ffedd5',
        badgeBorder: '#c2410c',
        badgeText: '#7c2d12',
        ribbonSashBg: '#9a3412',
        ribbonSashText: '#ffffff',
        cartoucheBg: '#fff7ed',
        cartoucheBorder: '#ea580c'
      };

    case 'green': // Remaining Participants - Deep Emerald Green & Gold (Landscape)
    default:
      return {
        bgPrimary: '#ffffff',
        bgSecondary: '#f0fdf4',
        borderPrimary: '#064e3b', // Emerald 900
        borderSecondary: '#047857', // Emerald 700
        borderAccent: '#d97706', // Gold accent border
        cornerFill: '#064e3b', // Emerald 900
        textHeading: '#064e3b',
        textSubheading: '#065f46',
        textName: '#022c22',
        textBody: '#1f2937',
        accentGold: '#d97706',
        sealColor: '#fef08a',
        sealBorder: '#064e3b',
        sealRibbon: '#047857',
        badgeBg: '#ecfdf5',
        badgeBorder: '#059669',
        badgeText: '#064e3b',
        ribbonSashBg: '#065f46',
        ribbonSashText: '#ffffff',
        cartoucheBg: '#f0fdf4',
        cartoucheBorder: '#059669'
      };
  }
}

/**
 * Intelligent helper to wrap Kannada prose cleanly on word boundaries
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Renders body prose formatted with full justification (Justified text)
 * Leaves clean symmetric margins on left and right sides.
 * Distributes word spacing evenly across each line; centers the final line for royal certificate aesthetic.
 */
function renderJustifiedProse(
  ctx: CanvasRenderingContext2D,
  text: string,
  startX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const spaceWidth = ctx.measureText(' ').width;
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentLineWidth = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordWidth = ctx.measureText(word).width;
    if (currentLine.length === 0) {
      currentLine.push(word);
      currentLineWidth = wordWidth;
    } else {
      const testWidth = currentLineWidth + spaceWidth + wordWidth;
      if (testWidth <= maxWidth) {
        currentLine.push(word);
        currentLineWidth = testWidth;
      } else {
        lines.push(currentLine);
        currentLine = [word];
        currentLineWidth = wordWidth;
      }
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  let y = startY;

  for (let i = 0; i < lines.length; i++) {
    const lineWords = lines[i];
    const isLastLine = i === lines.length - 1;

    if (isLastLine || lineWords.length <= 1) {
      // Center the concluding line gracefully for royal symmetry
      const totalWidth = lineWords.reduce((acc, w, idx) => acc + ctx.measureText(w).width + (idx > 0 ? spaceWidth : 0), 0);
      let curX = startX + Math.max(0, (maxWidth - totalWidth) / 2);
      ctx.textAlign = 'left';
      for (let wIdx = 0; wIdx < lineWords.length; wIdx++) {
        const word = lineWords[wIdx];
        ctx.fillText(word, curX, y);
        curX += ctx.measureText(word).width + spaceWidth;
      }
    } else {
      // Fully justified line: distribute remaining space across all word gaps
      const totalWordsWidth = lineWords.reduce((acc, w) => acc + ctx.measureText(w).width, 0);
      const remainingSpace = maxWidth - totalWordsWidth;
      const gapWidth = remainingSpace / (lineWords.length - 1);

      let curX = startX;
      ctx.textAlign = 'left';
      for (let wIdx = 0; wIdx < lineWords.length; wIdx++) {
        const word = lineWords[wIdx];
        ctx.fillText(word, curX, y);
        curX += ctx.measureText(word).width + gapWidth;
      }
    }

    y += lineHeight;
  }

  return y;
}

/**
 * Draws the high-res certificate on HTML Canvas (A4 Landscape: Width 2400px, Height 1697px)
 * Featuring:
 * - Brand-new Royal Baroque Ornate Corner Frames (No solid triangular blocks)
 * - Ultra-Enlarged Headings (Organization 64px, Committee 33px, Event 48px)
 * - Massive Awardee Name (90px Grand Regal Bold)
 * - Substantially Enlarged All-Text Hierarchy
 * - Expanded Rich Body Text (29px Bold, Line-Height 52px)
 * - Standard Award Ribbon Rosette & Dual Metadata Cartouches
 * - 6 Official Signatures Anchored Solidly at the Bottom
 */
export function renderCertificateToCanvas(
  canvas: HTMLCanvasElement,
  participant: Participant,
  options: CertificateRenderOptions
): void {
  const width = 2400;
  const height = 1697;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const theme = options.theme || 'green';
  const palette = getThemePalette(theme);
  
  // Ensure we have signatories (use defaults if none provided)
  const signatories = (options.signatories && options.signatories.length > 0)
    ? options.signatories
    : DEFAULT_SIGNATORIES;

  // 1. Background fill with soft elegant radial vignette
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 280, width / 2, height / 2, width * 0.72);
  bgGrad.addColorStop(0, palette.bgPrimary);
  bgGrad.addColorStop(1, palette.bgSecondary);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle guilloche security rays
  ctx.save();
  ctx.strokeStyle = theme === 'green' ? 'rgba(5, 150, 105, 0.045)' : 'rgba(217, 119, 6, 0.045)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 72; i++) {
    const angle = (i * Math.PI) / 36;
    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2);
    ctx.lineTo(width / 2 + Math.cos(angle) * width, height / 2 + Math.sin(angle) * width);
    ctx.stroke();
  }
  ctx.restore();

  // Translucent Center Watermark Crest (Embossed Sunburst Emblem in Background)
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.globalAlpha = 0.035;
  ctx.strokeStyle = palette.accentGold;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 360, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 310, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI) / 12;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 310, Math.sin(angle) * 310);
    ctx.lineTo(Math.cos(angle) * 360, Math.sin(angle) * 360);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Ornate Multi-Tier Borders
  const outerMargin = 55;
  ctx.strokeStyle = palette.borderPrimary;
  ctx.lineWidth = 9;
  ctx.strokeRect(outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2);

  const innerMargin = 74;
  ctx.strokeStyle = palette.accentGold;
  ctx.lineWidth = 3.5;
  ctx.strokeRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2);

  const fineMargin = 86;
  ctx.strokeStyle = theme === 'green' ? 'rgba(6, 78, 59, 0.45)' : 'rgba(180, 83, 9, 0.4)';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(fineMargin, fineMargin, width - fineMargin * 2, height - fineMargin * 2);

  // 3. Brand-New Royal Baroque Ornate Corner Frames (Replacing solid triangles!)
  drawRoyalOrnateCornerFrames(ctx, width, height, innerMargin, palette);

  // 4. Standard Corner Award Ribbon Sashes (Top-Left and Top-Right)
  drawTopCornerRibbonSash(ctx, palette, 'left');
  drawTopCornerRibbonSash(ctx, palette, 'right');

  // 5. Official Karnataka Heritage Ribbon Bar (Yellow & Red) at Top Center
  const ribbonWidth = 400;
  const ribbonY = 96;
  ctx.fillStyle = '#eab308'; // Karnataka Yellow
  ctx.fillRect(width / 2 - ribbonWidth / 2, ribbonY, ribbonWidth / 2, 10);
  ctx.fillStyle = '#dc2626'; // Karnataka Red
  ctx.fillRect(width / 2, ribbonY, ribbonWidth / 2, 10);

  // 6. Organization Header Hierarchy (Ultra-Bold & Substantially Enlarged!)
  let currY = 164;

  // Level 1: Organization Name (Kannada) - Grand, Massive & Authoritative (72px Bold!)
  ctx.fillStyle = palette.textHeading;
  ctx.font = `bold 72px ${FONT_SERIF_KANNADA}`;
  ctx.textAlign = 'center';
  ctx.fillText('ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು', width / 2, currY);

  currY += 58;
  // Level 2: Committee & Scheme (Kannada) - Bold & Vivid Crimson (36px Bold!)
  ctx.font = `bold 36px ${FONT_SERIF_KANNADA}`;
  ctx.fillStyle = '#b91c1c'; // Heritage Crimson
  ctx.fillText('ತಾಂತ್ರಿಕ ಶಿಕ್ಷಕರ ಸಮಿತಿಯ ಸುಂದರ್ ಪಿಚೈ ತಂಡದ ವತಿಯಿಂದ • ಸಹಕಾರ ಸಮಿತಿಯ ಹಂತದ ಕಾರ್ಯಕ್ರಮ', width / 2, currY);

  currY += 58;
  // Level 3: Event Title (Kannada) - Large & Prestigious (54px Bold!)
  ctx.font = `bold 54px ${FONT_SERIF_KANNADA}`;
  ctx.fillStyle = palette.textHeading;
  ctx.fillText('ರಾಜ್ಯ ಮಟ್ಟದ ಶಿಕ್ಷಕರ ಆಶುಭಾಷಣ ಸ್ಪರ್ಧೆ - ೨೦೨೬', width / 2, currY);

  currY += 34;
  // Decorative separator with gold diamond jewel
  ctx.strokeStyle = palette.accentGold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 440, currY);
  ctx.lineTo(width / 2 + 440, currY);
  ctx.stroke();
  
  // Center gold diamond jewel on separator
  ctx.save();
  ctx.translate(width / 2, currY);
  ctx.fillStyle = palette.accentGold;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(14, 0);
  ctx.lineTo(0, 14);
  ctx.lineTo(-14, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = palette.borderPrimary;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  currY += 46;

  // 7. Certificate Category Banner / Ribbon Plaque (Enlarged 40px Bold!)
  const badgeW = 1080;
  const badgeH = 82;
  const badgeX = width / 2 - badgeW / 2;
  
  ctx.fillStyle = palette.badgeBg;
  ctx.beginPath();
  ctx.roundRect(badgeX, currY, badgeW, badgeH, 41);
  ctx.fill();

  ctx.strokeStyle = palette.badgeBorder;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Certificate Type Text (Strictly Kannada, Bold 40px!)
  ctx.fillStyle = palette.badgeText;
  ctx.font = `bold 40px ${FONT_SERIF_KANNADA}`;

  let badgeSubtitle = '🎖️ ಅಧಿಕೃತ ಸಕ್ರಿಯ ಸಹಭಾಗಿತ್ವ ಗೌರವ ಪ್ರಮಾಣಪತ್ರ';

  if (theme === 'gold' || options.rank === 1) {
    badgeSubtitle = '🥇 ಪ್ರಥಮ ಬಹುಮಾನ - ಸರ್ವೋಚ್ಚ ಶ್ರೇಷ್ಠತಾ ಗೌರವ ಪ್ರಶಸ್ತಿ';
  } else if (theme === 'silver' || options.rank === 2) {
    badgeSubtitle = '🥈 ದ್ವಿತೀಯ ಬಹುಮಾನ - ವಿಶಿಷ್ಟ ಪ್ರತಿಭಾ ಗೌರವ ಪುರಸ್ಕಾರ';
  } else if (theme === 'bronze' || options.rank === 3) {
    badgeSubtitle = '🥉 ತೃತೀಯ ಬಹುಮಾನ - ಗೌರವಾನ್ವಿತ ಸಾಧನಾ ಪುರಸ್ಕಾರ';
  }

  ctx.fillText(badgeSubtitle, width / 2, currY + 54);

  currY += badgeH + 50;

  // 8. Presentation Subtitle (Enlarged Bold 34px!)
  ctx.fillStyle = '#374151';
  ctx.font = `bold 34px ${FONT_SERIF_KANNADA}`;
  ctx.fillText('ಈ ಗೌರವಯುತ ಅಭಿನಂದನಾ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಅತ್ಯಂತ ಹೆಮ್ಮೆಯಿಂದ ಪ್ರದಾನ ಮಾಡಲಾಗಿದೆ', width / 2, currY);

  currY += 86;

  // 9. Participant Awardee Recipient Name (Grand, Majestic, Ultra-Prominent 94px Bold!)
  ctx.fillStyle = palette.textName;
  ctx.font = `bold 94px ${FONT_SERIF_KANNADA}`;
  ctx.fillText(participant.name, width / 2, currY);

  // Ornamental underline below awardee name
  const nameWidth = ctx.measureText(participant.name).width;
  const nameUnderlineW = Math.min(1250, Math.max(680, nameWidth + 200));
  ctx.strokeStyle = palette.accentGold;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width / 2 - nameUnderlineW / 2, currY + 22);
  ctx.lineTo(width / 2 + nameUnderlineW / 2, currY + 22);
  ctx.stroke();

  // Center star jewel on underline
  ctx.fillStyle = palette.accentGold;
  ctx.beginPath();
  ctx.arc(width / 2, currY + 22, 8.5, 0, Math.PI * 2);
  ctx.fill();

  currY += 82;

  // 10. Institution / School & Chest No (Kannada Only, Enlarged Bold 35px!)
  ctx.fillStyle = palette.textSubheading;
  ctx.font = `bold 35px ${FONT_SERIF_KANNADA}`;
  const cleanSchool = sanitizeCertificateText(participant.schoolOrClass);
  const cleanOptSchool = sanitizeCertificateText(options.schoolName);
  const schoolLabel = cleanSchool 
    ? `ಸಂಸ್ಥೆ / ಸ್ಥಳ: ${cleanSchool}` 
    : cleanOptSchool 
      ? `ಸ್ಥಳ: ${cleanOptSchool}` 
      : `ವಿಭಾಗ: ರಾಜ್ಯ ಮಟ್ಟದ ಶಿಕ್ಷಕರ ವಿಭಾಗ, ಮೈಸೂರು`;
  const chestLabel = `ಚೆಸ್ಟ್ ಸಂಖ್ಯೆ: #${toKannadaDigits(participant.chestNo)}`;
  ctx.fillText(`${schoolLabel}   •   ${chestLabel}`, width / 2, currY);

  currY += 52;

  // 11. Topic if assigned (Enlarged Bold 32px!)
  if (participant.assignedTopic) {
    ctx.fillStyle = palette.textHeading;
    ctx.font = `bold 32px ${FONT_SERIF_KANNADA}`;
    ctx.fillText(`ಸ್ಪರ್ಧಾ ವಿಷಯ: #${toKannadaDigits(participant.assignedTopic.number)} - "${participant.assignedTopic.titleKn}"`, width / 2, currY);
    currY += 56;
  } else {
    currY += 28;
  }

  // 12. Rich, Expanded Justified Body Prose - Impeccable Kannada sentence structure without unwanted school insertions
  ctx.fillStyle = palette.textBody;
  ctx.font = `bold 29px ${FONT_SERIF_KANNADA}`;
  
  const rawDateStr = options.eventDate || new Date().toLocaleDateString('kn-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const dateStr = toKannadaDigits(rawDateStr);

  let richBodyText = '';

  if (options.rank === 1 || theme === 'gold') {
    richBodyText = `ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು ಮತ್ತು ತಾಂತ್ರಿಕ ಶಿಕ್ಷಕರ ಸಮಿತಿಯ ಸುಂದರ್ ಪಿಚೈ ತಂಡದ ವತಿಯಿಂದ ದಿನಾಂಕ ${dateStr} ರಂದು ಯಶಸ್ವಿಯಾಗಿ ಆಯೋಜಿಸಲಾದ ರಾಜ್ಯ ಮಟ್ಟದ ಶಿಕ್ಷಕರ ಆಶುಭಾಷಣ ಸ್ಪರ್ಧಾ ಮಹೋತ್ಸವದಲ್ಲಿ ಅತ್ಯುತ್ಸಾಹದಿಂದ ಭಾಗವಹಿಸಿ, ಸಮಕಾಲೀನ ಶೈಕ್ಷಣಿಕ ಚಿಂತನೆ, ಅದ್ವಿತೀಯ ವಾಕ್ಚಾತುರ್ಯ, ಗಂಭೀರ ಭಾಷಾ ಪ್ರೌಢಿಮೆ ಹಾಗೂ ಸಮಯೋಚಿತ ವಿಚಾರ ಮಂಡನೆಯೊಂದಿಗೆ ಅತ್ಯುನ್ನತ ಮಟ್ಟದ ವಿದ್ವತ್ಪೂರ್ಣ ಪಾಂಡಿತ್ಯವನ್ನು ಪ್ರದರ್ಶಿಸಿ, ಇಡೀ ರಾಜ್ಯಕ್ಕೆ ಮಾದರಿಯಾಗಿ "ಪ್ರಥಮ ಬಹುಮಾನ" ಪಡೆದು ಅನುಪಮ ಸಾಧನೆಗೈದಿದ್ದಕ್ಕಾಗಿ ಈ ಅಭಿನಂದನಾ ಗೌರವ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಅತ್ಯಂತ ಹೆಮ್ಮೆಯಿಂದ ಪ್ರದಾನ ಮಾಡಲಾಗಿದೆ. ನಾಡಿನ ಶಿಕ್ಷಕ ಸಮಾಜಕ್ಕೆ ಇವರ ಜ್ಞಾನದೀವಿಗೆ ಹಾಗೂ ಭಾಷಿಕ ಪ್ರೌಢಿಮೆ ನಿರಂತರ ಪ್ರೇರಣೆಯಾಗಲೆಂದು ಹೃತ್ಪೂರ್ವಕವಾಗಿ ಹಾರೈಸುತ್ತೇವೆ.`;
  } else if (options.rank === 2 || theme === 'silver') {
    richBodyText = `ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು ಮತ್ತು ತಾಂತ್ರಿಕ ಶಿಕ್ಷಕರ ಸಮಿತಿಯ ಸುಂದರ್ ಪಿಚೈ ತಂಡದ ವತಿಯಿಂದ ದಿನಾಂಕ ${dateStr} ರಂದು ಯಶಸ್ವಿಯಾಗಿ ಆಯೋಜಿಸಲಾದ ರಾಜ್ಯ ಮಟ್ಟದ ಶಿಕ್ಷಕರ ಆಶುಭಾಷಣ ಸ್ಪರ್ಧಾ ಮಹೋತ್ಸವದಲ್ಲಿ ಅತ್ಯುತ್ಸಾಹದಿಂದ ಭಾಗವಹಿಸಿ, ಆಳವಾದ ವಿಷಯ ಜ್ಞಾನ, ಅತ್ಯುತ್ತಮ ಭಾಷಾ ಶುದ್ಧತೆ, ಸಮಯ ಪ್ರಜ್ಞೆ ಮತ್ತು ಘನತೆಯುಕ್ತ ವೇದಿಕೆ ಮಂಡನೆಯೊಂದಿಗೆ ಗಣನೀಯ ಪ್ರಭಾವ ಬೀರಿ, ವಿಶಿಷ್ಟ ಪ್ರತಿಭೆ ಪ್ರದರ್ಶಿಸಿ "ದ್ವಿತೀಯ ಬಹುಮಾನ" ಗಳಿಸಿ ಶ್ರೇಷ್ಠ ಸಾಧನೆ ಮೆರೆದಿದ್ದಕ್ಕಾಗಿ ಈ ಶ್ರೇಷ್ಠತಾ ಗೌರವ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಅತ್ಯಂತ ಗೌರವಪೂರ್ವಕವಾಗಿ ಪ್ರದಾನ ಮಾಡಲಾಗಿದೆ. ಇವರ ಶೈಕ್ಷಣಿಕ ಹಾಗೂ ಭಾಷಿಕ ಪಯಣ ಸದಾ ಯಶಸ್ವಿಯಾಗಿ ಮುನ್ನಡೆಯಲೆಂದು ಹಾರೈಸುತ್ತೇವೆ.`;
  } else if (options.rank === 3 || theme === 'bronze') {
    richBodyText = `ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು ಮತ್ತು ತಾಂತ್ರಿಕ ಶಿಕ್ಷಕರ ಸಮಿತಿಯ ಸುಂದರ್ ಪಿಚೈ ತಂಡದ ವತಿಯಿಂದ ದಿನಾಂಕ ${dateStr} ರಂದು ಯಶಸ್ವಿಯಾಗಿ ಆಯೋಜಿಸಲಾದ ರಾಜ್ಯ ಮಟ್ಟದ ಶಿಕ್ಷಕರ ಆಶುಭಾಷಣ ಸ್ಪರ್ಧಾ ಮಹೋತ್ಸವದಲ್ಲಿ ಅತ್ಯುತ್ಸಾಹದಿಂದ ಭಾಗವಹಿಸಿ, ಉತ್ಸಾಹಪೂರ್ಣ ವಾಕ್ಶೈಲಿ, ತಾರ್ಕಿಕ ಸ್ಪಷ್ಟತೆ, ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಪ್ರಬುದ್ಧ ಅಭಿವ್ಯಕ್ತಿಯೊಂದಿಗೆ ಶ್ರೋತೃಗಳ ಮನಗೆದ್ದು, ಪ್ರಶಂಸನೀಯ ಪ್ರತಿಭೆ ತೋರಿ "ತೃತೀಯ ಬಹುಮಾನ" ಮುಡಿಗೇರಿಸಿಕೊಂಡು ಅಪೂರ್ವ ಸಾಧನೆಗೈದಿದ್ದಕ್ಕಾಗಿ ಈ ಗೌರವ ಪುರಸ್ಕಾರ ಪ್ರಮಾಣಪತ್ರವನ್ನು ನೀಡಿ ಹೃತ್ಪೂರ್ವಕವಾಗಿ ಸನ್ಮಾನಿಸಲಾಗಿದೆ. ಇವರ ಭವಿಷ್ಯದ ಸಮಸ್ತ ಶೈಕ್ಷಣಿಕ ಸಾಧನೆಗಳಿಗೆ ಶುಭ ಹಾರೈಕೆಗಳು.`;
  } else {
    richBodyText = `ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು ಮತ್ತು ತಾಂತ್ರಿಕ ಶಿಕ್ಷಕರ ಸಮಿತಿಯ ಸುಂದರ್ ಪಿಚೈ ತಂಡದ ವತಿಯಿಂದ ದಿನಾಂಕ ${dateStr} ರಂದು ಯಶಸ್ವಿಯಾಗಿ ಆಯೋಜಿಸಲಾದ ರಾಜ್ಯ ಮಟ್ಟದ ಶಿಕ್ಷಕರ ಆಶುಭಾಷಣ ಸ್ಪರ್ಧೆಯಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿ ಪಾಲ್ಗೊಂಡು, ಉತ್ಕೃಷ್ಟ ಶೈಕ್ಷಣಿಕ ಚಿಂತನೆ, ಸುಲಲಿತ ಮಾತುಗಾರಿಕೆ ಹಾಗೂ ಪ್ರಬುದ್ಧ ಭಾಷಾ ಕಾಳಜಿಯೊಂದಿಗೆ ತಮ್ಮ ಅಪೂರ್ವ ವಾಕ್ಪ್ರತಿಭೆಯನ್ನು ಪ್ರದರ್ಶಿಸಿದ್ದಕ್ಕಾಗಿ ಈ ಅಧಿಕೃತ ಸಕ್ರಿಯ ಸಹಭಾಗಿತ್ವ ಗೌರವ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಪ್ರೀತಿಪೂರ್ವಕವಾಗಿ ಪ್ರದಾನ ಮಾಡಲಾಗಿದೆ. ಶಿಕ್ಷಕ ವೃತ್ತಿಯ ಇವರ ಬೋಧನಾ ಕೌಶಲ ಹಾಗೂ ಜ್ಞಾನದೀವಿಗೆ ಸದಾ ಬೆಳಗಲಿ ಎಂದು ಹಾರೈಸುತ್ತೇವೆ.`;
  }

  // Draw Justified Body Prose leaving clean symmetric space on left and right borders
  const sideMargin = 230; // Clean margin leaving ample breathing room on left & right
  const proseWidth = width - sideMargin * 2; // 1940px wide justified block
  const proseLineHeight = 52;
  currY = renderJustifiedProse(ctx, richBodyText, sideMargin, currY, proseWidth, proseLineHeight);

  // 13. Middle Section: Standard Ribbon Rosette Centerpiece ONLY
  // (Left and right text boxes completely removed as requested: "ribbon left and right text box irodannu remove madu alli yavudu beda")
  const middleY = currY + 86;
  drawStandardAwardRibbonRosette(ctx, width / 2, middleY, theme, options.rank || null, palette);

  // 14. Exactly 6 Signatories Positioned Firmly at the BOTTOM ("6 sign and names ellavu bottom nalli irali")
  // Signature baseline anchored at Y = 1455px, with names at Y = 1492px (Bold 25px), and designations at Y = 1526px/1554px (Bold 20px).
  // NO divider above signatures! (requested by user)
  const bottomSignaturesY = 1455;
  drawSixSignatoriesSection(ctx, width, bottomSignaturesY, signatories, palette);

  // Subtle clean official certificate tracking footer near bottom margin (no bulky box)
  const rawCertId = options.certNumber || `KSPP-MY-2026-CH${String(participant.chestNo).padStart(3, '0')}`;
  const certId = toKannadaDigits(rawCertId);
  ctx.save();
  ctx.font = `bold 18px ${FONT_SERIF_KANNADA}`;
  ctx.fillStyle = 'rgba(75, 85, 99, 0.75)';
  ctx.textAlign = 'center';
  ctx.fillText(`ಅಧಿಕೃತ ಇ-ಪ್ರಮಾಣಪತ್ರ ಸಂ.: ${certId}   •   ದಿನಾಂಕ: ${dateStr}   •   ಪರಿಷತ್ ಮಾನ್ಯತೆ: ಅಧಿಕೃತ ರಾಜ್ಯ ದರ್ಜೆ`, width / 2, 1600);
  ctx.restore();
}

/**
 * Draws brand-new Royal Baroque Ornate Corner Frames (No solid triangular blocks!)
 * Intricate multi-tier stepped brackets, gold scrollwork curves, and regal corner medallions.
 */
function drawRoyalOrnateCornerFrames(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  margin: number,
  palette: ColorPalette
) {
  const cornerLength = 220;
  const corners: Array<{ x: number; y: number; angle: number }> = [
    { x: margin, y: margin, angle: 0 }, // Top-Left
    { x: width - margin, y: margin, angle: Math.PI / 2 }, // Top-Right
    { x: width - margin, y: height - margin, angle: Math.PI }, // Bottom-Right
    { x: margin, y: height - margin, angle: -Math.PI / 2 } // Bottom-Left
  ];

  corners.forEach(({ x, y, angle }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // 1. Primary L-bracket strap along borders
    ctx.strokeStyle = palette.borderPrimary;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cornerLength, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, cornerLength);
    ctx.stroke();

    // 2. Parallel gold accent strap
    ctx.strokeStyle = palette.accentGold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cornerLength - 10, 10);
    ctx.lineTo(10, 10);
    ctx.lineTo(10, cornerLength - 10);
    ctx.stroke();

    // 3. Third fine inner ornamental gold line
    ctx.strokeStyle = palette.borderAccent;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cornerLength - 25, 20);
    ctx.lineTo(20, 20);
    ctx.lineTo(20, cornerLength - 25);
    ctx.stroke();

    // 4. Intricate royal Baroque scrollwork in the corner elbow
    ctx.strokeStyle = palette.accentGold;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    // Inner concentric filigree loops
    ctx.moveTo(48, 10);
    ctx.bezierCurveTo(48, 48, 10, 48, 10, 48);
    ctx.moveTo(85, 10);
    ctx.bezierCurveTo(85, 85, 10, 85, 10, 85);
    ctx.moveTo(125, 10);
    ctx.bezierCurveTo(125, 125, 10, 125, 10, 125);
    ctx.stroke();

    // 5. Acanthus leaf / fleur-de-lis rosette medallion
    ctx.fillStyle = palette.cornerFill;
    ctx.beginPath();
    ctx.arc(55, 55, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.accentGold;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner gold core
    ctx.fillStyle = palette.accentGold;
    ctx.beginPath();
    ctx.arc(55, 55, 8, 0, Math.PI * 2);
    ctx.fill();

    // Cross star points on rosette
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(55, 43);
    ctx.lineTo(55, 67);
    ctx.moveTo(43, 55);
    ctx.lineTo(67, 55);
    ctx.stroke();

    // 6. Stepped terminal gold jewel finials at arm ends
    ctx.fillStyle = palette.accentGold;
    ctx.fillRect(cornerLength - 6, -6, 12, 12);
    ctx.fillRect(-6, cornerLength - 6, 12, 12);

    ctx.strokeStyle = palette.borderPrimary;
    ctx.lineWidth = 2;
    ctx.strokeRect(cornerLength - 6, -6, 12, 12);
    ctx.strokeRect(-6, cornerLength - 6, 12, 12);

    // 7. Corner apex pearl jewel
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.accentGold;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  });
}

/**
 * Draws a prestigious parchment metadata cartouche box with gold border and enlarged Kannada text
 */
function drawMetadataCartouche(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  lines: string[],
  palette: ColorPalette
) {
  const boxW = 580;
  const boxH = 104;

  ctx.save();
  ctx.translate(cx, cy);

  // Background rounded plaque
  ctx.fillStyle = palette.cartoucheBg;
  ctx.beginPath();
  ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 20);
  ctx.fill();

  // Double gold frame
  ctx.strokeStyle = palette.cartoucheBorder;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-boxW / 2 + 6, -boxH / 2 + 6, boxW - 12, boxH - 12);

  // Inscriptions (Enlarged Bold 25px / 23px!)
  ctx.fillStyle = palette.textHeading;
  ctx.textAlign = 'center';
  ctx.font = `bold 25px ${FONT_SERIF_KANNADA}`;
  ctx.fillText(lines[0], 0, -9);

  ctx.font = `bold 23px ${FONT_SERIF_KANNADA}`;
  ctx.fillStyle = '#374151';
  ctx.fillText(lines[1], 0, 26);

  ctx.restore();
}

/**
 * Draws an official Standard Ribbon Rosette with draped satin fishtail ribbons,
 * multi-layered pleated ruffles, metallic starburst, and Kannada gold emblem.
 */
function drawStandardAwardRibbonRosette(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  theme: CertificateTheme,
  rank: number | null,
  palette: ColorPalette
) {
  ctx.save();
  ctx.translate(cx, cy);

  // 1. Two Standard Satin Ribbon Tails Draping Down with Swallowtail (Fishtail) V-cut
  const tailWidth = 38;
  const tailLength = 118;
  
  // Left Ribbon Tail
  ctx.save();
  ctx.translate(-22, 26);
  ctx.rotate(-0.18);
  ctx.fillStyle = palette.sealRibbon;
  ctx.beginPath();
  ctx.moveTo(-tailWidth / 2, 0);
  ctx.lineTo(tailWidth / 2, 0);
  ctx.lineTo(tailWidth / 2 + 6, tailLength);
  ctx.lineTo(0, tailLength - 24); // inverted V notch
  ctx.lineTo(-tailWidth / 2 - 6, tailLength);
  ctx.closePath();
  ctx.fill();

  // Satin gold trim on ribbon edge
  ctx.strokeStyle = palette.accentGold;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // Satin ribbon inner highlight sheen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
  ctx.fillRect(-tailWidth / 4, 2, tailWidth / 2, tailLength - 26);
  ctx.restore();

  // Right Ribbon Tail
  ctx.save();
  ctx.translate(22, 26);
  ctx.rotate(0.18);
  ctx.fillStyle = palette.sealRibbon;
  ctx.beginPath();
  ctx.moveTo(-tailWidth / 2, 0);
  ctx.lineTo(tailWidth / 2, 0);
  ctx.lineTo(tailWidth / 2 + 6, tailLength);
  ctx.lineTo(0, tailLength - 24); // inverted V notch
  ctx.lineTo(-tailWidth / 2 - 6, tailLength);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = palette.accentGold;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
  ctx.fillRect(-tailWidth / 4, 2, tailWidth / 2, tailLength - 26);
  ctx.restore();

  // 2. Multi-tier Rosette Pleated Petals (36 points)
  const numPoints = 36;
  const outerR = 76;
  const innerR = 66;
  
  // Shadow for standard 3D medal effect
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;

  ctx.fillStyle = palette.sealBorder;
  ctx.beginPath();
  for (let i = 0; i < numPoints * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI) / numPoints;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Reset shadow for inner crisp details
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Rosette Gold Stitched Edge
  ctx.strokeStyle = palette.accentGold;
  ctx.lineWidth = 3.2;
  ctx.stroke();

  // 3. Middle Concentric Ring with Beaded Pearls
  ctx.fillStyle = palette.accentGold;
  ctx.beginPath();
  ctx.arc(0, 0, 61, 0, Math.PI * 2);
  ctx.fill();

  const numBeads = 28;
  for (let i = 0; i < numBeads; i++) {
    const angle = (i * Math.PI * 2) / numBeads;
    const bx = Math.cos(angle) * 58;
    const by = Math.sin(angle) * 58;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Inner Medallion (Metallic gradient core)
  const grad = ctx.createLinearGradient(-50, -50, 50, 50);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, palette.sealColor);
  grad.addColorStop(0.75, palette.accentGold);
  grad.addColorStop(1, '#78350f');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 53, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = palette.sealBorder;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  // 5. Medallion Emblem Text (100% Kannada, Noto Serif Kannada)
  ctx.fillStyle = palette.cornerFill;
  ctx.textAlign = 'center';
  ctx.font = `bold 12px ${FONT_SERIF_KANNADA}`;
  ctx.fillText('ಅಧಿಕೃತ ಮುದ್ರೆ', 0, -26);

  if (rank === 1 || theme === 'gold') {
    ctx.font = `bold 17px ${FONT_SERIF_KANNADA}`;
    ctx.fillText('ಪ್ರಥಮ ಸ್ಥಾನ', 0, -3);
    ctx.font = `bold 13px ${FONT_SERIF_KANNADA}`;
    ctx.fillText('★ 2026 ★', 0, 17);
    ctx.font = `bold 11px ${FONT_SERIF_KANNADA}`;
    ctx.fillText('ಸರ್ವೋಚ್ಚ ಶ್ರೇಷ್ಠತೆ', 0, 33);
  } else if (rank === 2 || theme === 'silver') {
    ctx.font = `bold 16px ${FONT_SERIF_KANNADA}`;
    ctx.fillText('ದ್ವಿತೀಯ ಸ್ಥಾನ', 0, -3);
    ctx.font = `bold 13px ${FONT_SERIF_KANNADA}`;
    ctx.fillText('★ 2026 ★', 0, 17);
    ctx.font = `bold 11px ${FONT_SERIF_KANNADA}`;
    ctx.fillText('ವಿಶಿಷ್ಟ ಸಾಧನೆ', 0, 33);
  } else if (rank === 3 || theme === 'bronze') {
    ctx.font = `bold 16px ${FONT_SERIF_KANNADA}`;
    ctx.fillText('ತೃತೀಯ ಸ್ಥಾನ', 0, -3);
    ctx.font = `bold 13px ${FONT_SERIF_KANNADA}`;
    ctx.fillText('★ 2026 ★', 0, 17);
    ctx.font = `bold 11px ${FONT_SERIF_KANNADA}`;
    ctx.fillText('ಪ್ರತಿಭಾ ಗೌರವ', 0, 33);
  } else {
    ctx.font = `bold 15px ${FONT_SERIF_KANNADA}`;
    ctx.fillText('ಸಹಭಾಗಿತ್ವ', 0, -3);
    ctx.font = `bold 13px ${FONT_SERIF_KANNADA}`;
    ctx.fillText('★ 2026 ★', 0, 17);
    ctx.font = `bold 11px ${FONT_SERIF_KANNADA}`;
    ctx.fillText('ಪರಿಷತ್ ಗೌರವ', 0, 33);
  }

  ctx.restore();
}

/**
 * Draws standard prestigious corner ribbon sashes (Top-Left and Top-Right)
 */
function drawTopCornerRibbonSash(
  ctx: CanvasRenderingContext2D,
  palette: ColorPalette,
  side: 'left' | 'right'
) {
  ctx.save();
  
  if (side === 'left') {
    ctx.translate(125, 125);
    ctx.rotate(-Math.PI / 4);
  } else {
    ctx.translate(2400 - 125, 125);
    ctx.rotate(Math.PI / 4);
  }

  const sashWidth = 280;
  const sashHeight = 38;

  ctx.fillStyle = palette.ribbonSashBg;
  ctx.fillRect(-sashWidth / 2, -sashHeight / 2, sashWidth, sashHeight);

  // Gold stitched borders
  ctx.strokeStyle = palette.accentGold;
  ctx.lineWidth = 2.4;
  ctx.strokeRect(-sashWidth / 2, -sashHeight / 2, sashWidth, sashHeight);

  // Sash Inscription
  ctx.fillStyle = palette.ribbonSashText;
  ctx.textAlign = 'center';
  ctx.font = `bold 15px ${FONT_SERIF_KANNADA}`;
  ctx.fillText(side === 'left' ? 'ರಾಜ್ಯ ಮಟ್ಟದ ಶ್ರೇಷ್ಠತೆ • 2026' : 'ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್', 0, 6);

  ctx.restore();
}

/**
 * Draws exactly 6 signatories positioned across the entire landscape width (Left to Right)
 * Firmly anchored at the bottom of the certificate canvas!
 * 1. Shree Narashimhamurthy (ತಂಡದ ನಾಯಕರು)
 * 2. Shrimati Roshan Begam (ಮುಖ್ಯಸ್ಥರು)
 * 3. Shree Karibasappa N M (ಮಾರ್ಗದರ್ಶಕರು)
 * 4. Umadevi Guddad (ಸಹಕಾರ ಸಮಿತಿ ಮುಖ್ಯಸ್ಥರು)
 * 5. Shree Chandrashekhar Nayak (ರಾಜ್ಯ ತಾಂತ್ರಿಕ ವಿಭಾಗದ ಮುಖ್ಯಸ್ಥರು)
 * 6. P Mahesh (ಸಂಸ್ಥಾಪಕ ರಾಜ್ಯಾಧ್ಯಕ್ಷರು)
 * 
 * Rules:
 * - Anchored at the BOTTOM
 * - NO divider above signatures (requested by user)
 * - 100% Kannada (no English names, no English designations)
 * - Noto Serif Kannada font
 * - Enlarged bold names (25px) and designations (20px)
 */
function drawSixSignatoriesSection(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  lineY: number,
  signatories: CertificateSignatory[],
  palette: ColorPalette
) {
  const startX = 85;
  const totalW = canvasWidth - startX * 2;
  const numSigs = Math.max(1, signatories.length);
  const colW = totalW / numSigs;

  signatories.forEach((sig, index) => {
    const colCenter = startX + colW * (index + 0.5);

    // 1. Signature Graphic / Artwork
    let hasCustomImage = false;
    if (sig.signatureImage && signatureImageCache.has(sig.signatureImage)) {
      const img = signatureImageCache.get(sig.signatureImage);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        const maxW = 215;
        const maxH = 85;
        const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, colCenter - w / 2, lineY - h - 10, w, h);
        ctx.restore();
        hasCustomImage = true;
      }
    }

    // Fallback: draw distinct authentic procedural cursive handwriting
    if (!hasCustomImage) {
      drawProceduralSignature(ctx, colCenter, lineY - 14, index);
    }

    // 2. Signature baseline (under signature, not above!)
    ctx.strokeStyle = palette.accentGold;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(colCenter - 120, lineY);
    ctx.lineTo(colCenter + 120, lineY);
    ctx.stroke();

    // 3. Name (100% Kannada ONLY, Noto Serif Kannada, Enlarged Bold 25px!)
    ctx.fillStyle = palette.textHeading;
    ctx.font = `bold 25px ${FONT_SERIF_KANNADA}`;
    ctx.textAlign = 'center';
    ctx.fillText(sig.nameKn, colCenter, lineY + 36);

    // 4. Designation (100% Kannada ONLY, Noto Serif Kannada, Enlarged Bold 20px!)
    ctx.font = `bold 20px ${FONT_SERIF_KANNADA}`;
    ctx.fillStyle = '#b45309'; // Rich Amber/Gold
    
    const desKn = sig.designationKn || sig.roleKn;
    if (desKn.length > 20) {
      // Split into 2 lines if long
      const mid = desKn.lastIndexOf(' ', 20);
      const splitAt = mid !== -1 ? mid : 20;
      const l1 = desKn.slice(0, splitAt).trim();
      const l2 = desKn.slice(splitAt).trim();
      ctx.fillText(l1, colCenter, lineY + 66);
      ctx.fillText(l2, colCenter, lineY + 94);
    } else {
      ctx.fillText(desKn, colCenter, lineY + 70);
    }
  });
}

/**
 * Draws distinct authentic procedural handwritten cursive signature curves for each official
 */
function drawProceduralSignature(ctx: CanvasRenderingContext2D, cx: number, cy: number, index: number) {
  ctx.save();
  ctx.strokeStyle = '#1e3a8a'; // Deep official ink blue
  ctx.lineWidth = 2.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();

  if (index === 0) {
    // 1. Shree Narashimhamurthy (ತಂಡದ ನಾಯಕರು)
    ctx.moveTo(cx - 62, cy - 24);
    ctx.bezierCurveTo(cx - 40, cy - 58, cx - 18, cy - 5, cx, cy - 34);
    ctx.bezierCurveTo(cx + 20, cy - 50, cx + 38, cy - 10, cx + 58, cy - 30);
    ctx.moveTo(cx - 52, cy - 8);
    ctx.quadraticCurveTo(cx, cy - 4, cx + 64, cy - 10);
  } else if (index === 1) {
    // 2. Shrimati Roshan Begam (ಮುಖ್ಯಸ್ಥರು)
    ctx.moveTo(cx - 58, cy - 30);
    ctx.bezierCurveTo(cx - 40, cy - 54, cx - 30, cy - 10, cx - 10, cy - 34);
    ctx.bezierCurveTo(cx + 8, cy - 55, cx + 30, cy - 18, cx + 54, cy - 32);
    ctx.moveTo(cx - 48, cy - 8);
    ctx.quadraticCurveTo(cx + 8, cy - 4, cx + 58, cy - 8);
  } else if (index === 2) {
    // 3. Shree Karibasappa N M (ಮಾರ್ಗದರ್ಶಕರು)
    ctx.moveTo(cx - 58, cy - 18);
    ctx.lineTo(cx - 42, cy - 48);
    ctx.lineTo(cx - 28, cy - 16);
    ctx.bezierCurveTo(cx - 6, cy - 46, cx + 18, cy - 30, cx + 34, cy - 40);
    ctx.bezierCurveTo(cx + 46, cy - 12, cx + 55, cy - 40, cx + 60, cy - 18);
    ctx.moveTo(cx - 42, cy - 6);
    ctx.lineTo(cx + 54, cy - 6);
  } else if (index === 3) {
    // 4. Umadevi Guddad (ಸಹಕಾರ ಸಮಿತಿ ಮುಖ್ಯಸ್ಥರು)
    ctx.moveTo(cx - 54, cy - 26);
    ctx.bezierCurveTo(cx - 34, cy - 50, cx - 22, cy - 8, cx, cy - 30);
    ctx.bezierCurveTo(cx + 16, cy - 48, cx + 34, cy - 16, cx + 55, cy - 28);
    ctx.moveTo(cx - 44, cy - 6);
    ctx.quadraticCurveTo(cx, cy - 2, cx + 52, cy - 6);
  } else if (index === 4) {
    // 5. Shree Chandrashekhar Nayak (ರಾಜ್ಯ ತಾಂತ್ರಿಕ ವಿಭಾಗದ ಮುಖ್ಯಸ್ಥರು)
    ctx.moveTo(cx - 62, cy - 32);
    ctx.bezierCurveTo(cx - 46, cy - 58, cx - 24, cy - 18, cx - 6, cy - 40);
    ctx.lineTo(cx + 18, cy - 18);
    ctx.bezierCurveTo(cx + 30, cy - 50, cx + 46, cy - 24, cx + 64, cy - 38);
    ctx.moveTo(cx - 54, cy - 8);
    ctx.lineTo(cx + 62, cy - 8);
  } else {
    // 6. P Mahesh (ಸಂಸ್ಥಾಪಕ ರಾಜ್ಯಾಧ್ಯಕ್ಷರು)
    ctx.moveTo(cx - 58, cy - 22);
    ctx.bezierCurveTo(cx - 40, cy - 55, cx - 24, cy - 8, cx - 6, cy - 38);
    ctx.bezierCurveTo(cx + 14, cy - 52, cx + 36, cy - 16, cx + 58, cy - 30);
    ctx.moveTo(cx - 52, cy - 6);
    ctx.quadraticCurveTo(cx + 8, cy - 2, cx + 64, cy - 6);
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * Downloads a single participant's certificate as high-DPI Landscape A4 PDF
 */
export async function downloadCertificatePDF(
  participant: Participant,
  allParticipants: Participant[],
  options: {
    schoolName: string;
    lang?: Language;
    signatories?: CertificateSignatory[];
    eventDate?: string;
  }
): Promise<void> {
  const { theme, rank } = getParticipantCertificateTheme(participant, allParticipants);
  const activeSigs = options.signatories || DEFAULT_SIGNATORIES;

  // Preload any custom uploaded signature images and font first
  await preloadSignatoryImages(activeSigs);

  const canvas = document.createElement('canvas');
  renderCertificateToCanvas(canvas, participant, {
    schoolName: options.schoolName,
    lang: options.lang,
    theme,
    rank: rank || undefined,
    signatories: activeSigs,
    eventDate: options.eventDate
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 297mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 210mm

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  
  const cleanName = participant.name.replace(/[^a-zA-Z0-9\u0C80-\u0CFF]/g, '_');
  pdf.save(`Certificate_${participant.chestNo}_${cleanName}.pdf`);
}

/**
 * Downloads ALL registered participants' certificates in a single consolidated PDF booklet!
 * Top 3 receive respective Gold, Silver, and Bronze theme pages,
 * and all remaining participants receive Deep Emerald Green & Gold pages!
 */
export async function downloadAllCertificatesPDF(
  participants: Participant[],
  options: {
    schoolName: string;
    lang?: Language;
    signatories?: CertificateSignatory[];
    eventDate?: string;
    onProgress?: (current: number, total: number) => void;
  }
): Promise<void> {
  if (participants.length === 0) return;

  const activeSigs = options.signatories || DEFAULT_SIGNATORIES;
  await preloadSignatoryImages(activeSigs);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const canvas = document.createElement('canvas');

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    if (options.onProgress) {
      options.onProgress(i + 1, participants.length);
    }

    const { theme, rank } = getParticipantCertificateTheme(p, participants);

    renderCertificateToCanvas(canvas, p, {
      schoolName: options.schoolName,
      lang: options.lang,
      theme,
      rank: rank || undefined,
      signatories: activeSigs,
      eventDate: options.eventDate
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    if (i > 0) {
      pdf.addPage('a4', 'landscape');
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    
    await new Promise(r => setTimeout(r, 20));
  }

  const today = new Date().toISOString().slice(0, 10);
  pdf.save(`All_Participants_Certificates_KSPP_${today}.pdf`);
}
