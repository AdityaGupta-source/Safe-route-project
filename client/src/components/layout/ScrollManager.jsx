import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Restores the browser behaviour a multi-page site got for free:
 * scroll to top on navigation, or to the #anchor when one is present.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a frame so the target section is mounted before scrolling.
      const id = hash.slice(1);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      });
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
