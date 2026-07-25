import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Centered dialog with the back.out entrance the profile page used.
 * Stays mounted through the exit tween, then unmounts.
 */
export default function GsapModal({ open, onClose, className = '', children }) {
  const [mounted, setMounted] = useState(open);
  const panelRef = useRef(null);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!mounted || !panelRef.current) return undefined;
    const panel = panelRef.current;

    if (open) {
      gsap.fromTo(
        panel,
        { opacity: 0, xPercent: -50, yPercent: -60, scale: 0.9 },
        { opacity: 1, xPercent: -50, yPercent: -50, scale: 1, duration: 0.3, ease: 'back.out(1.7)' },
      );
      return undefined;
    }

    const tween = gsap.to(panel, {
      opacity: 0,
      xPercent: -50,
      yPercent: -60,
      scale: 0.9,
      duration: 0.2,
      onComplete: () => setMounted(false),
    });

    return () => tween.kill();
  }, [open, mounted]);

  if (!mounted) return null;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/70 z-[2000] transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        ref={panelRef}
        className={`glass fixed top-1/2 left-1/2 z-[2001] w-[90%] p-8 rounded-2xl ${className}`}
      >
        {children}
      </div>
    </>
  );
}
