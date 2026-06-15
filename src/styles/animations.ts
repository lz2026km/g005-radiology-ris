export const ANIMATIONS = {
  fadeIn: 'fadeIn 0.3s ease',
  fadeInUp: 'fadeInUp 0.3s ease',
  fadeInScale: 'fadeInScale 0.3s ease',
  slideInLeft: 'slideInLeft 0.3s ease',
  slideInRight: 'slideInRight 0.3s ease',
  pulse: 'pulse 2s ease-in-out infinite',
  shimmer: 'shimmer 1.5s infinite linear',
  spin: 'spin 0.8s linear infinite',
  shake: 'shake 0.3s ease',
} as const;

export const TRANSITIONS = {
  fade: 'opacity 0.2s ease',
  scale: 'transform 0.2s ease',
  bg: 'background-color 0.2s ease',
  all: 'all 0.2s ease',
  width: 'width 0.2s ease',
  height: 'max-height 0.3s ease',
} as const;

export const ANIMATION_DURATION = {
  fast: '0.15s',
  normal: '0.2s',
  slow: '0.3s',
  verySlow: '0.5s',
} as const;
