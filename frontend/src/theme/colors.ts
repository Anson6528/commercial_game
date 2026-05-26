/**
 * 星际货运垄断者 — 色彩体系 (GA-13)
 *
 * 硬核科幻 HUD 风格，鹰角网络式科技平面：
 * - 深空背景 + 科技蓝主色 + 青绿强调 + 黄橙警告 + 玫红危险
 * - FE-Core 通过 import { colors } from 'theme/colors' 统一引用
 */

const colors = {
  /* ---- 背景 ---- */
  bg: {
    deep: '#0a0f1e',
    void: '#0d0b14',
    panel: 'rgba(10,15,30,0.85)',
    overlay: 'rgba(0,0,0,0.7)',
    paper: '#101423',
  },

  /* ---- 主色系 ---- */
  primary: '#00d4ff',       // 科技蓝（主强调色）
  accent: '#05ffa1',        // 青绿（成功/利润/垄断）
  warning: '#ff9f1c',       // 黄橙（违禁品/警告）
  danger: '#ff2a6d',        // 玫红（通缉/错误/锁定/封锁）

  /* ---- 灰度 ---- */
  white: '#ffffff',
  text: '#a0b0c0',
  muted: '#5a6a7a',

  /* ---- 边框与发光 ---- */
  border: 'rgba(0,212,255,0.15)',
  borderHover: 'rgba(0,212,255,0.4)',
  glow: 'rgba(0,212,255,0.15)',
  glowStrong: 'rgba(0,212,255,0.3)',

  /* ---- 语义别名 ---- */
  buy: '#05ffa1',
  sell: '#ff2a6d',
  locked: '#ff2a6d',
  contraband: '#ff9f1c',
} as const;

export default colors;
