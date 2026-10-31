import type { CharacterPortrait, Worldview } from '../types';

/**
 * 离线图片生成服务
 * 使用 Canvas API 程序化绘制角色形象，完全不依赖网络
 * 根据世界观、性格标签、外貌描述生成风格化的角色海报
 */

interface WorldviewStyle {
  bgGradient: [string, string, string];
  accentColor: string;
  decorColor: string;
  pattern: 'palace' | 'apocalypse' | 'cultivation';
  fontStyle: string;
}

const WORLDVIEW_STYLES: Record<string, WorldviewStyle> = {
  palace: {
    bgGradient: ['#2c1810', '#8b4513', '#d4a574'],
    accentColor: '#f1c40f',
    decorColor: '#c0392b',
    pattern: 'palace',
    fontStyle: 'serif',
  },
  apocalypse: {
    bgGradient: ['#0a0a0a', '#2c3e50', '#7f8c8d'],
    accentColor: '#e74c3c',
    decorColor: '#f39c12',
    pattern: 'apocalypse',
    fontStyle: 'sans-serif',
  },
  cultivation: {
    bgGradient: ['#0d1f1a', '#1a4d3e', '#3d8b6e'],
    accentColor: '#2ecc71',
    decorColor: '#ecf0f1',
    pattern: 'cultivation',
    fontStyle: 'serif',
  },
};

// 性格标签对应的视觉元素
const TRAIT_VISUALS: Record<string, { symbol: string; pose: string }> = {
  cautious: { symbol: '◈', pose: '侧身沉思' },
  decisive: { symbol: '⚔', pose: '正面挺立' },
  scheming: { symbol: '◉', pose: '半侧脸' },
  kind: { symbol: '❀', pose: '微笑正面' },
  ambitious: { symbol: '▲', pose: '仰望姿态' },
  loyal: { symbol: '♡', pose: '坚定正面' },
};

/**
 * 生成离线角色图片（Canvas 程序化绘制）
 * 返回 data URL，可直接用于 <img src>
 */
