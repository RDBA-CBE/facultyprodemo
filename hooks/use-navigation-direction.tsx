// hooks/use-navigation-direction.js
"use client";

import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const useNavigationDirection = () => {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const isBackward = useRef(false);

  useEffect(() => {
    // Compare the current pathname with the previous one
    if (previousPathname.current !== pathname) {
      // This is a simplistic approach. A more robust method might use a history stack.
      // It assumes any new navigation is forward, and the back button is backward.
      // In a real app, you might use a context or a global state to manage this more accurately.
      isBackward.current = false; // Default assumption
      
      // Update the ref for the next render
      previousPathname.current = pathname;
    }

    // Listen for popstate event (triggered by back/forward buttons)
    const handlePopstate = () => {
      isBackward.current = true;
    };

    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [pathname]);

  return isBackward.current;
};