import { useLayoutEffect } from 'react';
import gsap from 'gsap';

/**
 * The subtle card/input entrance shared by the login and register screens.
 * Accepts the scope element ref so GSAP selectors stay contained to that page.
 */
export function useGsapFadeIn(scopeRef) {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(scopeRef.current, { opacity: 1, duration: 0.8, ease: 'power2.out' });

      gsap.from('[data-anim="card"]', {
        y: 15,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.1,
      });

      gsap.from('[data-anim="field"]', {
        y: 10,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.3,
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [scopeRef]);
}
