import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export function useResponsive() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [height, setHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 768);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const breakpoint: Breakpoint = width >= BREAKPOINTS.xl ? 'xl' : width >= BREAKPOINTS.lg ? 'lg' : width >= BREAKPOINTS.md ? 'md' : width >= BREAKPOINTS.sm ? 'sm' : 'xs';
  const deviceType: DeviceType = width < BREAKPOINTS.md ? 'mobile' : width < BREAKPOINTS.lg ? 'tablet' : 'desktop';

  return {
    width, height,
    breakpoint, deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isTouchDevice: typeof window !== 'undefined' && 'ontouchstart' in window,
    isLandscape: width > height,
    isPortrait: height > width,
  };
}
