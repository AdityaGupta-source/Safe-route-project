import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/** Full-screen "Navigating to Safe Zone..." interstitial shown before the map loads. */
export default function TransitionOverlay({ active, message = 'Navigating to Safe Zone...' }) {
  const overlayRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    const ctx = gsap.context(() => {
      gsap.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: 'all',
        duration: 0.4,
        ease: 'power2.inOut',
      });

      gsap.fromTo(
        iconRef.current,
        { scale: 0.9, opacity: 0.8 },
        { scale: 1.1, opacity: 1, duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut' },
      );

      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.2 },
      );
    });

    return () => ctx.revert();
  }, [active]);

  return (
    <div
      ref={overlayRef}
      className="fixed top-0 left-0 w-full h-full bg-dark z-[2000] flex items-center justify-center opacity-0 pointer-events-none"
    >
      <div className="text-center">
        <i
          ref={iconRef}
          className="fa-solid fa-earth-asia text-[5rem] max-[480px]:text-5xl text-primary mb-5 block"
        />
        <h2 ref={textRef} className="text-[2rem] max-[480px]:text-2xl text-white">
          {message}
        </h2>
      </div>
    </div>
  );
}
