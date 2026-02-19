import { BRAND_COLORS } from '../../utils/colors';
import { DRAWING_CONSTANTS } from './WheelConstants';

const {
  HUB_INNER_RATIO,
  HUB_STROKE_WIDTH,
  POINTER_HALF_WIDTH_PX,
  POINTER_HEIGHT_PX,
  POINTER_OFFSET_PX,
  POINTER_STROKE_WIDTH,
  SHADOW_BLUR_PX,
  MIN_LABEL_SIZE_PX,
  LABEL_SIZE_RATIO,
  TEXT_PADDING_PX,
  SEGMENT_STROKE_WIDTH,
  FONT_SIZE_DIVISOR,
} = DRAWING_CONSTANTS;

/**
 * Resets all shadow properties on a canvas context.
 */
const resetShadow = (ctx) => {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
};

/**
 * Truncates text to fit within a maximum pixel width.
 */
export const truncateText = (ctx, text, maxWidth) => {
  let width = ctx.measureText(text).width;
  if (width <= maxWidth) return text;

  let length = text.length;
  while (width > maxWidth && length > 0) {
    length--;
    const truncated = text.substring(0, length) + '...';
    width = ctx.measureText(truncated).width;
    if (width <= maxWidth) return truncated;
  }
  return text[0] + '...';
};

export const drawHub = (ctx, hubRadius, pixelRatio, activeColor) => {
  ctx.beginPath();
  ctx.arc(0, 0, hubRadius, 0, 2 * Math.PI);
  ctx.fillStyle = BRAND_COLORS.navy;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = SHADOW_BLUR_PX * pixelRatio;
  ctx.fill();
  resetShadow(ctx);

  ctx.strokeStyle = activeColor;
  ctx.lineWidth = HUB_STROKE_WIDTH * pixelRatio;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, hubRadius * HUB_INNER_RATIO, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
};

export const drawPointer = (ctx, radius, pixelRatio, activeColor) => {
  ctx.beginPath();
  const size = POINTER_HALF_WIDTH_PX * pixelRatio;
  const height = POINTER_HEIGHT_PX * pixelRatio;

  ctx.moveTo(size, -radius - (POINTER_OFFSET_PX * pixelRatio));
  ctx.lineTo(-size, -radius - (POINTER_OFFSET_PX * pixelRatio));
  ctx.lineTo(0, -radius + height);
  ctx.closePath();

  ctx.fillStyle = activeColor;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = SHADOW_BLUR_PX * pixelRatio;
  ctx.fill();
  resetShadow(ctx);

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = POINTER_STROKE_WIDTH * pixelRatio;
  ctx.stroke();
};

export const drawActiveLabel = (ctx, name, color, topSpace, pixelRatio) => {
  const indicatorY = topSpace / 2;
  ctx.translate(0, indicatorY);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const labelSize = Math.max(MIN_LABEL_SIZE_PX * pixelRatio, topSpace * LABEL_SIZE_RATIO);
  ctx.font = `800 ${labelSize}px sans-serif`;

  ctx.shadowColor = color;
  ctx.shadowBlur = TEXT_PADDING_PX * pixelRatio;
  ctx.fillStyle = color;
  ctx.fillText(name, 0, 0);
  resetShadow(ctx);

  ctx.lineWidth = POINTER_STROKE_WIDTH;
  ctx.strokeStyle = '#0f172a';
  ctx.strokeText(name, 0, 0);
  ctx.fillText(name, 0, 0);
};

export const drawSegment = (ctx, name, index, total, radius, hubRadius, colors, center, pixelRatio) => {
  const angle = (2 * Math.PI) / total;
  const startAngle = index * angle;
  const endAngle = (index + 1) * angle;

  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.arc(center.x, center.y, radius, startAngle, endAngle);
  ctx.fillStyle = colors[index % colors.length];
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = SEGMENT_STROKE_WIDTH * pixelRatio;
  ctx.stroke();

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate((index + 0.5) * angle);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';

  const fontSize = radius / FONT_SIZE_DIVISOR;
  ctx.font = `800 ${fontSize}px sans-serif`;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4 * pixelRatio;

  const textStart = hubRadius + (TEXT_PADDING_PX * pixelRatio);
  const margin = TEXT_PADDING_PX * pixelRatio;
  const maxTextWidth = radius - textStart - margin;
  const textToDisplay = truncateText(ctx, name, maxTextWidth);

  ctx.fillText(textToDisplay, textStart, 0);
  resetShadow(ctx);
  ctx.restore();
};
