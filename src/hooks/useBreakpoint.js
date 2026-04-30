import { useEffect, useState } from 'react';

const getWidth = () => (typeof window === 'undefined' ? 1024 : window.innerWidth);

export function useBreakpoint() {
  const [width, setWidth] = useState(getWidth);

  useEffect(() => {
    const handler = () => setWidth(getWidth());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return {
    width,
    isSmallPhone: width < 360,
    isMobile: width < 481,
    isTablet: width >= 481 && width < 768,
    isDesktop: width >= 768,
  };
}
