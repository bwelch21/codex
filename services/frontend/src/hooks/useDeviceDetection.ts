import { useState, useEffect, useMemo } from "react";

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
  const initial = useMemo(() => {
    const ua = navigator.userAgent;
    const uaMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const uaTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android(?=.*(?!.*Mobile).*Safari)/i.test(ua);
    return { uaMobile, uaTablet };
  }, []);

  const getWidthBasedFlags = () => {
    const width = window.innerWidth;
    return {
      widthMobile: width < 640,
      widthTablet: width >= 640 && width < 1024,
    };
  };

  const [responsiveFlags, setResponsiveFlags] = useState(getWidthBasedFlags());

  useEffect(() => {
    const handleResize = () => setResponsiveFlags(getWidthBasedFlags());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prefer viewport-based flags for responsive behaviour
  const isMobile = responsiveFlags.widthMobile;
  const isTablet = responsiveFlags.widthTablet;
  const isDesktop = !isMobile && !isTablet;

  // Camera capability: use UA hint OR mediaDevices API
  const hasCamera =
    initial.uaMobile || (navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices);

  return {
    isMobile,
    isTablet,
    isDesktop,
    hasCamera,
  };
}
