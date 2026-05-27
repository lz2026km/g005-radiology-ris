/**
 * Film Print Watermark System
 * G005 Radiology RIS System
 * S9: Dynamic watermarks for film printing
 */
import { WatermarkConfig, FilmPrintConfig } from '../types';

/**
 * Default watermark configuration
 */
export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  enabled: true,
  patientName: true,
  examDate: true,
  reportDate: false,
  hospitalName: false,
  customText: '',
  opacity: 0.15,
  position: 'diagonal',
};

/**
 * Default film print configuration
 */
export const DEFAULT_FILM_PRINT_CONFIG: FilmPrintConfig = {
  filmSize: '14x14',
  orientation: 'portrait',
  layout: '2x2',
  brightness: 0,
  contrast: 0,
  watermark: DEFAULT_WATERMARK_CONFIG,
  copies: 1,
};

/**
 * Generate watermark text based on configuration
 */
export function generateWatermarkText(
  patientName: string,
  examDate: string,
  config: WatermarkConfig
): string {
  if (!config.enabled) return '';

  const parts: string[] = [];

  if (config.patientName && patientName) {
    parts.push(patientName);
  }
  if (config.examDate && examDate) {
    // Format date as YYYY-MM-DD
    const date = new Date(examDate);
    parts.push(formatDate(date));
  }
  if (config.reportDate) {
    parts.push(formatDate(new Date()));
  }
  if (config.hospitalName) {
    parts.push('汉东省人民医院');
  }
  if (config.customText) {
    parts.push(config.customText);
  }

  return parts.join(' | ');
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate watermark position based on film size and position setting
 */
export function calculateWatermarkPosition(
  filmWidth: number,
  filmHeight: number,
  textWidth: number,
  textHeight: number,
  position: 'center' | 'corner' | 'diagonal'
): { x: number; y: number; rotation: number } {
  switch (position) {
    case 'center':
      return {
        x: (filmWidth - textWidth) / 2,
        y: (filmHeight - textHeight) / 2,
        rotation: -30,
      };
    case 'corner':
      return {
        x: 50,
        y: 50,
        rotation: -45,
      };
    case 'diagonal':
    default:
      return {
        x: filmWidth * 0.1,
        y: filmHeight * 0.3,
        rotation: -30,
      };
  }
}

/**
 * SVG watermark filter for film printing
 */
export function createWatermarkSvg(
  text: string,
  filmWidth: number,
  filmHeight: number,
  config: WatermarkConfig
): string {
  if (!config.enabled || !text) {
    return '';
  }

  const { x, y, rotation } = calculateWatermarkPosition(
    filmWidth,
    filmHeight,
    text.length * 10,
    40,
    config.position
  );

  return `
    <svg width="${filmWidth}" height="${filmHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="watermarkBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>
      <text
        x="${x}"
        y="${y}"
        font-family="SimHei, Microsoft YaHei, Arial"
        font-size="24"
        fill="black"
        fill-opacity="${config.opacity}"
        transform="rotate(${rotation}, ${filmWidth / 2}, ${filmHeight / 2})"
        filter="url(#watermarkBlur)"
      >
        ${escapeXml(text)}
      </text>
      <text
        x="${filmWidth - x - text.length * 10}"
        y="${filmHeight - y}"
        font-family="SimHei, Microsoft YaHei, Arial"
        font-size="24"
        fill="black"
        fill-opacity="${config.opacity}"
        transform="rotate(${rotation}, ${filmWidth / 2}, ${filmHeight / 2})"
        filter="url(#watermarkBlur)"
      >
        ${escapeXml(text)}
      </text>
    </svg>
  `.trim();
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Apply watermark to print job data
 */
export function applyWatermarkToPrintJob(
  printData: {
    patientName: string;
    examDate: string;
    images: string[];
  },
  config: FilmPrintConfig
): {
  images: string[];
  overlaySvg: string;
} {
  if (!config.watermark.enabled) {
    return {
      images: printData.images,
      overlaySvg: '',
    };
  }

  const watermarkText = generateWatermarkText(
    printData.patientName,
    printData.examDate,
    config.watermark
  );

  // Calculate film dimensions based on size (in pixels at 300 DPI)
  const filmSizes: Record<string, { width: number; height: number }> = {
    '8x10': { width: 2400, height: 3000 },
    '10x12': { width: 3000, height: 3600 },
    '11x14': { width: 3300, height: 4200 },
    '14x14': { width: 4200, height: 4200 },
  };

  const filmSize = filmSizes[config.filmSize] || filmSizes['14x14'];

  const overlaySvg = createWatermarkSvg(
    watermarkText,
    config.orientation === 'landscape' ? filmSize.height : filmSize.width,
    config.orientation === 'landscape' ? filmSize.width : filmSize.height,
    config.watermark
  );

  return {
    images: printData.images,
    overlaySvg,
  };
}

/**
 * Preview watermark on canvas
 */
export function renderWatermarkPreview(
  ctx: CanvasRenderingContext2D,
  text: string,
  config: WatermarkConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (!config.enabled || !text) return;

  ctx.save();
  
  // Set up watermark style
  ctx.globalAlpha = config.opacity;
  ctx.font = '24px SimHei, Microsoft YaHei';
  ctx.fillStyle = 'black';
  
  // Calculate position
  const { x, y, rotation } = calculateWatermarkPosition(
    canvasWidth,
    canvasHeight,
    text.length * 12,
    30,
    config.position
  );

  // Apply rotation
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-canvasWidth / 2, -canvasHeight / 2);

  // Draw watermark text
  ctx.fillText(text, x, y);
  
  // Draw a second instance for better coverage
  ctx.fillText(text, canvasWidth - x - text.length * 12, canvasHeight - y);

  ctx.restore();
}

/**
 * Get film size in inches
 */
export function getFilmSizeInches(filmSize: FilmPrintConfig['filmSize']): { width: number; height: number } {
  const sizes: Record<string, { width: number; height: number }> = {
    '8x10': { width: 8, height: 10 },
    '10x12': { width: 10, height: 12 },
    '11x14': { width: 11, height: 14 },
    '14x14': { width: 14, height: 14 },
  };
  return sizes[filmSize] || sizes['14x14'];
}

/**
 * Calculate pixels for print at 300 DPI
 */
export function getFilmSizePixels(filmSize: FilmPrintConfig['filmSize']): { width: number; height: number } {
  const inches = getFilmSizeInches(filmSize);
  return {
    width: Math.round(inches.width * 300),
    height: Math.round(inches.height * 300),
  };
}