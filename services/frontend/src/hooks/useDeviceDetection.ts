import { useMemo } from 'react';

export interface DeviceDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasCamera: boolean;
}

/**
 * Custom hook for detecting device type and capabilities
 * @returns Object with device detection flags
 */
export function useDeviceDetection(): DeviceDetection {
  return useMemo(() => {
    const userAgent = navigator.userAgent;
    
    // Mobile device detection
    const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Tablet detection (more specific than mobile)
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android(?=.*(?!.*Mobile).*Safari)/i.test(userAgent);
    
    // Desktop detection (anything that's not mobile or tablet)
    const isDesktop = !isMobile && !isTablet;
    
    // Camera capability detection (available on most mobile devices and some desktops)
    const hasCamera = isMobile || (navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices);
    
    return {
      isMobile,
      isTablet,
      isDesktop,
      hasCamera,
    };
  }, []);
} 