export function generateOfflineCharacterImage(params: {
  worldview: Worldview;
  characterPortrait: CharacterPortrait;
}): string {
  const width = 512;
  const height = 768;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const style = WORLDVIEW_STYLES[params.worldview.id] ?? WORLDVIEW_STYLES.cultivation;
  const portrait = params.characterPortrait;

  // 1. 绘制背景渐变
  drawBackground(ctx, width, height, style);

  // 2. 绘制世界观装饰图案
  drawWorldviewPattern(ctx, width, height, style);

  // 3. 绘制角色剪影
  drawCharacterSilhouette(ctx, width, height, style, portrait);

  // 4. 绘制角色名和标签
  drawCharacterInfo(ctx, width, height, style, portrait);

  return canvas.toDataURL('image/jpeg', 0.85);
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: WorldviewStyle,
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, style.bgGradient[0]);
  gradient.addColorStop(0.5, style.bgGradient[1]);
  gradient.addColorStop(1, style.bgGradient[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // 添加纹理噪点
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawWorldviewPattern(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: WorldviewStyle,
) {
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = style.accentColor;
  ctx.lineWidth = 1;

  if (style.pattern === 'palace') {
    // 宫廷：绘制宫殿屋顶轮廓
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.35);
    ctx.lineTo(w * 0.2, h * 0.25);
    ctx.lineTo(w * 0.3, h * 0.35);
    ctx.lineTo(w * 0.5, h * 0.2);
    ctx.lineTo(w * 0.7, h * 0.35);
    ctx.lineTo(w * 0.8, h * 0.25);
    ctx.lineTo(w * 0.9, h * 0.35);
    ctx.stroke();
    // 祥云装饰
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(w * (0.15 + i * 0.18), h * 0.15, 15 + Math.random() * 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (style.pattern === 'apocalypse') {
    // 末世：绘制废墟轮廓
    ctx.fillStyle = style.accentColor;
    for (let i = 0; i < 8; i++) {
      const bx = w * (0.05 + i * 0.12);
      const bh = h * (0.1 + Math.random() * 0.2);
      ctx.fillRect(bx, h * 0.6 - bh, w * 0.08, bh);
    }
    // 裂纹
    ctx.beginPath();
    ctx.moveTo(w * 0.3, 0);
    ctx.lineTo(w * 0.4, h * 0.3);
    ctx.lineTo(w * 0.35, h * 0.5);
    ctx.lineTo(w * 0.45, h * 0.7);
    ctx.stroke();
  } else {
    // 修仙：绘制山峦和云雾
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5);
    ctx.lineTo(w * 0.2, h * 0.3);
    ctx.lineTo(w * 0.35, h * 0.45);
    ctx.lineTo(w * 0.5, h * 0.25);
    ctx.lineTo(w * 0.65, h * 0.4);
    ctx.lineTo(w * 0.8, h * 0.28);
    ctx.lineTo(w, h * 0.45);
    ctx.stroke();
    // 云雾圆圈
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(w * (0.1 + i * 0.15), h * (0.55 + Math.sin(i) * 0.05), 25 + Math.random() * 15, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCharacterSilhouette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: WorldviewStyle,
  portrait: CharacterPortrait,
) {
  const cx = w / 2;
  const cy = h * 0.42;

  // 光晕效果
  const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 180);
  glow.addColorStop(0, style.accentColor + '40');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // 角色剪影（头部 + 肩部）
  ctx.save();
  ctx.fillStyle = style.decorColor;
  ctx.globalAlpha = 0.9;

  // 头部
  ctx.beginPath();
  ctx.arc(cx, cy - 40, 55, 0, Math.PI * 2);
  ctx.fill();

  // 肩部/身体
  ctx.beginPath();
  ctx.moveTo(cx - 90, cy + 120);
  ctx.quadraticCurveTo(cx - 100, cy + 20, cx - 55, cy + 10);
  ctx.lineTo(cx + 55, cy + 10);
  ctx.quadraticCurveTo(cx + 100, cy + 20, cx + 90, cy + 120);
  ctx.closePath();
  ctx.fill();

  // 性格符号
  const mainTag = portrait.personalityTags[0] ?? '';
  const visual = Object.values(TRAIT_VISUALS).find((v) =>
    mainTag.includes(v.pose.slice(0, 2)),
  ) ?? TRAIT_VISUALS.kind;

  ctx.fillStyle = style.bgGradient[0];
  ctx.font = 'bold 48px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(visual.symbol, cx, cy - 40);

  ctx.restore();
}

function drawCharacterInfo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: WorldviewStyle,
  portrait: CharacterPortrait,
) {
  const cx = w / 2;

  // 底部信息卡片背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, h * 0.68, w, h * 0.32);

  // 装饰线
  ctx.strokeStyle = style.accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h * 0.68);
  ctx.lineTo(w * 0.9, h * 0.68);
  ctx.stroke();

  // 角色名
  ctx.fillStyle = style.accentColor;
  ctx.font = `bold 36px ${style.fontStyle}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(portrait.name, cx, h * 0.71);

  // 外貌描述（截断）
  ctx.fillStyle = '#ecf0f1';
  ctx.font = `16px ${style.fontStyle}`;
  const appearance = portrait.appearance.length > 30
    ? portrait.appearance.slice(0, 30) + '...'
    : portrait.appearance;
  ctx.fillText(appearance, cx, h * 0.78);

  // 性格标签
  const tags = portrait.personalityTags.slice(0, 4);
  const tagWidth = 90;
  const totalWidth = tags.length * tagWidth;
  const startX = cx - totalWidth / 2;

  tags.forEach((tag, i) => {
    const tx = startX + i * tagWidth + tagWidth / 2;
    ctx.fillStyle = style.accentColor + '30';
    ctx.strokeStyle = style.accentColor;
    ctx.lineWidth = 1;
    roundRect(ctx, tx - 40, h * 0.84, 80, 28, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `13px ${style.fontStyle}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, tx, h * 0.84 + 14);
  });

  // 世界观标识
  ctx.fillStyle = style.decorColor;
  ctx.font = `14px ${style.fontStyle}`;
  ctx.globalAlpha = 0.7;
  ctx.fillText(`— ${portrait.background.slice(0, 20)} —`, cx, h * 0.93);
  ctx.globalAlpha = 1;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * 检测当前是否在线
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}
