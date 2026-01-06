import * as React from "react";

const MOBILE_BREAKPOINT = 768;

// Get initial value synchronously to prevent flash
const getIsMobile = () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;

export function useIsMobile() {
  // Initialize with actual value to prevent layout shift
  const [isMobile, setIsMobile] = React.useState<boolean>(getIsMobile);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
